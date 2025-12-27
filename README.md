# Smart Kidz (MVP)

A polished Next.js (React) starter for the Smart Kidz marketing site + gated learning app.
- Supabase Auth + Postgres schema (RLS included)
- Stripe Checkout (monthly + annual) + webhook to store subscription status
- Calm UI with Tailwind

## 1) Prereqs (Windows)
- Install Node.js LTS (includes npm)
- Install Git (optional)
- Create accounts: Supabase + Stripe

## 2) Run locally
1. Copy `.env.example` → `.env`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000

## 3) Create your Supabase project
1. Go to Supabase → New project
2. In **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (server only)

3. In Supabase **SQL Editor**, run:
   - `SUPABASE_SCHEMA_AND_RLS.sql`

## 4) Configure Auth
Supabase → Authentication → Providers
- Email enabled (default)
- Optional: disable email confirmations for fastest MVP testing (turn back on later)

## 5) Stripe setup (Monthly + Annual)
1. Stripe Dashboard → Products → Add product: “Smart Kidz Subscription”
2. Add two recurring prices:
   - Monthly
   - Yearly
3. Put those Price IDs into `.env`:
   - `STRIPE_PRICE_MONTHLY=price_...`
   - `STRIPE_PRICE_ANNUAL=price_...`

## 6) Stripe Webhook
You need Stripe to tell your app when subscriptions change.

### Local testing (recommended)
1. Install Stripe CLI
2. Run:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Copy the webhook signing secret into:
   - `STRIPE_WEBHOOK_SECRET=whsec_...`

### Events to enable (Stripe)
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted

## 7) Production deploy
Easiest: Vercel
- Import repo
- Add env vars
- Deploy
- Set Stripe webhook URL to:
  `https://YOURDOMAIN.com/api/stripe/webhook`

## Notes
- This starter gates `/app` behind “active/trialing” subscription in `subscriptions` table.
- For a production-ready mapping between Stripe customers and Supabase users, extend checkout creation to attach `metadata.parent_id` and/or `customer_email`.


## Lesson Builder (Parents + Teachers)
- Run additional migration: `supabase/migrations/0002_lesson_builder.sql`
- Visit `/app/builder` after login to generate custom lessons.
- Optional AI generation: set `OPENAI_API_KEY` (and `OPENAI_MODEL`) in env vars.


## Writing & Tracing Studio (English)
- Visit `/app/english/writing` for letter tracing and sentence writing practice.
- Documentation: `docs/WRITING_STUDIO.md`


## Writing Studio Attempts
- Run migration: `supabase/migrations/0003_attempts.sql` to enable saving/review of practice attempts.


## Writing Studio Phase 4 (Path Matching)
- Letter tracing now includes a template-based similarity score.
- Docs: `docs/WRITING_STUDIO_PHASE4_PATH_MATCHING.md`


## Reading Studio (Prep–Year 3)
- Visit `/app/english/reading`.
- Content: `data/reading/library.json`
- Docs: `docs/READING_STUDIO.md`


## Today (Daily 3‑Mission Flow)
- Visit `/app/today`.
- Mark mission complete via `/app/today/complete?mission=...`.
- Docs: `docs/TODAY_DAILY_FLOW.md`


## Admin Content Manager (RBAC)

The `/app/admin/content` editor is protected by server-side RBAC. To enable admin writes in Supabase, apply:

- `docs/SUPABASE_ADMIN_RBAC_RLS.sql`

Then set `profiles.role = 'admin'` for your admin user.


## Vercel build note

If Vercel reports it cannot find an `app/` or `pages/` directory, ensure your Vercel Project "Root Directory" is set to the repository root (the folder containing `package.json`).
