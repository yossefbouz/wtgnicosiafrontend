import { supabaseAdmin } from '../utils/supabaseAdmin';

async function main() {
  const venueId = process.argv[2];
  if (!venueId) {
    console.error('Usage: ts-node scripts/adminExportGuestList.ts <venue_id>');
    process.exit(1);
  }

  const { data, error } = await supabaseAdmin
    .from('guest_list_entries')
    .select('id, venue_id, event_id, user_id, party_size, status, created_at')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Export guest list failed:', error.message);
    process.exit(1);
  }

  console.log(`Guest list entries for venue ${venueId} (count ${data.length}):`);
  data.forEach((row) => console.log(row));
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
