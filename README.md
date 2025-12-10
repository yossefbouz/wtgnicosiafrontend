# WTG Nicosia - Supabase Implementation Plan

## Purpose
- Turn the WTG nightlife concept (real-time yes voters, events, maps, bookings, safety) into a Supabase-backed API the Expo app can consume.
- Keep the surface lean for the current screens (Home, Map, Events, Saved, Profile) while leaving hooks for chat, bookings/guest lists, deals, reporting, and admin.

## Architecture
- Supabase Postgres with RLS as the single source of truth.
- Supabase Auth (email OTP + optional OAuth); session handled via Supabase JS client in Expo.
- PostgREST for straight CRUD; RPC/edge functions for guarded mutations (crowd updates, booking/guest list, cleanup).
- Realtime channels on tables that drive live vibe signals (crowd/votes, events, chat).
- Storage buckets for venue and event media; signed URLs for private assets.
- Optional edge function/webhook layer for push notifications, partner bookings, and exporting venue guest lists.

## Environment & Client
- Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server/edge only), optional `EXPO_PUBLIC_SENTRY_DSN`.
- Add Supabase JS client to Expo; wrap in a provider for use across `Home`, `CyprusMap`, `Events`, and `Profile` screens.
- Use a separate Supabase project or schema for dev vs prod; seed dev data to mirror the current UI fixtures.

## Inputs Needed from You
- Supabase creds for dev/prod: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server/edge only); confirm if we spin up a fresh project or attach to an existing one.
- Map keys: Google Maps SDK keys for iOS/Android (and Apple Maps config if required) for the Map screen.
- Push/email: Expo push/FCM server key for notifications; email sender (SendGrid/Twilio Email) if we enable email OTP.
- Booking/guest list rules: max party size, cancellation window, and any partner booking API endpoints/keys venues need us to call.
- Sponsored/deals: pricing tiers, labels, and budget caps for paid placements and student deals.
- Safety/moderation: report escalation rules and any blocklist terms.
- Brand assets: final logos and color tokens if they differ from the current palette.

## Data Model (aligned to business plan)
- `users` (uuid pk, email, display_name, avatar_url, university, role enum[user, owner, admin, moderator], created_at)
- `venues` (uuid pk, name, address, city, geo_lat, geo_lng, tags[], status enum[active,draft,archived], cover_url, owner_id fk users, created_at)
- `venue_votes` (user_id fk, venue_id fk, status enum[yes,maybe,no], created_at) - captures Going/Not Going to show real-time yes voters
- `venue_status` (uuid pk, venue_id fk, crowd_level enum[quiet,chill,busy,packed], wait_time_minutes, music_tag, vibe_note, updated_by fk users, expires_at, updated_at) - most recent vibe snapshot
- `events` (uuid pk, venue_id fk, title, description, start_at, end_at, price_range, cover_url, status enum[published,draft,cancelled])
- `event_interest` (user_id fk, event_id fk, status enum[interested,going], created_at)
- `favorites` (user_id fk, venue_id fk, created_at) - powers Saved screen
- `check_ins` (uuid pk, user_id fk, venue_id fk, mood_tag, short_note, rating_smallint, created_at) - optional vibe context beyond votes
- `deals` (uuid pk, venue_id fk, title, description, starts_at, ends_at, price_text, status enum[published,draft,expired], student_only boolean) - student deals and bar promotions
- `sponsored_listings` (uuid pk, venue_id fk, event_id fk nullable, starts_at, ends_at, placement enum[home,map,events], bid_amount_numeric) - paid placements for B2B revenue
- `guest_list_entries` (uuid pk, venue_id fk, event_id fk nullable, user_id fk, party_size_smallint, status enum[pending,confirmed,arrived,cancelled], created_at) - auto guest-list database for venues
- `reports` (uuid pk, user_id fk, target_type enum[venue,event,user,message], target_id uuid, reason, status enum[open,reviewed,blocked], created_at)
- `bookings` (uuid pk, user_id fk, venue_id fk, event_id fk nullable, slots_int, status enum[pending,confirmed,cancelled], external_ref, meta jsonb, created_at)
- Chat (optional v1.1): `chat_rooms` (id, venue_id/event_id nullable), `chat_members`, `chat_messages` (room_id, sender_id, body, created_at)
- Reference tables as needed: `vibe_tags`, `music_tags`, `promo_codes` for partner offers.

## Realtime & Ranking
- Subscribe to `venue_votes` and `venue_status` for Home (vibe) and Map (open/crowd) updates; debounce UI updates on the client.
- Subscribe to `events` for new/updated events and cancellations.
- Optional: realtime channels per chat room once chat ships.
- Trending RPC/materialized view: combines recent yes votes, freshness of `venue_status`, and recency of events to order Home.

## API Surface by Screen
- Home (Voting): list venues with latest `venue_status`, yes/maybe counts from `venue_votes`, and trending score. Mutations via RPC: upsert vote, upsert venue_status (rate-limited), optional check-in.
- Map: fetch minimal `venues` (name, coords, is_open flag derived from hours, current crowd level). Realtime subscription on `venue_status` to keep markers fresh.
- Events: query `events` joined with `venues`; filter by date range and city. Mutations: set `event_interest` (going/interested), optional `bookings` for events.
- Saved: pull `favorites` joined to `venues`; allow add/remove favorite.
- Profile: user profile from `users`, plus `favorites`, `event_interest`, `check_ins`, and `venue_votes` history. Allow avatar upload (storage + signed URL update).
- Deals: list active `deals` scoped to city/venue; show student-only flag; expire automatically.
- Sponsored: serve `sponsored_listings` for paid placements (Home/Events/Map); ensure clear labeling client-side.
- Admin/Owner (future): CRUD for `venues`/`events`, manage media, view simple analytics (counts of votes, interest, bookings).
- Safety: submit `reports`; admin/moderator resolves reports.
- Chat (future): join room per event/venue after user votes "yes" or has a booking; send/receive `chat_messages` via realtime.
- Booking/Guest List: RPC/edge function to create `bookings` or `guest_list_entries`, optionally forward to partner API and return `external_ref`.

## Auth & Security
- Roles: `anon` (browse public listings), `authenticated`, `owner`, `admin`, `moderator`.
- RLS examples:
  - `venues`: readable by all; writable by owner/admin. `status` updates restricted to owner/admin.
  - `venue_votes`: insert/update by the authenticated user for their own row; limit 1 active vote per venue via policy or uniqueness constraint.
  - `venue_status`: insert/update by authenticated + owner/admin; consider allowing public updates but rate-limit via RPC.
  - `favorites`, `event_interest`, `check_ins`: scoped to `auth.uid()`.
  - `reports`: insert by authenticated; read/update by moderator/admin.
 - `bookings`: insert by user; update by user or owner/admin.
  - `guest_list_entries`: insert by user; update by user or owner/admin; venue owners can read/export their own.
  - `deals` and `sponsored_listings`: readable by all; writable by owner/admin; only active items returned in public views.
- Never ship service role to the client; use it only in edge functions/background jobs.

## Edge Functions & Jobs
- `upsert_vote` RPC: validates user, enforces one active vote per venue, updates counts.
- `upsert_venue_status` RPC: validates role, clamps values, sets `expires_at` for freshness.
- `create_booking` RPC/edge: optional bridge to partner booking APIs; stores `external_ref` and status.
- `add_guest_entry` RPC: adds `guest_list_entries`, enforces party size limit, returns confirmation code for the venue door.
- `export_guest_list` edge: allows venue owners to download their guest list CSV for the night.
- `cleanup_status` scheduled job: expire `venue_status` older than 2 hours to keep vibe data fresh.
- `expire_deals` scheduled job: marks `deals` as expired when `ends_at` is past.
- `notify_favorites` (optional): trigger/webhook to push notification when a favorite venue goes busy or an event is near start; also for promoted events.
- `moderation` (optional): auto-flag reports with keywords; throttle abusive vote/chat behavior.

## Storage & Media
- Buckets: `venue-media` and `event-media` (public-read via signed URLs), `avatars` (private, signed URLs). Prefix by venue/event id.
- Upload flow: client uploads with user session; server stores URL in table; purge old images when replaced.

## Dev Workflow
1) `supabase init` and commit `.supabase` plus SQL migrations; add seed data for the Nicosia venues/events shown in the mock.
2) Create schema above, add constraints (unique vote per user+venue, unique favorite, etc.), then add RLS policies and enable realtime on `venue_votes`, `venue_status`, `events`, `chat_messages` (when ready).
3) In Expo, create `supabaseClient.ts` and a provider hook; replace dummy data in `Home`, `CyprusMap`, `Events`, `Profile` with Supabase queries and subscriptions.
4) Wire mutations via RPC: vote yes/maybe/no, set interest, add favorite, update venue status; add optimistic UI updates.
5) Implement media upload (avatars, venue/event covers) with signed URLs; add deals and sponsored placements to feeds.
6) Optional v1.1: chat rooms per venue/event; bookings/guest list exports for venues; moderation dashboard; push notification hooks.

## Milestones
1) Schema + RLS + seeds in Supabase; enable realtime streams.
2) Integrate client in Expo with live Home/Map/Event data; replace all dummy fixtures.
3) Ship voting/vibe RPC with rate limits; add trending ordering.
4) Add favorites + event interest + profile data; implement storage for avatars/covers.
5) Add booking/guest list + partner hook, safety reporting, deals, and sponsored placements; start admin/owner CRUD.
6) Optional: chat, notifications, analytics dashboards (foot traffic, peak hours), and moderation polish.

## How to apply this schema locally
1) Ensure `supabase` CLI is installed.
2) Fill `.env` from `.env.example`.
3) Apply schema: `supabase db reset` (or `supabase db push` with `supabase/schema.sql`).
4) Seed dev data: `supabase db remote commit` or run `psql < supabase/seed.dev.sql` against the project.
5) Buckets/policies are included in `supabase/schema.sql`; run once per project.

## Expo wiring (supabase-js)
- Supabase client lives at `lib/supabaseClient.js` (uses `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- API helpers in `lib/supabaseApi.js` cover auth, profile, votes, events, bookings, favorites, realtime subscriptions.
- Screens now query Supabase:
  - `HomeScreen` pulls `venue_trending`, subscribes to `venue_votes`/`venue_status`, and upserts votes (Yes/Maybe/No).
  - `CyprusMapScreen` loads venue coords, pulls latest `venue_status`, subscribes to realtime updates.
  - `EventsScreen` lists upcoming events + interested count, supports interested/going + bookings.
  - `ProfileScreen` supports email+password signup/login (with confirm password), email verification flow, shows profile + basic stats.

## Env and secrets
- Required (client): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Required (server/admin scripts only): `SUPABASE_SERVICE_ROLE_KEY`
- Do **not** commit secrets. `.env`, `.env.*` are gitignored. Keep the service role key server-side/CI only, never in the mobile bundle.

## Local admin scripts (service role required)
- Health check (uses service role, bypasses RLS, exits 0/1):  
  `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node"}' npx ts-node --transpile-only utils/healthCheck.ts`
- List users:  
  `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node"}' npx ts-node --transpile-only scripts/adminListUsers.ts`
- Confirm a user by email:  
  `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node"}' npx ts-node --transpile-only scripts/adminConfirmUser.ts user@example.com`
- Insert demo venues/events (dev-only data):  
  `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node"}' npx ts-node --transpile-only scripts/adminInsertDemoData.ts`
- Export guest list for a venue:  
  `TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node"}' npx ts-node --transpile-only scripts/adminExportGuestList.ts <venue_id>`

All scripts assume `SUPABASE_SERVICE_ROLE_KEY` + `EXPO_PUBLIC_SUPABASE_URL` in your environment.

## Dev → staging → production notes
- Keep separate projects/environments (dev/staging/prod) with distinct anon + service role keys.
- Never ship the service role key to the client; store in server/CI secrets.
- Prefer SQL migrations for RPC/functions; keep seeds dev-only and idempotent. Run sanity checks (`supabase db push --dry-run`, lint) before applying to shared envs.
