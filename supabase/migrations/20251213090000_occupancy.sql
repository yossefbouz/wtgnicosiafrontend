-- Occupancy tables, policies, and RPCs for venue admin controls
-- Status tags are text enums to match mobile client chips


create extension if not exists "pg_cron" with schema extensions;

create type public.occupancy_status as enum ('empty', 'moderate', 'busy', 'full');
create type public.occupancy_source as enum ('auto', 'manual');

create table public.venue_occupancy (
  venue_id uuid primary key references public.venues(id) on delete cascade,
  current_count integer not null default 0 check (current_count >= 0),
  status_tag public.occupancy_status not null default 'empty',
  source public.occupancy_source not null default 'auto',
  last_delta integer default 0,
  last_reason text,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.occupancy_events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  action text not null check (action in ('increment','decrement','set','reset','override','auto')),
  delta integer,
  from_count integer,
  to_count integer,
  status_tag public.occupancy_status,
  reason text,
  source public.occupancy_source not null default 'manual',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index occupancy_events_venue_idx on public.occupancy_events(venue_id);
create index occupancy_events_created_idx on public.occupancy_events(created_at desc);

alter table public.venue_occupancy enable row level security;
alter table public.occupancy_events enable row level security;

-- Helper to assert venue ownership/role
create or replace function public.assert_can_manage_venue(p_venue_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not (
    public.is_role(array['owner','admin'])
    or exists (select 1 from public.venues v where v.id = p_venue_id and v.owner_id = auth.uid())
  ) then
    raise exception 'not authorized to manage venue %', p_venue_id using errcode = '42501';
  end if;
end;
$$;

-- Policies
create policy "venue_occupancy read all" on public.venue_occupancy for select using (true);
create policy "venue_occupancy manage owner" on public.venue_occupancy
  for all using (
    public.is_role(array['owner','admin'])
    or exists (select 1 from public.venues v where v.id = venue_id and v.owner_id = auth.uid())
  )
  with check (
    public.is_role(array['owner','admin'])
    or exists (select 1 from public.venues v where v.id = venue_id and v.owner_id = auth.uid())
  );

create policy "occupancy_events read owner_admin" on public.occupancy_events
  for select using (
    public.is_role(array['owner','admin'])
    or exists (select 1 from public.venues v where v.id = occupancy_events.venue_id and v.owner_id = auth.uid())
  );

create policy "occupancy_events insert owner_admin" on public.occupancy_events
  for insert with check (
    public.is_role(array['owner','admin'])
    or exists (select 1 from public.venues v where v.id = occupancy_events.venue_id and v.owner_id = auth.uid())
  );

-- RPC: increment/decrement occupancy with audit log
create or replace function public.increment_venue_occupancy(
  p_venue_id uuid,
  p_delta integer default 1,
  p_reason text default null,
  p_status_tag public.occupancy_status default null
) returns public.venue_occupancy
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_old_count integer := 0;
  v_new public.venue_occupancy;
  v_action text;
begin
  perform public.assert_can_manage_venue(p_venue_id);
  if p_delta is null then
    p_delta := 0;
  end if;
  select current_count into v_old_count from public.venue_occupancy where venue_id = p_venue_id for update;
  if not found then
    v_old_count := 0;
  end if;

  v_action := case when p_delta >= 0 then 'increment' else 'decrement' end;

  insert into public.venue_occupancy as vo (
    venue_id, current_count, status_tag, source, last_delta, last_reason, updated_by, updated_at
  )
  values (
    p_venue_id,
    greatest(0, p_delta),
    coalesce(p_status_tag, 'empty'),
    'manual',
    p_delta,
    p_reason,
    auth.uid(),
    now()
  )
  on conflict (venue_id) do update set
    current_count = greatest(0, vo.current_count + p_delta),
    status_tag = coalesce(p_status_tag, vo.status_tag),
    source = 'manual',
    last_delta = p_delta,
    last_reason = p_reason,
    updated_by = auth.uid(),
    updated_at = now()
  returning * into v_new;

  insert into public.occupancy_events (venue_id, action, delta, from_count, to_count, status_tag, reason, source, created_by)
  values (p_venue_id, v_action, p_delta, v_old_count, v_new.current_count, v_new.status_tag, p_reason, 'manual', auth.uid());

  return v_new;
end;
$$;

-- RPC: set/override occupancy with audit log
create or replace function public.set_venue_occupancy(
  p_venue_id uuid,
  p_target_count integer,
  p_reason text default null,
  p_status_tag public.occupancy_status default null
) returns public.venue_occupancy
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_old_count integer := 0;
  v_new public.venue_occupancy;
begin
  perform public.assert_can_manage_venue(p_venue_id);
  if p_target_count is null or p_target_count < 0 then
    p_target_count := 0;
  end if;
  select current_count into v_old_count from public.venue_occupancy where venue_id = p_venue_id for update;
  if not found then
    v_old_count := 0;
  end if;

  insert into public.venue_occupancy as vo (
    venue_id, current_count, status_tag, source, last_delta, last_reason, updated_by, updated_at
  )
  values (
    p_venue_id,
    p_target_count,
    coalesce(p_status_tag, 'empty'),
    'manual',
    p_target_count - v_old_count,
    p_reason,
    auth.uid(),
    now()
  )
  on conflict (venue_id) do update set
    current_count = p_target_count,
    status_tag = coalesce(p_status_tag, vo.status_tag),
    source = 'manual',
    last_delta = p_target_count - v_old_count,
    last_reason = p_reason,
    updated_by = auth.uid(),
    updated_at = now()
  returning * into v_new;

  insert into public.occupancy_events (venue_id, action, delta, from_count, to_count, status_tag, reason, source, created_by)
  values (p_venue_id, 'set', p_target_count - v_old_count, v_old_count, v_new.current_count, v_new.status_tag, p_reason, 'manual', auth.uid());

  return v_new;
end;
$$;

comment on table public.venue_occupancy is 'Live occupancy per venue, updatable by owners/admins; emits realtime events.';
comment on table public.occupancy_events is 'Audit log of occupancy changes with deltas and reasons.';

-- Nightly reset at 05:00 server time: clears counts and status to empty
-- Requires supabase cron extension enabled (pg_cron)
select cron.schedule(
  'reset_venue_occupancy_daily',
  '0 5 * * *',
  $$update public.venue_occupancy set current_count = 0, status_tag = 'empty', source = 'manual', last_delta = 0, last_reason = 'Nightly reset', updated_at = now();$$
);
