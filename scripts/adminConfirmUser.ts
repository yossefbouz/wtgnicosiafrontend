import { supabaseAdmin } from '../utils/supabaseAdmin';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: ts-node scripts/adminConfirmUser.ts <email>');
    process.exit(1);
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error('List users failed:', error.message);
    process.exit(1);
  }

  const user = data.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });
  if (updateErr) {
    console.error('Confirm user failed:', updateErr.message);
    process.exit(1);
  }

  console.log(`Confirmed user ${email} (${user.id})`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
