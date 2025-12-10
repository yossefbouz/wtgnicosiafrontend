import { supabaseAdmin } from '../utils/supabaseAdmin';

async function main() {
  const venues = [
    { name: 'Dev Venue A', city: 'Nicosia', address: '123 Demo St', geo_lat: 35.17, geo_lng: 33.36, tags: ['chill'] },
    { name: 'Dev Venue B', city: 'Nicosia', address: '456 Demo St', geo_lat: 35.18, geo_lng: 33.37, tags: ['party'] },
  ];

  const { data: venueRows, error: venueErr } = await supabaseAdmin
    .from('venues')
    .upsert(venues, { onConflict: 'name' })
    .select();
  if (venueErr) {
    console.error('Upsert venues failed:', venueErr.message);
    process.exit(1);
  }

  const events = venueRows.slice(0, 2).map((v, idx) => ({
    venue_id: v.id,
    title: `Demo Event ${idx + 1}`,
    description: 'Auto-inserted dev event',
    start_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    end_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    price_range: 'Free',
    cover_url: v.cover_url || null,
  }));

  const { error: eventsErr } = await supabaseAdmin.from('events').upsert(events).select();
  if (eventsErr) {
    console.error('Upsert events failed:', eventsErr.message);
    process.exit(1);
  }

  console.log('Inserted/updated demo venues and events.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
