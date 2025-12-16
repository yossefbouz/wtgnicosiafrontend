# Project Inputs Checklist (fill me before Supabase wiring)

Fill these fields so I can wire the backend and Expo client. Keep secrets out of git; put keys in `.env`.

## 1) Supabase project
- Project name/URL: [Insert Project Name]
- `EXPO_PUBLIC_SUPABASE_URL`: [Insert Supabase URL]
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: [Insert Anon Key]
- `SUPABASE_SERVICE_ROLE_KEY` (server/edge only): [Insert Service Role Key]
- Dev vs prod: separate projects or schemas? One Supabase project for now: wtg-nicosia-dev (dev only).
- Schema prefix (if any):

## 3) Maps
- Google Maps API key (iOS): using mock data for now 
- Apple Maps config (if needed):using mock data for now

## 4) Push + email
- Expo/FCM server key: using mock data for now
- Email sender (domain/from): using mock data for now
- Email API (SendGrid/Twilio Email) key: using mock data for now

## 5) Booking + guest list
- Max party size per booking/guest entry: 8
- Cancellation window (minutes): 120
- Partner booking API URL/key (if any): using mock data for now
- Door code/confirmation format preference: QR codes (booking_id + venue_id payload)

## 6) Deals + sponsored placements
- Pricing tiers (home/events/map placements): Home EUR 20, Events EUR 15, Map EUR 10; benchmark EUR 15
- Daily/weekly budget caps: daily 30, weekly 150
- Label to show on sponsored cards (e.g., "Sponsored"): Sponsored
- Student-only deals flag default: [true/false] using mock data for now

## 7) Safety + moderation
- Blocklist keywords (for chat/reports): spam, harassment, fake_event, unsafe_behavior
- Escalation path for reports (who reviews): reporter intake -> venue moderator queue -> admin override
- Temporary ban duration defaults: 12h (first), 48h (second), permanent (third)

## 8) Brand assets
- Final logo file path: assets/images/logowtgnicosia.png
- Primary/secondary colors (hex): us the same as we did them in front end 
- Typography (confirm Poppins/Inter or provide alternatives): Poppins for headings
Inter for body text


## 9) Notifications rules
- Reminders: 150/60/15 minutes before event start
- Trigger when favorite venue goes busy? yes (>=80% occupancy)
- Trigger when sponsored event starts? yes; max 2 per user per day; require user activity in last 7 days

## 10) Admin/owner access
- Initial admin emails: youssefbouzgarrouyb@gmail.com
- Initial venue owners (email -> venue):
  - 3d3a2b5e-1f21-4c9b-9c4b-2c1d3ab6c8f3 (Old Town Social, mock) -> owner@example.com
  - 5f0b7d9b-43cf-4a18-97c9-98e92dd33b2d (Marina Club, mock) -> another_owner@example.com
