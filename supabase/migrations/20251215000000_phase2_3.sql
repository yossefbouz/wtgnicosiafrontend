-- Phase 2 & 3: Safety and Booking Improvements

-- 1. Submit Report RPC (Phase 2 Safety)
create or replace function public.submit_report(
  p_target_type public.report_target,
  p_target_id uuid,
  p_reason text
)
returns public.reports
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.reports;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  
  -- Rate limiting check could go here (e.g. max 20 per hour)
  -- For now we implement the basic insertion
  
  insert into public.reports (user_id, target_type, target_id, reason, status)
  values (uid, p_target_type, p_target_id, p_reason, 'open')
  returning * into result;
  
  return result;
end;
$$;
grant execute on function public.submit_report(public.report_target, uuid, text) to authenticated;

-- 2. Update Create Booking RPC (Phase 3 Booking) - Update max party size to 8
create or replace function public.create_booking(p_event_id uuid, p_venue_id uuid, p_party_size int)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.bookings;
  max_party int := 8; -- Updated from 10 to 8 per Phase 2 inputs
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

-- 3. Join Guest List RPC (Phase 3 Booking)
create or replace function public.join_guest_list(
  p_venue_id uuid,
  p_event_id uuid default null,
  p_party_size int default 1
)
returns public.guest_list_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.guest_list_entries;
  v_code text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  
  -- Generate a simple random 6-char confirmation code (e.g. A1B2C3)
  -- In production, might want a more robust unique generator
  v_code := upper(substring(md5(random()::text) from 1 for 6));
  
  insert into public.guest_list_entries (user_id, venue_id, event_id, party_size_smallint, status, confirmation_code)
  values (uid, p_venue_id, p_event_id, p_party_size, 'pending', v_code)
  returning * into result;
  
  return result;
end;
$$;
grant execute on function public.join_guest_list(uuid, uuid, int) to authenticated;
