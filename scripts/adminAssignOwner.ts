import { supabaseAdmin } from '../utils/supabaseAdmin';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function findUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`List users failed: ${error.message}`);
  const user = data.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error(`User not found: ${email}`);
  return user;
}

async function findVenue(venueArg: string) {
  if (isUuid(venueArg)) {
    const { data, error } = await supabaseAdmin.from('venues').select('id, name').eq('id', venueArg).single();
    if (error) throw new Error(`Venue lookup failed: ${error.message}`);
    return data;
  }

  const { data, error } = await supabaseAdmin
    .from('venues')
    .select('id, name')
    .ilike('name', `%${venueArg}%`);
  if (error) throw new Error(`Venue lookup failed: ${error.message}`);
  if (!data || data.length === 0) throw new Error(`No venues match: ${venueArg}`);

  const exact = data.find((v) => v.name.toLowerCase() === venueArg.toLowerCase());
  if (exact) return exact;

  if (data.length > 1) {
    const choices = data.map((v) => `${v.id} | ${v.name}`).join('\n');
    throw new Error(`Multiple venues match "${venueArg}". Be specific:\n${choices}`);
  }

  return data[0];
}

async function main() {
  const email = process.argv[2];
  const venueArg = process.argv[3];

  if (!email || !venueArg) {
    console.error('Usage: ts-node scripts/adminAssignOwner.ts <email> <venue_id_or_name>');
    process.exit(1);
  }

  const user = await findUserByEmail(email);
  const venue = await findVenue(venueArg);

  const { error: profileErr } = await supabaseAdmin
    .from('users')
    .upsert({ id: user.id, email: user.email ?? email, role: 'owner' }, { onConflict: 'id' });
  if (profileErr) {
    console.error('Upsert profile failed:', profileErr.message);
    process.exit(1);
  }

  const { data: venueRow, error: venueErr } = await supabaseAdmin
    .from('venues')
    .update({ owner_id: user.id })
    .eq('id', venue.id)
    .select('id, name, owner_id')
    .single();
  if (venueErr) {
    console.error('Assign venue failed:', venueErr.message);
    process.exit(1);
  }

  console.log(`Assigned ${email} (${user.id}) as owner of ${venueRow.name} (${venueRow.id}).`);
}

main().catch((err) => {
  console.error('Unexpected error:', err.message || err);
  process.exit(1);
});
