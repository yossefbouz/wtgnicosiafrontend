# WTG Nicosia Backend Overview (Supabase)

This document summarizes the schema, relationships, and how each app screen maps to Supabase tables/RPCs.

## Core Profile
- `users` (uuid PK = auth.uid): email, display_name, avatar_url, university, role (`user|owner|admin|moderator`), created_at.
- Auth: email + password, email verification; sessions managed in Expo via `supabase-js`.

## Tables & Relationships (ERD-style)
- `users` 1--* `venues` (owner_id)
- `venues` 1--* `venue_status`
- `venues` 1--* `venue_votes` (*user_id, venue_id*)
- `venues` 1--* `favorites` (*user_id, venue_id*)
- `venues` 1--* `events`
- `events` 1--* `event_interest` (*user_id, event_id*)
- `venues` 1--* `bookings`; `events` 1--* `bookings`
- `venues` 1--* `guest_list_entries`; `events` 1--* `guest_list_entries`
- `venues` 1--* `deals`
- `venues` 1--* `sponsored_listings`
- `venues` 1--* `check_ins`
- `reports` targets venue|event|user|message
- Chat scaffolding: `chat_rooms` -> `chat_members` -> `chat_messages`
- Reference: `vibe_tags`, `music_tags`, `promo_codes`

## Screen → Data & Mutations
- **Home**
  - Data: RPC `get_trending_venues` (joins `venues`, aggregates `venue_votes`, latest `venue_status`).
  - Mutations: `upsert_vote` RPC (writes `venue_votes`).
  - Realtime: subscribe to `venue_votes`, `venue_status`.
- **Map**
  - Data: `venues` (id, name, geo_lat, geo_lng), latest `venue_status` per venue.
  - Realtime: `venue_status`.
- **Events**
  - Data: RPC `get_upcoming_events` (events + venue info + interested_count).
  - Mutations: `set_event_interest` RPC (interested/going), `create_booking` RPC (simple pending booking).
- **Saved**
  - Data: `favorites` joined to `venues`.
  - Mutations: `toggle_favorite` RPC.
- **Profile**
  - Data: `users` profile, history from `venue_votes`, `event_interest`, `check_ins`, `favorites`.
  - Mutations: auth signUp/signIn/signOut; profile update; avatar upload to `avatars` bucket and update `users.avatar_url`.
- **Reporting & Safety**
  - Data: `reports`.
  - Mutations: insert into `reports`.
- **Chat (scaffold)**
  - Data/Mutations: `chat_rooms`, `chat_members`, `chat_messages`; realtime on `chat_messages`.

## RPC Functions
- `upsert_vote(venue_id, status)` — insert/update vote for auth user.
- `set_event_interest(event_id, status)` — insert/update interest for auth user.
- `toggle_favorite(venue_id)` — toggles user favorite.
- `upsert_venue_status(venue_id, crowd_level, wait_time_minutes, music_tag, vibe_note)` — owner/admin only.
- `create_booking(event_id, venue_id, party_size)` — caps party size (default 10), returns booking.
- `get_trending_venues()` — security definer, returns aggregated feed.
- `get_upcoming_events()` — security definer, returns events with interested_count.

## RLS Summary
- `users`: select/update only self.
- `venues`: public read; insert/update by owner/admin.
- `venue_votes`, `event_interest`, `favorites`, `check_ins`: only owning user can read/write.
- `venue_status`: public read; insert/update by venue owner/admin.
- `bookings`, `guest_list_entries`: user can read/write own; venue owners/admin can read/update for their venues.
- `reports`: insert by authenticated; read/update by moderator/admin.
- `deals`, `sponsored_listings`: public read; write by owner/admin.
- Chat: members can read/write messages; owners/admin can create rooms.
- Reference tables: public read; admin write.

## Storage Buckets
- `avatars` (private; signed URLs), `venue-media` (public), `event-media` (public). Policies included in schema.

## Realtime
- Publication enabled on `venue_votes`, `venue_status`, `events`, `chat_messages`.
- Expo subscriptions: `supabase.channel(...).on('postgres_changes', ...)`.

## Connectivity Check
- `utils/healthCheck.ts` runs a simple `select * from users limit 1` and logs errors if URL/key are missing or invalid.
