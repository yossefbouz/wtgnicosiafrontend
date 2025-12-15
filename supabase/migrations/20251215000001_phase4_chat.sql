-- Phase 4: Chat, Community & Safety

-- 1. Updates to Users Table (Safety)
alter table public.users 
add column if not exists banned_until timestamptz default null;

-- 2. Blocklist Table (Safety)
create table if not exists public.text_blocklist (
  term text primary key,
  created_at timestamptz default now()
);

-- Seed initial blocklist (example terms based on categories)
insert into public.text_blocklist (term) values 
  ('spam'), ('fake'), ('unsafe')
on conflict do nothing;

alter table public.text_blocklist enable row level security;
create policy "blocklist read all" on public.text_blocklist for select using (true);
create policy "blocklist admin managed" on public.text_blocklist for all using (public.is_role(array['admin','moderator']));

-- 3. Chat Rate Limiting & Sending (Chat)
create or replace function public.send_chat_message(p_room_id uuid, p_content text)
returns public.chat_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_banned timestamptz;
  v_count int;
  v_term text;
  result public.chat_messages;
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  -- 3a. Check Ban Status
  select banned_until into v_banned from public.users where id = uid;
  if v_banned is not null and v_banned > now() then
    raise exception 'You are temporarily banned until %', v_banned;
  end if;

  -- 3b. Rate Limiting (60/min)
  select count(*) into v_count from public.chat_messages 
  where sender_id = uid and created_at > now() - interval '1 minute';
  
  if v_count >= 60 then
    raise exception 'Rate limit exceeded: You are sending messages too fast.';
  end if;

  -- 3c. Blocklist Filter
  for v_term in select term from public.text_blocklist loop
    if p_content ~* v_term then
      raise exception 'Message contains prohibited content: %', v_term;
    end if;
  end loop;

  -- 3d. Insert Message
  insert into public.chat_messages (room_id, sender_id, body)
  values (p_room_id, uid, p_content)
  returning * into result;

  return result;
end;
$$;
grant execute on function public.send_chat_message(uuid, text) to authenticated;

-- 4. Auto-Join Logic (Community)

-- Helper to ensure room exists for venue
create or replace function public.ensure_venue_room(p_venue_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_room_id uuid;
begin
  select id into v_room_id from public.chat_rooms where venue_id = p_venue_id;
  if v_room_id is null then
    insert into public.chat_rooms (venue_id) values (p_venue_id) returning id into v_room_id;
  end if;
  return v_room_id;
end;
$$;

-- Trigger Function: Join Chat on Vote Yes
create or replace function public.handle_vote_auto_join()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
begin
  if new.status = 'yes' then
    v_room_id := public.ensure_venue_room(new.venue_id);
    
    insert into public.chat_members (room_id, user_id)
    values (v_room_id, new.user_id)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_vote_join_chat
after insert or update of status on public.venue_votes
for each row
execute function public.handle_vote_auto_join();

-- Trigger Function: Join Chat on Booking
create or replace function public.handle_booking_auto_join()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
begin
  -- Prioritize event room if event_id exists, else venue room
  -- (Assuming we might have event-specific rooms in future, but schema links room to venue OR event)
  
  if new.venue_id is not null then
    v_room_id := public.ensure_venue_room(new.venue_id);
    insert into public.chat_members (room_id, user_id)
    values (v_room_id, new.user_id)
    on conflict do nothing;
  end if;
  
  return new;
end;
$$;

create trigger on_booking_join_chat
after insert on public.bookings
for each row
execute function public.handle_booking_auto_join();

-- 5. Trust (Verified Venues)
alter table public.venues 
add column if not exists is_verified boolean default false;

-- 6. Moderation Queue View
create or replace view public.moderation_queue as
select r.id, r.user_id, r.target_type, r.target_id, r.reason, r.status, r.created_at,
       u.email as reporter_email
from public.reports r
left join public.users u on r.user_id = u.id
where r.status = 'open'
order by r.created_at asc;

grant select on public.moderation_queue to authenticated; -- Application policies handle row filtering (admin/mod only)
