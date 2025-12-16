-- Run this query in your Supabase SQL Editor to verify RLS is enabled on all tables.
-- You should see 'true' for every table.

SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
JOIN pg_class ON pg_class.relname = pg_tables.tablename
WHERE schemaname = 'public'
ORDER BY tablename;
