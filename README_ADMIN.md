# Admin Console (built-in)

This repo includes a built-in Admin Console at:

- `/admin/login`
- `/admin/*` (protected)

It is **separate** from the normal application login. Admins sign in with a **username + password** stored in `public.admin_users`.

## 1) Apply Supabase SQL

Run the SQL in:

- `SUPABASE_SCHEMA_AND_RLS_FIXED_v2.sql`

Specifically, ensure you have executed:

- `7) Site Builder (CMS pages)` (already present from the previous patch)
- `8) Admin Console (username-based) + extended CMS` (appended)

## 2) Server environment variables (Vercel / local)

Required for admin console data access:

- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY` (**server-only**, never expose to the browser)

For the SQL editor:

- `SUPABASE_DB_URL` (or `DATABASE_URL` / `POSTGRES_URL`) — a Postgres connection string

For Llama (AI drafts):

- `LLM_BASE_URL` (OpenAI-compatible endpoint, must include `/v1` if your server expects it)
- `LLM_API_KEY` (optional)
- `LLM_MODEL` (example: `llama-3.1-70b-instruct`)

For GitHub Sync:

- `GITHUB_SYNC_TOKEN` (PAT with repo scope)
- `GITHUB_SYNC_REPO` (`owner/repo`)
- `GITHUB_SYNC_BRANCH` (optional, default `main`)
- `GITHUB_SYNC_PATH_PREFIX` (optional, default `cms-export`)

## 3) Bootstrap the first root admin

Set an env var:

- `ADMIN_BOOTSTRAP_TOKEN` (random long string)

Then call:

```bash
curl -X POST "http://localhost:3000/api/admin-auth/bootstrap" \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: YOUR_ADMIN_BOOTSTRAP_TOKEN" \
  -d '{"username":"root","password":"CHANGE_ME_NOW"}'
```

Now visit `/admin/login` and sign in.

## Notes on security

- Admin sessions are stored in `public.admin_sessions` and set as an **HttpOnly** cookie (`sk_admin_session`).
- Root-only routes include: GitHub Sync, SQL runner, audit log, deleting nav/assets/redirects, user management.
- Do not share your service role key, DB URL, or GitHub token with anyone.
