# Project Inputs Checklist (fill me before Supabase wiring)

Fill these fields so I can wire the backend and Expo client. Keep secrets out of git; put keys in `.env`.

## 1) Supabase project
- Project name/URL:
- `EXPO_PUBLIC_SUPABASE_URL`: https://fqldwkrmlinlsoiodwnd.supabase.co
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: sb_publishable_5C2Wm0YiXxUP1pZ4ShEirA_xgLfUIYT
- `SUPABASE_SERVICE_ROLE_KEY` (server/edge only):  sb_service_role_5C2Wm0YiXxUP1pZ4ShEirA_xgLfUIYT 
- Dev vs prod: separate projects or schemas? One Supabase project for now: wtg-nicosia-dev (dev only).
- Schema prefix (if any):



## 3) Maps
- Google Maps API key (iOS): using mock data for now 
- Google Maps API key (Android): using mock data for now 
- Apple Maps config (if needed):using mock data for now

## 4) Push + email
- Expo/FCM server key: using mock data for now
- Email sender (domain/from): using mock data for now
- Email API (SendGrid/Twilio Email) key: using mock data for now

## 5) Booking + guest list
- Max party size per booking/guest entry: using mock data for now
- Cancellation window (minutes): using mock data for now
- Partner booking API URL/key (if any): using mock data for now
- Door code/confirmation format preference: using mock data for now

## 6) Deals + sponsored placements
- Pricing tiers (home/events/map placements): using mock data for now
- Daily/weekly budget caps: using mock data for now
- Label to show on sponsored cards (e.g., "Sponsored"): using mock data for now
- Student-only deals flag default: [true/false] using mock data for now

## 7) Safety + moderation
- Blocklist keywords (for chat/reports): using mock data for now
- Escalation path for reports (who reviews): using mock data for now
- Temporary ban duration defaults: using mock data for now

## 8) Brand assets
- Final logo file path: assets/images/logowtgnicosia.png
- Primary/secondary colors (hex): us the same as we did them in front end 
- Typography (confirm Poppins/Inter or provide alternatives): Poppins for headings
Inter for body text


## 9) Notifications rules
- Reminders: how long before event? using mock data for now
- Trigger when favorite venue goes busy? [yes/no] using mock data for now
- Trigger when sponsored event starts? [yes/no] using mock data for now

## 10) Admin/owner access
- Initial admin emails: using mock data for now
- Initial venue owners (email -> venue): using mock data for now
