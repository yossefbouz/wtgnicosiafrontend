# CURRENTCHANGE Execution Plan

Plan derived from CURRENTCHNAGES content and aligned to skills in `md files/SKILLS.md`. Sections list workstreams, steps, and required inputs.

## Workstreams and Steps

- Core Foundation (Technical Architecture / API & Frontend Integration)
  - Verify Supabase env wiring (`SUPABASE_URL`, anon/service keys); run `utils/healthCheck.ts`.
  - Cross-check deployed RPCs (`get_trending_venues`, `get_upcoming_events`, `upsert_vote`, `set_event_interest`, `toggle_favorite`, `upsert_venue_status`, `create_booking`) and confirm RLS matches summaries.
  - Deliverables: env validation notes, RPC availability list, RLS spot-check log.

- Presence/Occupancy (Technical Architecture)
  - Design tables/functions for check-in/heartbeat/checkout; add cron/worker to expire stale sessions.
  - Emit `occupancy:update` realtime channel; enforce RBAC so only owners/admins post status updates.
  - Apply provided parameters: heartbeat interval 30s; expiry threshold 90s; payload uses status tags (`empty|moderate|busy|full`).
  - Deliverables: schema + RLS draft, cron/worker spec, realtime channel contract, payload schema with TTL settings.

- Venue Admin Occupancy Console (Admin/Owner Console / Technical Architecture)
  - Add owner/admin UI to manage live occupancy: counter controls (increment/decrement), manual override to a specific count, and reset with reason.
  - Lock permissions to venue owners/admins; log all changes (who, venue_id, delta/from→to, reason, timestamp) for auditability.
  - Sync with presence/booking flows: apply check-in/checkout deltas automatically; expose override as a separate event with rationale.
  - Emit realtime updates to dashboards/user app (`occupancy:update`) with source (auto vs manual), count, and last_updated_by.
  - Guardrails: optional max cap per venue; warn/require confirmation when overriding beyond cap; rate-limit manual bumps to prevent spam.
  - Deliverables: UI flow spec, permission matrix, audit log fields, realtime payload schema, cap/guardrail rules.

- Booking Flow Hardening (API & Frontend Integration)
  - Extend `create_booking` to return status and cap party size (default max 8); add expected vs actual counters.
  - Add owner/admin confirm/deny/cancel endpoints; emit realtime events; enforce cancellation window (120 minutes before start).
  - Booking confirmations use QR codes for door staff validation.
  - Deliverables: updated RPC/endpoint contract, party-size/cancellation rules, realtime payloads, QR confirmation format.

- Admin/Owner Console (Product Roadmap / Technical Architecture)
  - Define admin/owner routes for CRUD on venues/events/deals/sponsored_listings and report review.
  - Add audit logging for destructive actions; map JWT roles/claims to routes.
  - Sponsored placements: label as “Sponsored”; benchmark price €15; enforce budget caps (daily €30, weekly €150) per venue unless updated; add per-screen tier placeholders (Home €20, Events €15, Map €10) until real tiers are set.
  - Seed access: initial admin `youssefbouzgarrouyb@gmail.com`; initial venue owners mapping: `venue_id_1 -> owner@example.com`, `venue_id_2 -> another_owner@example.com` (replace dummies with real IDs).
  - Deliverables: route/permission matrix, audit log fields, UI/API flow notes.

- Chat + Map Consent (Safety & Moderation / API & Frontend Integration)
  - Finalize chat model (venue rooms + city room); add consent flag; TTL location storage; gate map presence and chat posting on consent.
  - Deliverables: schema update, consent gating rules, TTL config.

- Frontend/Data Mapping (API & Frontend Integration)
  - Confirm each screen’s queries/subscriptions align with the RPCs; add subscriptions for `venue_status`, `chat_messages`, and `occupancy`.
  - Deliverables: screen→RPC/subscription matrix.

- Storage/Policies (Technical Architecture)
  - Validate buckets: `avatars` private + signed URLs; `venue-media`/`event-media` public; ensure no service key is shipped to clients.
  - Deliverables: storage policy checks, client usage notes.

- Safety (Safety & Moderation)
  - Wire reports CRUD + escalation path (moderator/admin); enforce rate limits on chat/votes/reports.
  - Apply inputs: report categories {spam, harassment, fake_event, unsafe_behavior}; temp bans (12h first, 48h second, permanent third); blocklist keywords matching categories; rate limits chat 60/min, 500/hr; votes 30/min, 300/hr; reports 20/hr.
  - Deliverables: report workflow, escalation steps, rate-limit thresholds and enforcement points, ban policy doc, blocklist config.

- Phase 1: Vibe Signals & Engagement (Product Roadmap)
  - Reliable yes/maybe/no voting with realtime; trending blend (votes + status + recency).
  - Check-ins/vibe notes + auto-expiring badges (“packed”, “chill”, wait time).
  - Push notifications: events starting soon (150/60/15 minutes before), favorite venue turns busy (>=80% occupancy), vote confirmations; cap sponsored alerts at 2 per user per day and require user activity in last 7 days.
  - Finish filters/search (music, price, distance, student nights) across Home/Map/Events.
  - Deliverables: ranking formula, badge expiry rules, notification triggers/timing, filter facets.

- Phase 2: Booking & Safety (Product Roadmap)
  - Reinforce voting/trending, check-ins/badges, reminders, filters/search per Phase 1 outputs; add safety improvements.
  - Deliverables: parity checklist and safety deltas.

- Phase 3: Booking & Guest List (Product Roadmap)
  - In-app Book/Join list with party-size rules, confirmation codes/QR, cancellation windows.
  - Partner booking bridge (webhook/edge function) + manual list export; arrival check-in toggle; simple occupancy meter.
  - Deliverables: booking/list flows, code/QR format, webhook spec, export format.

- Phase 4: Chat, Community & Safety (Safety & Moderation / Product Roadmap)
  - Event/venue chat auto-join on Yes/booking; typing indicators; photo-sharing guardrails; rate limits.
  - Safety: report venue/event/user/message; moderator queue; blocklist terms; block/mute; ban evasion checks.
  - Trust: verified venues/owners; visible moderators; guidelines in onboarding.
  - Deliverables: chat UX/policies, moderation queue steps, blocklist/ban rules, verification criteria.

## Inputs Needed from You

- Safety: report categories; escalation path (moderator → admin?); default temp-ban durations; initial blocklist keywords.
- Rate limits: specific thresholds for chat/votes/reports (per minute/hour) to replace current `null`.
- Sponsorship pricing: clarify per-screen tiers beyond benchmark €15 and caps (daily €30, weekly €150) if needed.
- Admin & Access: confirm/replace dummy venue IDs in owner mapping.

## Applied Inputs (from inputsfrome.md)

- Booking: max party size 8; cancellation window 120 minutes; confirmation format QR.
- Sponsorship: label text “Sponsored”; benchmark price €15; budget caps daily €30, weekly €150.
- Sponsorship tiers (placeholder): Home €20, Events €15, Map €10 (replace when real tiers available).
- Notifications: starting soon at 150/60/15 minutes pre-event; favorite busy trigger at 80% occupancy; sponsored alerts max 2 per user per day, require user activity in last 7 days.
- Admin & Access: initial admin `youssefbouzgarrouyb@gmail.com`; initial owners `venue_id_1 -> owner@example.com`, `venue_id_2 -> another_owner@example.com` (dummy IDs to replace).
- Presence/Occupancy: heartbeat 30s; expiry 90s; payload uses status tags {empty, moderate, busy, full}.
- Rate limits: chat 60/min, 500/hr; votes 30/min, 300/hr; reports 20/hr.
- Safety: report categories {spam, harassment, fake_event, unsafe_behavior}; temp bans 12h/48h/permanent; blocklist includes same terms.
