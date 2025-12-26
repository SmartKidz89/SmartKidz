-- Subscriptions table used for entitlements (Stripe webhook upserts here)
-- If you already have this table, verify columns and constraints match.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid null,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status text not null,
  current_period_end timestamptz null,
  plan text null,
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_subscriptions_parent_id on public.subscriptions(parent_id);

-- RLS: parents can read their own subscription status.
alter table public.subscriptions enable row level security;

create policy if not exists "parents_read_own_subscription"
on public.subscriptions for select
using (auth.uid() = parent_id);

-- Service role writes via webhook (no policy required for service role).
