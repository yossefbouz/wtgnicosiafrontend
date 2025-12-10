-- Dev seed data (run after schema)
insert into public.vibe_tags (name) values ('chill'), ('party'), ('student'), ('rooftop') on conflict do nothing;
insert into public.music_tags (name) values ('house'), ('techno'), ('rnb'), ('pop'), ('latin') on conflict do nothing;

-- Venues
insert into public.venues (name, address, city, geo_lat, geo_lng, tags, cover_url)
values
  ('Club Teez', 'Evagorou Ave, Nicosia', 'Nicosia', 35.173, 33.364, array['party'], 'https://images.unsplash.com/photo-1574100004472-e5363f2f87f3?q=80&w=1200&auto=format&fit=crop'),
  ('Lost & Found Drinkery', 'Vyronos Ave, Nicosia', 'Nicosia', 35.169, 33.361, array['chill'], 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1200&auto=format&fit=crop'),
  ('Ithaki Venue', 'Old Nicosia', 'Nicosia', 35.175, 33.355, array['student'], 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop')
  on conflict do nothing;

-- Events
insert into public.events (venue_id, title, description, start_at, end_at, price_range, cover_url)
select v.id, e.title, e.description, e.start_at, e.end_at, e.price_range, e.cover_url
from (
  values
    ('Club Teez', 'Neon Jungle Party', 'Glow night with DJs', now() + interval '1 hour', now() + interval '5 hours', 'EUR 10-15', 'https://images.unsplash.com/photo-1574100004472-e5363f2f87f3?q=80&w=1200&auto=format&fit=crop'),
    ('Lost & Found Drinkery', 'R&B Fridays', 'Smooth R&B all night', now() + interval '2 days', now() + interval '2 days 4 hours', 'Free entry', 'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=1200&auto=format&fit=crop'),
    ('Ithaki Venue', 'Student Night: 50% Off', 'Student specials', now() + interval '4 days', now() + interval '4 days 5 hours', 'EUR 5-10', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop')
) as e(venue_name, title, description, start_at, end_at, price_range, cover_url)
join public.venues v on v.name = e.venue_name;

-- Deals
insert into public.deals (venue_id, title, description, starts_at, ends_at, price_text, status, student_only)
select v.id, 'Student Night 2-for-1', 'Buy 1 get 1 for students', now(), now() + interval '7 days', '2-for-1 drinks', 'published', true
from public.venues v where v.name = 'Ithaki Venue'
on conflict do nothing;

-- Sponsored listings
insert into public.sponsored_listings (venue_id, placement, starts_at, ends_at, bid_amount)
select v.id, 'home', now(), now() + interval '3 days', 200.00
from public.venues v where v.name = 'Club Teez'
on conflict do nothing;
