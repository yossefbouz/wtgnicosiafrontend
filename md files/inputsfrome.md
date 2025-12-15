## Inputs Needed from You

- Booking: default max party size; cancellation window; confirmation format (QR vs alphanumeric).\
max party size  
- Deals/Sponsorship: sponsored label text; pricing tiers per screen; daily/weekly budget caps.
- Safety: report categories; escalation path (moderator → admin?); default temp-ban durations; initial blocklist keywords.
- Notifications: timing for “starting soon”; trigger rules for favorites turning busy; triggers for sponsored event alerts.
- Admin & Access: initial admin emails; initial venue owners mapped to venue IDs.
- Presence/Occupancy: heartbeat interval; expiry threshold; occupancy update payload (counts vs status tags).
- Rate limits: thresholds for chat/votes/reports (per minute/hour).

1. 1. Booking
booking:
  max_party_size_default: 8
  cancellation_window_minutes: 120
  confirmation_format: qr


Why

8 fits most restaurants/events without abuse

120 min protects venues while remaining user-friendly

QR = faster check-in, harder to fake than plain codes

2.  sponsorship:
  sponsored_label_text: "Sponsored"
  benchmark_price_eur: 15
  budget_caps:
    daily_eur: 30
    weekly_eur: 150
3. notifications:
  starting_soon:
    -150 minutes before
    - 60_minutes_before
    - 15_minutes_before
  favorite_venue_busy_trigger:
    occupancy_percentage: 80
  sponsored_event_alerts:
    max_per_user_per_day: 2
    require_user_activity_last_days: 7
4. admin & access:
  initial_admin_emails:
    - youssefbouzgarrouyb@gmail.com
    
  initial_venue_owners:
    3d3a2b5e-1f21-4c9b-9c4b-2c1d3ab6c8f3: owner@example.com # Old Town Social (mock)
    5f0b7d9b-43cf-4a18-97c9-98e92dd33b2d: another_owner@example.com # Marina Club (mock)
presence:
  heartbeat_interval_seconds: 30
  expiry_threshold_seconds: 90
  occupancy_update_payload:
    type: status_tags
    allowed_tags:
      - empty
      - moderate
      - busy
      - full
6. rate_limits:
  chat:
    per_minute: 60
    per_hour: 500
  votes:
    per_minute: 30
    per_hour: 300
  reports:
    per_hour: 20

7. safety:
  report_categories:
    - spam
    - harassment
    - fake_event
    - unsafe_behavior
8. temp_ban_durations:
  first_offense_hours: 12
  second_offense_hours: 48
  third_offense: permanent

9. blocklist_keywords:
  - "spam"
  - "harassment"
  - "fake_event"
  - "unsafe_behavior"
10. clarify sponsorship pricing tiers per screen
    - fill it with dummy data


