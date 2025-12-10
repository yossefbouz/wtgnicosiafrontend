# Project Inputs Checklist (fill me before Supabase wiring)

Fill these fields so I can wire the backend and Expo client. Keep secrets out of git; put keys in `.env`.

## 1) Supabase project
- Project name/URL:
- `EXPO_PUBLIC_SUPABASE_URL`:
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`:
- `SUPABASE_SERVICE_ROLE_KEY` (server/edge only):
- Dev vs prod: separate projects or schemas?
- Schema prefix (if any):

## 2) Auth + 2FA (password + TOTP)
- MFA/TOTP: not enabled for now
- Allowed OAuth providers (if any):

## 3) Maps
- Google Maps API key (iOS):
- Google Maps API key (Android):
- Apple Maps config (if needed):

## 4) Push + email
- Expo/FCM server key:
- Email sender (domain/from):
- Email API (SendGrid/Twilio Email) key:

## 5) Booking + guest list
- Max party size per booking/guest entry:
- Cancellation window (minutes):
- Partner booking API URL/key (if any):
- Door code/confirmation format preference:

## 6) Deals + sponsored placements
- Pricing tiers (home/events/map placements):
- Daily/weekly budget caps:
- Label to show on sponsored cards (e.g., "Sponsored"):
- Student-only deals flag default: [true/false]

## 7) Safety + moderation
- Blocklist keywords (for chat/reports):
- Escalation path for reports (who reviews):
- Temporary ban duration defaults:

## 8) Brand assets
- Final logo file path:
- Primary/secondary colors (hex):
- Typography (confirm Poppins/Inter or provide alternatives):

## 9) Notifications rules
- Reminders: how long before event?
- Trigger when favorite venue goes busy? [yes/no]
- Trigger when sponsored event starts? [yes/no]

## 10) Admin/owner access
- Initial admin emails:
- Initial venue owners (email -> venue):
