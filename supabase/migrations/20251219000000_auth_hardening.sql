-- Auth hardening: prevent self-role escalation and scope owner actions to owned venues.

-- Users policies
drop policy if exists "users select self" on public.users;
drop policy if exists "users insert self" on public.users;
drop policy if exists "users update self" on public.users;
drop policy if exists "users insert admin" on public.users;
drop policy if exists "users update admin" on public.users;

create policy "users select self" on public.users
  for select using (auth.uid() = id);

create policy "users insert self" on public.users
  for insert with check (auth.uid() = id and role = 'user');

create policy "users insert admin" on public.users
  for insert with check (public.is_role(array['admin']));

create policy "users update self" on public.users
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select u.role from public.users u where u.id = auth.uid())
  );

create policy "users update admin" on public.users
  for update using (public.is_role(array['admin']))
  with check (public.is_role(array['admin']));

-- Venues
drop policy if exists "venues write owner" on public.venues;
drop policy if exists "venues update owner" on public.venues;

create policy "venues write owner" on public.venues
  for insert with check (
    public.is_role(array['admin'])
    or (public.is_role(array['owner']) and owner_id = auth.uid())
  );

create policy "venues update owner" on public.venues
  for update using (
    public.is_role(array['admin'])
    or owner_id = auth.uid()
  )
  with check (
    public.is_role(array['admin'])
    or owner_id = auth.uid()
  );

-- Venue status
drop policy if exists "venue_status insert owner" on public.venue_status;
drop policy if exists "venue_status update owner" on public.venue_status;

create policy "venue_status insert owner" on public.venue_status
  for insert with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = venue_status.venue_id and v.owner_id = auth.uid()
    )
  );

create policy "venue_status update owner" on public.venue_status
  for update using (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = venue_status.venue_id and v.owner_id = auth.uid()
    )
  )
  with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = venue_status.venue_id and v.owner_id = auth.uid()
    )
  );

-- Events
drop policy if exists "events write owner" on public.events;
drop policy if exists "events update owner" on public.events;

create policy "events write owner" on public.events
  for insert with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = events.venue_id and v.owner_id = auth.uid()
    )
  );

create policy "events update owner" on public.events
  for update using (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = events.venue_id and v.owner_id = auth.uid()
    )
  )
  with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = events.venue_id and v.owner_id = auth.uid()
    )
  );

-- Deals
drop policy if exists "deals write owner" on public.deals;
drop policy if exists "deals update owner" on public.deals;

create policy "deals write owner" on public.deals
  for insert with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = deals.venue_id and v.owner_id = auth.uid()
    )
  );

create policy "deals update owner" on public.deals
  for update using (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = deals.venue_id and v.owner_id = auth.uid()
    )
  )
  with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = deals.venue_id and v.owner_id = auth.uid()
    )
  );

-- Sponsored listings
drop policy if exists "sponsored write owner" on public.sponsored_listings;
drop policy if exists "sponsored update owner" on public.sponsored_listings;

create policy "sponsored write owner" on public.sponsored_listings
  for insert with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = sponsored_listings.venue_id and v.owner_id = auth.uid()
    )
    or exists (
      select 1
      from public.events e
      join public.venues v on v.id = e.venue_id
      where e.id = sponsored_listings.event_id and v.owner_id = auth.uid()
    )
  );

create policy "sponsored update owner" on public.sponsored_listings
  for update using (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = sponsored_listings.venue_id and v.owner_id = auth.uid()
    )
    or exists (
      select 1
      from public.events e
      join public.venues v on v.id = e.venue_id
      where e.id = sponsored_listings.event_id and v.owner_id = auth.uid()
    )
  )
  with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = sponsored_listings.venue_id and v.owner_id = auth.uid()
    )
    or exists (
      select 1
      from public.events e
      join public.venues v on v.id = e.venue_id
      where e.id = sponsored_listings.event_id and v.owner_id = auth.uid()
    )
  );

-- Chat rooms
drop policy if exists "chat_rooms write admin" on public.chat_rooms;

create policy "chat_rooms write admin" on public.chat_rooms
  for insert with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = chat_rooms.venue_id and v.owner_id = auth.uid()
    )
    or exists (
      select 1
      from public.events e
      join public.venues v on v.id = e.venue_id
      where e.id = chat_rooms.event_id and v.owner_id = auth.uid()
    )
  );

-- Occupancy policies
drop policy if exists "venue_occupancy manage owner" on public.venue_occupancy;
drop policy if exists "occupancy_events read owner_admin" on public.occupancy_events;
drop policy if exists "occupancy_events insert owner_admin" on public.occupancy_events;

create policy "venue_occupancy manage owner" on public.venue_occupancy
  for all using (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = venue_id and v.owner_id = auth.uid()
    )
  )
  with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = venue_id and v.owner_id = auth.uid()
    )
  );

create policy "occupancy_events read owner_admin" on public.occupancy_events
  for select using (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = occupancy_events.venue_id and v.owner_id = auth.uid()
    )
  );

create policy "occupancy_events insert owner_admin" on public.occupancy_events
  for insert with check (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = occupancy_events.venue_id and v.owner_id = auth.uid()
    )
  );

-- Helper function for occupancy ownership checks
create or replace function public.assert_can_manage_venue(p_venue_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not (
    public.is_role(array['admin'])
    or exists (
      select 1 from public.venues v
      where v.id = p_venue_id and v.owner_id = auth.uid()
    )
  ) then
    raise exception 'not authorized to manage venue %', p_venue_id using errcode = '42501';
  end if;
end;
$$;
