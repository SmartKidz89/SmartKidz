# Smart Kidz · Supabase Setup (Schema + RLS)

## 1) Create a Supabase project
- Go to Supabase and create a new project
- Save your Project URL and Anon Key (you’ll use these in the web app `.env.local`)

## 2) Run the schema + RLS SQL
- In Supabase dashboard → **SQL Editor**
- Create a new query
- Paste in `supabase/schema_and_rls.sql`
- Run it

## 3) Seed reference data (recommended)
Run this in SQL Editor (edit if you want different ordering):

```sql
insert into public.subjects (id, name, sort_order) values
('MATH','Mathematics', 1),
('ENG','English', 2),
('SCI','Science', 3)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;
```

## 4) Auth settings
- Supabase → Authentication → Providers
- Enable **Email** (password)
- Optionally enable Google later

## 5) Confirm preview access
The public preview pages use:
- `subjects`
- `skills`
- `lesson_catalog`

These are safe for `anon` read access.

Full lesson content is gated by `subscriptions`:
- `lessons` table is readable only when `has_active_subscription()` is true.

## 6) What to do next
- Add Stripe (Phase 3): webhook writes into `public.subscriptions`
- Build the React/Next site (Phase 4): app reads `lesson_catalog` for previews, `lessons` for full content.
