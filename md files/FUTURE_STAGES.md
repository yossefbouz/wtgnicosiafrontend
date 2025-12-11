# WTG Nicosia - Future Stages (Planning Draft)

## Phase 0: Stabilize the MVP (now)
- Replace all dummy data with Supabase (venues, events, votes, status), ensure RLS policies and error handling are in place.
- Seed a realistic Nicosia dataset for Home/Map/Events to validate UX, include cover images and vibe tags.
- Harden auth flows (email OTP + OAuth), session persistence, and graceful fallbacks when offline or unauthenticated.

## Phase 1: Vibe Signals & Engagement
- Ship reliable yes/maybe/no voting with realtime updates and trending ranking that blends votes + recent status + recency.
- Add check-ins/vibe notes + lightweight badges ("packed", "chill", wait time) that expire automatically.
- Push notifications for reminders (events starting soon, a favorite venue turning busy) and vote confirmations.
- Finish filters/search (music, price, distance, student nights) across Home/Map/Events.

## Phase 2: Events & Discovery Depth
- Rich event detail: schedules, dress code, photos, age policy, price bands, lineup/music tags.
- Favorites and history: save venues/events, show recent visits/votes in Profile, and suggest similar spots.
- Deals feed (student-only flags, auto-expiring offers) and sponsored placements labeled in Home/Events/Map.

## Phase 3: Booking & Guest List
- In-app "Book/Join list" for venues/events with party size rules, confirmation codes/QR, and cancellation windows.
- Partner booking bridge (webhook/edge function) to send confirmed entries to venue systems; fallback manual list export.
- Venue-side tools: nightly guest list export, arrival check-in toggle, simple occupancy meter owners can update.

## Phase 4: Chat, Community & Safety
- Event/venue chat rooms auto-join on "Yes"/booking; typing indicators, photo-sharing guardrails, rate limits.
- Safety: report venue/event/user/message; moderator queue + blocklist terms; block/mute users; ban evasion checks.
- Trust signals: verified venues/owners, visible moderators, and community guidelines surfaced in onboarding.

## Phase 5: B2B Monetization & Analytics
- Owner dashboard: create/edit venues/events/deals, schedule promos, set placements, upload media.
- Analytics for venues: foot traffic trends, peak hours, yes/guest-list conversion, deal redemption, crowd level history.
- Billing: packages for sponsored listings, promos, and monthly guest-list automation; basic invoicing/receipts.

## Phase 6: Expansion & Operations
- Multi-city support with city switcher, localization (languages, currency), and geo-fenced feeds.
- Growth loops: referrals for students, ambassador codes for promoters, in-app surveys for NPS/vibe quality.
- Reliability: background jobs to expire stale data, CDN/signed URLs for media, observability (Sentry/logging).

## Front-end Pages (Roadmap)
- Phase 0–1: Onboarding/Permissions (location/notifications gating), Auth (email OTP + OAuth), Home Feed (tiles + quick filters), Map (sticky filter bar + venue cards), Events List (date picker + tags), Venue Detail (status, votes, notes), Event Detail (schedule, dress code, media), Vote/Check-in modal.
- Phase 1–2: Filters & Search (music/price/distance/student), Favorites & History, Notifications Center, Deals & Promos feed (student flag + expiry), Profile (saved spots, recent votes), Badges UI on venue/event cards.
- Phase 3: Booking/Guest List flow (party size, confirmation/QR), Booking History (cancellations windows), Partner Bridge Status page (webhook state, manual export).
- Phase 4: Chat per venue/event (join/leave states, report/mute), Safety/Report flow (reason, evidence), Moderator Queue (flagged content/users).
- Phase 5: Owner Dashboard (create/edit venues/events/deals, schedules, media upload), Analytics (foot traffic, conversion, deal redemption), Billing & Plans (packages, invoices/receipts).
- Phase 6: City Switcher (multi-city selector), Localization Settings (language/currency), Surveys/NPS (in-app micro-surveys), Reliability Status page (data freshness, media/CDN health).
