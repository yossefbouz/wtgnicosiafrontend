// Lightweight mock helpers for running the app without Supabase.
// Toggle via EXPO_PUBLIC_USE_MOCK_DATA=true (or missing Supabase envs).

export const MOCK_USER = {
  id: 'mock-user-id',
  email: 'mock.user@wtg.local',
  display_name: 'Mock User',
};

export const MOCK_EVENTS = [
  {
    id: 'mock-event-1',
    venue_id: 'mock-venue-1',
    title: 'Mock Sunset Rooftop',
    description: 'Chill sunset session with a soft DJ set.',
    start_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    venue_name: 'Skyline Lounge',
    cover_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    interested_count: 64,
    tag: 'Mock',
  },
  {
    id: 'mock-event-2',
    venue_id: 'mock-venue-2',
    title: 'Mock Beach Fires',
    description: 'Acoustic guitars and late-night swims.',
    start_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    venue_name: 'Coral Bay',
    cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    interested_count: 91,
    tag: 'Mock',
  },
];

export function createMockBooking({ eventId, venueId, partySize, contactName }) {
  return {
    id: `mock-booking-${Date.now()}`,
    user_id: MOCK_USER.id,
    event_id: eventId || null,
    venue_id: venueId,
    slots_int: partySize,
    status: 'confirmed',
    meta: {
      contact_name: contactName,
      party_size: partySize,
      mode: 'mock',
    },
    created_at: new Date().toISOString(),
  };
}
