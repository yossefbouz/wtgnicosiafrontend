# WTG Nicosia - Product Requirements Document (PRD)

**Product name:** WTG Nicosia  
**Tagline:** Find the vibe tonight  
**Document type:** Investor + builder blueprint  
**Version:** 1.0 (draft)  
**Last updated:** 2025-12-14  

## 1) Executive Summary

WTG Nicosia is a mobile app for international university students in Nicosia to discover nightlife spots and events with real-time signals of where people plan to go ("Yes voters"), plus maps, event discovery, and (phased) bookings/guest lists, deals, and safety tooling.

This PRD consolidates the project's business plan, product scope, and technical constraints so:
- Investors get a clear picture of the product, market, and monetization.
- Builders (vibe coders / Codex) have an unambiguous blueprint: screens, features, acceptance criteria, and backend contracts.

## 2) Problem

International students often face:
- Lack of local knowledge about good places to go.
- Fear of arriving to empty/boring venues.
- Difficulty coordinating social plans and choosing where the crowd is going.
- Fragmented information about events, student nights, deals, and safety.

## 3) Target Users

**Primary market (core user):** International university students (18-28) in Nicosia, including:
- University of Nicosia
- Cyprus International University
- Near East University
- European University Cyprus
- Frederick University
- Erasmus participants

**Secondary audiences:**
- Tourists visiting Nicosia
- Young working adults (26-34)
- Event organizers and promoters
- Nightlife venues (clubs, bars, pubs, lounges, cafes)

## 4) Brand & Vision

**Mission:** To provide international students in Nicosia with a real-time, reliable, and engaging platform to discover nightlife spots, events, and social gatherings effortlessly.

**Vision:** To become the leading social nightlife discovery platform for students across Cyprus and, eventually, Europe, enabling young people to connect, explore, and enjoy their social lives confidently.

**Brand values:**
- Community
- Fun
- Confidence
- Inclusivity

**Visual identity (current direction):**
- Dark theme with brand palette
- Typography: Poppins for headings and Inter for body text (note: current app implementation uses Montserrat + Inter)

## 5) Market Context & Competition

**Market context (from project docs):**
- More than 15,000 students enter Nicosia per year.

**Competitors (from business plan) and positioning gap:**

| Competitor | Strengths | Gaps (WTG opportunity) |
|---|---|---|
| Eventbrite | Large brand, ticketing, wide categories | Not student-focused, not nightlife-specific, not real-time, no social planning loop |
| Fever | Curated paid experiences | Less focused on everyday nightlife, not Cyprus-local, not student-first |
| Ticketing platforms | Payments + tickets at scale | No nightlife discovery + social "who's going" signals |
| Cyprus Alive | Local events and listings | Old experience, not mobile-first, no real-time social signals |

**WTG competitive advantages (from business plan):**
- Focused specifically on nightlife for students
- Real-time "who's going" social information
- Group chats (planned)
- Automated reservations and guest lists (phased)
- Student deals and bar promotions (phased)
- Mobile-first experience

## 6) Value Proposition & Differentiation

**Value proposition (student side):** WTG Nicosia makes going out effortless by showing real-time nightlife trends, offering interactive maps, and enabling instant event bookings, all in one platform.

**Unique selling points:**
- Student-focused nightlife discovery (not a generic events directory).
- Real-time "Yes voters" and live vibe signals (reduces uncertainty).
- Operational value for venues: moves from manual guest lists to a smart check-in/booking database.

## 7) Product Principles (Non-negotiables)

- **Real-time and trustworthy:** live signals must be current, rate-limited, and abuse-resistant.
- **Low friction:** core value should work in under 60 seconds (open app -> see trend -> decide -> navigate).
- **Safety-aware by design:** reporting/moderation planned from the start; consent gates for sensitive data (chat/location).
- **Mobile-first clarity:** dark theme, scannable cards, and fast loading.
- **Role-based access:** user vs venue owner vs moderator/admin capabilities are explicit and enforced.

## 8) Current Product Surface (Repo Reality Check)

The current Expo app includes these screens/components:
- `screens/HomeScreen.js`: trending venues + voting + occupancy snapshot.
- `screens/CyprusMapScreen.js`: venue map markers + venue status.
- `screens/EventsScreen.js`: upcoming events + interest/going + booking CTA (includes placeholder Erasmus events).
- `screens/ProfileScreen.js`: auth (login/signup), profile, history, and owner/admin occupancy controls.
- Navigation: `components/BottomNav.js` includes a **Saved** tab, but `App.js` does not currently render a Saved screen.

Backend integration is via Supabase (`lib/supabaseClient.js`, `lib/supabaseApi.js`) with RPCs and realtime subscriptions.

## 9) Scope & Phasing

### Phase 0 - Stabilize MVP (now)
**Goal:** Replace dummy data with Supabase-backed data and ensure core loops are reliable.

**MVP must deliver:**
- Auth (email/password) with profile record creation.
- Home: list venues + real-time vote counts + user voting (yes/maybe/no).
- Map: venue markers + status snapshots.
- Events: upcoming events feed + interest/going + booking creation.
- Profile: user profile + basic history; owner/admin occupancy console (if role enabled).
- RLS, realtime, and a seed dataset for Nicosia.

### Phase 1 - Vibe Signals & Engagement
- Trending ranking that blends votes + freshness of status + recency.
- Check-ins/vibe notes + expiring badges ("packed", "chill", wait time).
- Push notifications (events starting soon; favorite venue turns busy).
- Filters/search across Home/Map/Events.

### Phase 2 - Events & Discovery Depth
- Rich event detail pages (dress code, age policy, lineup/tags).
- Favorites/history improvements and recommendations.
- Deals feed + sponsored placements (labeled).

### Phase 3 - Booking & Guest List
- In-app "Book/Join list" with party-size rules, QR confirmation, cancellation windows.
- Venue-side exports and partner bridge (edge/webhook).
- Arrival toggles + simple occupancy meter.

### Phase 4 - Chat, Community & Safety
- Venue/event chat auto-join on Yes/booking, with moderation/rate limits.
- Reporting for venue/event/user/message; moderator queue; block/mute; ban policy.

### Phase 5 - B2B Monetization & Analytics
- Owner dashboard CRUD (venues/events/deals/sponsored).
- Analytics for venues: foot traffic, peak hours, conversion.
- Billing: packages and invoicing.

### Phase 6 - Expansion
- Multi-city support, localization, operations and reliability upgrades.

## 10) Functional Requirements (Feature List)

The following list mirrors the business plan's feature set; the phases above determine ship order.

| Functionality | What the user sees/does | Backend/system must do |
|---|---|---|
| User Registration & Login | Sign up / log in with email, phone, or social (Google, Apple). | Create user accounts, auth, store profiles, manage sessions & security. |
| Venue & Event Browsing | List of clubs, bars, cafes, and events. | Fetch venues/events from DB; sort by time, popularity, distance. |
| Real-Time "Yes Voters" Count | See how many people said "Yes, I'm going" in real time. | Store RSVP/vote; update counts instantly; prevent duplicates. |
| "Yes / Maybe / No" RSVP | Tap Yes/Maybe/No. | Upsert per user; allow change; update aggregates live. |
| Vibe Indicator | See vibe (crowded, chill, music type, etc.). | Calculate vibe based on RSVPs, tags, attendance, ratings. |
| Event Details Screen | Photos, info, opening hours, music type, dress code, etc. | Store event data; retrieve on click; support media. |
| Real-Time Updates | Updates without refreshing (Yes counts, edits, deals). | Realtime listeners to push instant updates. |
| Group Chat for "Yes" Users | Users who click Yes join the event chat. | Create chat room per event; auto-join users; realtime messaging. |
| Push Notifications | Reminders, chat messages, updates, deals. | Integrate push service; schedule reminders; trigger notifications. |
| "Book Now" Button | Book a table/entry inside the app. | Create bookings; send data to club panel automatically. |
| Club Auto-Database | Venue gets automatic guest list (no manual typing). | Owner dashboard; export list; view RSVPs & bookings. |
| Deals & Discounts | Venue-specific offers visible on their profile. | Store deals per venue; show valid ones; auto-expire. |
| Map View & Navigation | Map showing venues + "open in Maps". | Map SDK; plot markers; deep-link navigation. |
| Search | Search by place, music type, vibe, price. | Search queries + filters + tags combined with live data. |
| User Profile & Preferences | Preferences: favorite music, budgets, visited places. | Store preferences/history; personalize recommendations. |
| Favorites | Save venues/events to revisit later. | Save favorites per user; show Saved list. |
| Reporting & Safety | Report events/chats if unsafe/misleading. | Store reports; moderation tools; block users/content. |
| Admin/Back-Office Panel | Manage venues, events, deals, analytics. | CRUD for all data; export reports; review safety issues. |

## 11) Screen-by-Screen Requirements (Codex-Friendly)

### Home (Trending + Voting)
**Primary job-to-be-done:** "Tell me where the vibe is right now and let me signal I'm going."

**Data requirements:**
- Trending venue list with: venue info, last24h yes count, current vibe/status (if present), cover image.
- Per-user vote state for each venue.
- Optional occupancy snapshot ("Inside now") for social proof.

**Backend contracts (current names):**
- RPC: `get_trending_venues`
- RPC: `upsert_vote(p_venue_id, p_status)` where `p_status in {yes, maybe, no}`
- Realtime: table changes on `venue_votes`, `venue_status`
- Optional broadcast: `rt-venue-votes-broadcast` (used in `lib/supabaseApi.js`)

**Acceptance criteria:**
- If logged out: user can browse venues but cannot vote; UI prompts login.
- If logged in: user can vote yes/maybe/no; vote persists and updates counts in near real-time.
- Vote spam is mitigated (server-side constraints + rate limits planned).
- Stale status/vibe is not shown as "fresh" (expiry policy planned).

### Map (Venue Discovery)
**Primary job-to-be-done:** "Show me what's nearby and let me decide where to go."

**Data requirements:**
- Active venues with geo coordinates.
- Latest status/vibe per venue.

**Backend contracts:**
- Table: `venues` (id, name, geo_lat, geo_lng, status=active)
- Table: `venue_status` (latest per venue)
- Realtime: `venue_status`

**Acceptance criteria:**
- Map loads venue markers from backend (not hardcoded).
- Selecting a marker shows venue info and a clear call-to-action (navigate / view details).

### Events (Upcoming + Interest + Booking)
**Primary job-to-be-done:** "Show me what's happening next and let me RSVP or book quickly."

**Data requirements:**
- Upcoming events feed, including event -> venue mapping and interested_count.

**Backend contracts:**
- RPC: `get_upcoming_events`
- RPC: `set_event_interest(p_event_id, p_status)` where `p_status in {interested, going}`
- RPC: `create_booking(p_event_id, p_venue_id, p_party_size)`

**Acceptance criteria:**
- Logged out: user can browse events; actions prompt login.
- Logged in: user can set interested/going; booking creates a record and confirms success.
- Booking obeys max party size defaults and cancellation policy (see "Configured Rules").

### Saved (Favorites)
**Status:** Intended in UI, not yet wired in `App.js`.

**Backend contracts:**
- RPC: `toggle_favorite(p_venue_id)`
- Table: `favorites`

**Acceptance criteria (when implemented):**
- Saved lists the user's favorite venues (and/or events if added later).
- User can remove favorites; list updates immediately.

### Profile (Auth + User History + Owner Console)
**Primary job-to-be-done (student):** "Manage my account and see what I've done."

**Primary job-to-be-done (owner/admin):** "Manage live occupancy and prep guest list operations."

**Backend contracts:**
- Tables: `users`, plus history tables (`venue_votes`, `event_interest`, `check_ins`, `favorites`)
- Storage: `avatars` bucket (private; signed URLs recommended)
- Owner/admin occupancy (current code paths reference): `venue_occupancy` + RPCs `increment_venue_occupancy`, `set_venue_occupancy`

**Acceptance criteria:**
- Signup creates an auth user and upserts a `users` profile row.
- Profile reads/writes are scoped by RLS (self-only).
- If role is `owner` or `admin`, the occupancy console is visible and updates reflect in real-time.

## 12) Roles & Permissions

**Roles (as documented):**
- `user`: browse, vote/interest, favorite, book, report, view own history.
- `owner`: manage own venues/events/deals; update status/occupancy; view bookings/guest list for owned venues.
- `moderator`: review/resolve reports; enforce community rules.
- `admin`: full access + seeding + ownership assignment.

**Security model:**
- Supabase Postgres with RLS as source of truth.
- "Write" actions are guarded via RPCs where appropriate (e.g., voting, bookings).

## 13) Configured Rules (Current Inputs)

**Booking & guest list rules:**
- Default max party size: `8`
- Cancellation window: `120 minutes` before event
- Confirmation format: `QR`

**Sponsorship (early placeholders):**
- Sponsored label text: `Sponsored`
- Benchmark price: `EUR 15` (placeholder)
- Budget caps: `EUR 30/day`, `EUR 150/week`
- Placeholder tiers: Home `EUR 20`, Events `EUR 15`, Map `EUR 10`

**Notifications:**
- "Starting soon" reminders: `150`, `60`, and `15` minutes before event start
- Favorite venue "busy" trigger: `>= 80% occupancy`
- Sponsored event alerts: max `2` per user per day; only if user activity in last `7` days

**Presence/occupancy:**
- Heartbeat interval: `30s`
- Expiry threshold: `90s`
- Occupancy payload type: status tags `empty|moderate|busy|full`

**Rate limits (targets):**
- Chat: `60/min`, `500/hour`
- Votes: `30/min`, `300/hour`
- Reports: `20/hour`

**Safety:**
- Report categories: `spam`, `harassment`, `fake_event`, `unsafe_behavior`
- Temp bans: `12h` first offense, `48h` second, `permanent` third
- Initial blocklist keywords: same as categories (placeholder)

## 14) Monetization (From Business Plan)

WTG uses:
- **B2C (freemium):** core discovery and planning free for students; premium value via offers and experiences.
- **B2B (value-based):** venues pay for operational tools and visibility that directly increase attendance and reduce manual work.

Revenue streams and suggested pricing (initial draft):
- Sponsored Listings: `EUR 150-EUR 300` per event promotion
- Event Promotions: `EUR 200-EUR 500` per promoted event
- Student Deals Advertising: `EUR 100-EUR 250` per deal
- Data Insights: `EUR 200-EUR 400` per month
- Reservations Commission: `EUR 1-EUR 2` per reservation, or `3-5%` of booking value
- Reservation & Guest-List Management: `EUR 150-EUR 350` per month per venue

Note: sponsorship pricing also appears as an early placeholder benchmark in "Configured Rules"; align these before investor distribution.

## 15) Success Metrics (What "Good" Looks Like)

**Student-side:**
- Weekly active users (WAU) in Nicosia student segment
- Votes per active user per week
- Event interest/going actions per week
- Map-to-navigation clicks

**Venue-side:**
- Number of onboarded venues (active)
- Bookings created per venue per week
- Guest list export usage
- Paid placements purchased and retained

## 16) Key Risks & Mitigations (Product-Level)

- **Cold start (empty feeds):** seed realistic data; bootstrap with partner venues/events; highlight curated Erasmus picks.
- **Spam/abuse of votes/chat:** rate limits + RLS + audit logging + moderation workflow.
- **Data freshness:** expire stale vibe/status; show timestamps; enforce update cadence.
- **Privacy (location/chat):** consent gates; short TTL for location presence; role-based access and logging.

## 17) Technical Constraints & Implementation Notes (For Builders)

- **Client stack:** Expo (React Native), `@supabase/supabase-js`, `react-native-maps`.
- **Backend:** Supabase Postgres + RLS + Storage + Realtime + RPCs.
- **Secrets:** never ship `SUPABASE_SERVICE_ROLE_KEY` to the client; client uses `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- **Single source of truth for schema/contracts:** `md files/BACKEND_OVERVIEW.md` and `md files/README.md` (Supabase implementation plan).
