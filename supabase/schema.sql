-- Supabase schema for WTG Nicosia
-- Apply with: supabase db push (or run via SQL)

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('user', 'owner', 'admin', 'moderator');
create type public.crowd_level as enum ('quiet', 'chill', 'busy', 'packed');
create type public.vote_status as enum ('yes', 'maybe', 'no');
create type public.event_status as enum ('published', 'draft', 'cancelled');
create type public.event_interest_status as enum ('interested', 'going');
create type public.deal_status as enum ('published', 'draft', 'expired');
create type public.placement_slot as enum ('home', 'map', 'events');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled');
create type public.guest_entry_status as enum ('pending', 'confirmed', 'arrived', 'cancelled');
create type public.report_status as enum ('open', 'reviewed', 'blocked');
create type public.report_target as enum ('venue', 'event', 'user', 'message');

-- Helper function for role checks
create or replace function public.is_role(target_roles text[])
returns boolean language sql stable security definer
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = any(target_roles)
  );
$$;

grant execute on function public.is_role(text[]) to authenticated;

grant usage on schema public to authenticated, anon;

-- Users profile table linked to auth.users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  university text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);
create index users_role_idx on public.users(role);

-- Reference tables
create table public.vibe_tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create table public.music_tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  discount_percent numeric(5,2),
  max_uses int,
  created_at timestamptz not null default now()
);

-- Core domain tables
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  geo_lat double precision,
  geo_lng double precision,
  tags text[] default '{}',
  status text not null default 'active',
  cover_url text,
  owner_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index venues_owner_idx on public.venues(owner_id);
create index venues_geo_idx on public.venues(geo_lat, geo_lng);

create table public.venue_status (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  crowd_level public.crowd_level,
  wait_time_minutes smallint,
  music_tag text,
  vibe_note text,
  updated_by uuid references public.users(id) on delete set null,
  expires_at timestamptz default (now() + interval '2 hours'),
  updated_at timestamptz not null default now()
);
create unique index venue_status_unique_venue on public.venue_status(venue_id);
create index venue_status_venue_idx on public.venue_status(venue_id);
create index venue_status_updated_idx on public.venue_status(updated_at);

create table public.venue_votes (
  user_id uuid not null references public.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  status public.vote_status not null,
  created_at timestamptz not null default now(),
  primary key (user_id, venue_id)
);
create index venue_votes_status_idx on public.venue_votes(status);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete set null,
  title text not null,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  price_range text,
  cover_url text,
  status public.event_status not null default 'published',
  created_at timestamptz not null default now()
);
create index events_status_idx on public.events(status);
create index events_start_idx on public.events(start_at);

create table public.event_interest (
  user_id uuid not null references public.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status public.event_interest_status not null,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table public.favorites (
  user_id uuid not null references public.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, venue_id)
);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  mood_tag text,
  short_note text,
  rating_smallint smallint,
  created_at timestamptz not null default now()
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  price_text text,
  status public.deal_status not null default 'draft',
  student_only boolean default false,
  created_at timestamptz not null default now()
);
create index deals_status_idx on public.deals(status);

create table public.sponsored_listings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  placement public.placement_slot not null,
  bid_amount numeric(10,2),
  created_at timestamptz not null default now()
);
create index sponsored_placement_idx on public.sponsored_listings(placement);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  slots_int smallint not null default 1,
  status public.booking_status not null default 'pending',
  external_ref text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index bookings_user_idx on public.bookings(user_id);
create index bookings_venue_idx on public.bookings(venue_id);

create table public.guest_list_entries (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  party_size_smallint smallint not null default 1,
  status public.guest_entry_status not null default 'pending',
  confirmation_code text unique,
  created_at timestamptz not null default now()
);
create index guest_list_venue_idx on public.guest_list_entries(venue_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  target_type public.report_target not null,
  target_id uuid not null,
  reason text,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now()
);
create index reports_status_idx on public.reports(status);

-- Chat scaffolding
create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.chat_members (
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.chat_rooms(id) on delete cascade,
  sender_id uuid references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index chat_messages_room_idx on public.chat_messages(room_id);

-- Views
create view public.venue_trending as
select v.id,
       v.name,
       v.address,
       v.city,
       v.geo_lat,
       v.geo_lng,
       v.cover_url,
       coalesce(sum(case when vv.status = 'yes' then 1 else 0 end),0) as yes_votes_last24h,
       coalesce(sum(case when vv.status = 'maybe' then 1 else 0 end),0) as maybe_votes_last24h,
       ls.crowd_level,
       ls.wait_time_minutes,
       ls.music_tag,
       ls.vibe_note,
       ls.updated_at as last_status_at
from public.venues v
left join public.venue_votes vv on vv.venue_id = v.id and vv.created_at > now() - interval '24 hours'
left join lateral (
  select vs.crowd_level, vs.wait_time_minutes, vs.music_tag, vs.vibe_note, vs.updated_at
  from public.venue_status vs
  where vs.venue_id = v.id
  order by vs.updated_at desc
  limit 1
) ls on true
where v.status = 'active'
group by v.id, ls.crowd_level, ls.wait_time_minutes, ls.music_tag, ls.vibe_note, ls.updated_at;

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('venue-media', 'venue-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true)
on conflict (id) do nothing;

-- Storage policies (simple, tighten later)
create policy "avatars read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars insert" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "avatars update" on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "avatars delete" on storage.objects for delete
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "venue-media public read" on storage.objects for select using (bucket_id = 'venue-media');
create policy "venue-media write" on storage.objects for insert with check (bucket_id = 'venue-media' and auth.role() = 'authenticated');
create policy "event-media public read" on storage.objects for select using (bucket_id = 'event-media');
create policy "event-media write" on storage.objects for insert with check (bucket_id = 'event-media' and auth.role() = 'authenticated');

-- RLS enablement
alter table public.users enable row level security;
alter table public.venues enable row level security;
alter table public.venue_status enable row level security;
alter table public.venue_votes enable row level security;
alter table public.events enable row level security;
alter table public.event_interest enable row level security;
alter table public.favorites enable row level security;
alter table public.check_ins enable row level security;
alter table public.deals enable row level security;
alter table public.sponsored_listings enable row level security;
alter table public.bookings enable row level security;
alter table public.guest_list_entries enable row level security;
alter table public.reports enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.vibe_tags enable row level security;
alter table public.music_tags enable row level security;
alter table public.promo_codes enable row level security;

-- Users policies
create policy "users select self" on public.users for select using (auth.uid() = id);
create policy "users insert self" on public.users for insert with check (auth.uid() = id);
create policy "users update self" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

-- Venues
create policy "venues read all" on public.venues for select using (true);
create policy "venues write owner" on public.venues for insert with check (public.is_role(array['owner','admin']));
create policy "venues update owner" on public.venues for update using (public.is_role(array['owner','admin'])) with check (public.is_role(array['owner','admin']));

-- Venue status
create policy "venue_status read all" on public.venue_status for select using (true);
create policy "venue_status insert owner" on public.venue_status for insert with check (
  public.is_role(array['owner','admin']) or
  exists (select 1 from public.venues v where v.id = venue_status.venue_id and v.owner_id = auth.uid())
);
create policy "venue_status update owner" on public.venue_status for update using (
  public.is_role(array['owner','admin']) or
  exists (select 1 from public.venues v where v.id = venue_status.venue_id and v.owner_id = auth.uid())
) with check (
  public.is_role(array['owner','admin']) or
  exists (select 1 from public.venues v where v.id = venue_status.venue_id and v.owner_id = auth.uid())
);

-- Venue votes
create policy "venue_votes read own" on public.venue_votes for select using (auth.uid() = user_id);
create policy "venue_votes upsert own" on public.venue_votes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Events
create policy "events read all" on public.events for select using (true);
create policy "events write owner" on public.events for insert with check (public.is_role(array['owner','admin']));
create policy "events update owner" on public.events for update using (public.is_role(array['owner','admin'])) with check (public.is_role(array['owner','admin']));

-- Event interest
create policy "event_interest read own" on public.event_interest for select using (auth.uid() = user_id);
create policy "event_interest upsert own" on public.event_interest for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Favorites
create policy "favorites read own" on public.favorites for select using (auth.uid() = user_id);
create policy "favorites upsert own" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Check-ins
create policy "check_ins read own" on public.check_ins for select using (auth.uid() = user_id);
create policy "check_ins write own" on public.check_ins for insert with check (auth.uid() = user_id);

-- Deals
create policy "deals read all" on public.deals for select using (true);
create policy "deals write owner" on public.deals for insert with check (public.is_role(array['owner','admin']));
create policy "deals update owner" on public.deals for update using (public.is_role(array['owner','admin'])) with check (public.is_role(array['owner','admin']));

-- Sponsored listings
create policy "sponsored read all" on public.sponsored_listings for select using (true);
create policy "sponsored write owner" on public.sponsored_listings for insert with check (public.is_role(array['owner','admin']));
create policy "sponsored update owner" on public.sponsored_listings for update using (public.is_role(array['owner','admin'])) with check (public.is_role(array['owner','admin']));

-- Bookings
create policy "bookings read own" on public.bookings for select using (
  auth.uid() = user_id or
  exists (select 1 from public.venues v where v.id = bookings.venue_id and v.owner_id = auth.uid()) or
  public.is_role(array['admin'])
);
create policy "bookings insert own" on public.bookings for insert with check (auth.uid() = user_id);
create policy "bookings update own or owner" on public.bookings for update using (
  auth.uid() = user_id or
  exists (select 1 from public.venues v where v.id = bookings.venue_id and v.owner_id = auth.uid()) or
  public.is_role(array['admin'])
);

-- Guest list entries
create policy "guest_list read own or owner" on public.guest_list_entries for select using (
  auth.uid() = user_id or
  exists (select 1 from public.venues v where v.id = guest_list_entries.venue_id and v.owner_id = auth.uid()) or
  public.is_role(array['admin'])
);
create policy "guest_list insert own" on public.guest_list_entries for insert with check (auth.uid() = user_id);
create policy "guest_list update own or owner" on public.guest_list_entries for update using (
  auth.uid() = user_id or
  exists (select 1 from public.venues v where v.id = guest_list_entries.venue_id and v.owner_id = auth.uid()) or
  public.is_role(array['admin'])
);

-- Reports
create policy "reports read own or mod" on public.reports for select using (
  auth.uid() = user_id or public.is_role(array['admin','moderator'])
);
create policy "reports insert own" on public.reports for insert with check (auth.uid() = user_id);
create policy "reports update mod" on public.reports for update using (public.is_role(array['admin','moderator']));

-- Chat
create policy "chat_rooms read all" on public.chat_rooms for select using (true);
create policy "chat_rooms write admin" on public.chat_rooms for insert with check (public.is_role(array['admin','owner']));

create policy "chat_members read own" on public.chat_members for select using (auth.uid() = user_id);
create policy "chat_members write own" on public.chat_members for insert with check (auth.uid() = user_id);

create policy "chat_messages read room members" on public.chat_messages for select using (
  exists (select 1 from public.chat_members cm where cm.room_id = chat_messages.room_id and cm.user_id = auth.uid())
);
create policy "chat_messages write room members" on public.chat_messages for insert with check (
  exists (select 1 from public.chat_members cm where cm.room_id = chat_messages.room_id and cm.user_id = auth.uid())
);

-- Vibe/music tags
create policy "vibe_tags read all" on public.vibe_tags for select using (true);
create policy "music_tags read all" on public.music_tags for select using (true);
create policy "promo_codes read all" on public.promo_codes for select using (true);
create policy "vibe_tags admin write" on public.vibe_tags for insert with check (public.is_role(array['admin']));
create policy "music_tags admin write" on public.music_tags for insert with check (public.is_role(array['admin']));
create policy "promo_codes admin write" on public.promo_codes for insert with check (public.is_role(array['admin']));

-- Seed role claim helper (optional)
comment on column public.users.role is 'role used for policy checks (user, owner, admin, moderator)';

-- RPC: upsert_vote
create or replace function public.upsert_vote(p_venue_id uuid, p_status public.vote_status)
returns public.venue_votes
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.venue_votes;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  insert into public.venue_votes (user_id, venue_id, status)
  values (uid, p_venue_id, p_status)
  on conflict (user_id, venue_id) do update set status = excluded.status, created_at = now()
  returning * into result;
  return result;
end;
$$;
grant execute on function public.upsert_vote(uuid, public.vote_status) to authenticated;

-- RPC: set_event_interest
create or replace function public.set_event_interest(p_event_id uuid, p_status public.event_interest_status)
returns public.event_interest
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.event_interest;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  insert into public.event_interest (user_id, event_id, status)
  values (uid, p_event_id, p_status)
  on conflict (user_id, event_id) do update set status = excluded.status, created_at = now()
  returning * into result;
  return result;
end;
$$;
grant execute on function public.set_event_interest(uuid, public.event_interest_status) to authenticated;

-- RPC: toggle_favorite
create or replace function public.toggle_favorite(p_venue_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  exists_row boolean;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  select true into exists_row from public.favorites where user_id = uid and venue_id = p_venue_id;
  if exists_row then
    delete from public.favorites where user_id = uid and venue_id = p_venue_id;
  else
    insert into public.favorites (user_id, venue_id) values (uid, p_venue_id)
    on conflict (user_id, venue_id) do nothing;
  end if;
end;
$$;
grant execute on function public.toggle_favorite(uuid) to authenticated;

-- RPC: upsert_venue_status
create or replace function public.upsert_venue_status(p_venue_id uuid, p_crowd public.crowd_level, p_wait int, p_music text, p_vibe text)
returns public.venue_status
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.venue_status;
  is_owner boolean;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  select exists(select 1 from public.venues v where v.id = p_venue_id and v.owner_id = uid) into is_owner;
  if not (is_owner or public.is_role(array['admin'])) then
    raise exception 'Not authorized';
  end if;
  insert into public.venue_status (venue_id, crowd_level, wait_time_minutes, music_tag, vibe_note, updated_by, updated_at)
  values (p_venue_id, p_crowd, p_wait, p_music, p_vibe, uid, now())
  on conflict (venue_id) do update
    set crowd_level = excluded.crowd_level,
        wait_time_minutes = excluded.wait_time_minutes,
        music_tag = excluded.music_tag,
        vibe_note = excluded.vibe_note,
        updated_by = excluded.updated_by,
        updated_at = now(),
        expires_at = now() + interval '2 hours'
  returning * into result;
  return result;
end;
$$;
grant execute on function public.upsert_venue_status(uuid, public.crowd_level, int, text, text) to authenticated;

-- RPC: create_booking
create or replace function public.create_booking(p_event_id uuid, p_venue_id uuid, p_party_size int)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.bookings;
  max_party int := 10; -- default cap; adjust from CONFIG_INPUTS.md when available
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_party_size is null or p_party_size < 1 then
    raise exception 'Invalid party size';
  end if;
  if p_party_size > max_party then
    raise exception 'Party size exceeds allowed maximum of %', max_party;
  end if;
  insert into public.bookings (user_id, event_id, venue_id, slots_int, status)
  values (uid, p_event_id, p_venue_id, p_party_size, 'pending')
  returning * into result;
  return result;
end;
$$;
grant execute on function public.create_booking(uuid, uuid, int) to authenticated;

-- RPC: trending venues (security definer to allow aggregate despite RLS)
create or replace function public.get_trending_venues()
returns setof public.venue_trending
language sql
security definer
set search_path = public
as $$ select * from public.venue_trending; $$;
grant execute on function public.get_trending_venues() to anon, authenticated;

-- RPC: upcoming events with interest counts
create or replace function public.get_upcoming_events()
returns table (
  id uuid,
  venue_id uuid,
  title text,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  price_range text,
  cover_url text,
  status public.event_status,
  created_at timestamptz,
  venue_name text,
  venue_address text,
  venue_city text,
  interested_count bigint
)
language sql
security definer
set search_path = public
as $$
  select e.id, e.venue_id, e.title, e.description, e.start_at, e.end_at, e.price_range, e.cover_url, e.status, e.created_at,
         v.name as venue_name, v.address as venue_address, v.city as venue_city,
         coalesce(sum(case when ei.status in ('interested','going') then 1 else 0 end),0) as interested_count
  from public.events e
  left join public.venues v on v.id = e.venue_id
  left join public.event_interest ei on ei.event_id = e.id
  where e.status = 'published' and e.start_at >= now()
  group by e.id, v.name, v.address, v.city
  order by e.start_at asc;
$$;
grant execute on function public.get_upcoming_events() to anon, authenticated;

-- Realtime publication
alter publication supabase_realtime add table public.venue_votes;
alter publication supabase_realtime add table public.venue_status;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.chat_messages;
