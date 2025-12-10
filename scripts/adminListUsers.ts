import { supabaseAdmin } from '../utils/supabaseAdmin';

async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (error) {
    console.error('List users failed:', error.message);
    process.exit(1);
  }
  console.log(`Users (count ${data?.users?.length ?? 0}):`);
  (data?.users ?? []).forEach((u) => {
    console.log(`- ${u.id} | ${u.email} | confirmed: ${!!u.email_confirmed_at}`);
  });
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
