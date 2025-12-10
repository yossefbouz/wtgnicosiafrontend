import { supabaseAdmin, assertAdminEnv } from './supabaseAdmin';

export async function runHealthCheck() {
  try {
    assertAdminEnv();

    const [{ data: users, error: usersErr }, { data: venues, error: venuesErr }] = await Promise.all([
      supabaseAdmin.from('users').select('id,email,display_name').limit(1),
      supabaseAdmin.from('venues').select('id,name,city').limit(1),
    ]);

    if (usersErr || venuesErr) {
      const messages = [usersErr?.message, venuesErr?.message].filter(Boolean).join('; ');
      throw new Error(messages || 'Unknown Supabase error');
    }

    console.log('Supabase connectivity OK.');
    console.log('Sample user:', users?.[0] ?? 'none');
    console.log('Sample venue:', venues?.[0] ?? 'none');
    return true;
  } catch (err: any) {
    console.error('Supabase health check failed:', err.message);
    return false;
  }
}

// Allow running directly in Node/ts-node
if (require.main === module) {
  runHealthCheck().then((ok) => {
    process.exit(ok ? 0 : 1);
  });
}
