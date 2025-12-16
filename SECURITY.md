# Security Policy

## API Keys and Secrets

This project uses **Supabase**. To keep the application secure:

1.  **Environment Variables**: Never hardcode API keys. Use `.env` files.
    - `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are safe to be in the client bundle (they are restricted by RLS).
    - `SUPABASE_SERVICE_ROLE_KEY` is **Admin-only**. It bypasses all RLS. **NEVER** include this in the client app or commit it to the repo. Only use it in local scripts or server-side edge functions.

2.  **Row Level Security (RLS)**:
    - Ensure all tables in Supabase have RLS enabled.
    - Policies should strictly limit `select`, `insert`, `update`, and `delete` operations based on `auth.uid()`.

3.  **Gitignore**:
    - Ensure `.env` is ignored.
    - Do not commit files containing real secrets (like filled-out `CONFIG_INPUTS.md`).

## Reporting Vulnerabilities

If you find a security issue, please contact the maintainers directly instead of opening a public issue.
