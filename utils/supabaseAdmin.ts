// -----------------------------------------------------------------------------
// CRITICAL WARNING:
// This file uses the SUPABASE_SERVICE_ROLE_KEY.
// NEVER import this file into any React Native component or client-side code (`screens/`, `components/`, etc).
// Doing so will compromise your database security by bundling the admin logic (and potentially keys if misconfigured) into the app.
// This is strictly for usage in local node scripts (e.g. `scripts/`) or server-side edge functions.
// -----------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js';

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const supabaseUrl = requireEnv('EXPO_PUBLIC_SUPABASE_URL');
const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export function assertAdminEnv() {
  return { supabaseUrl, serviceRoleKey };
}
