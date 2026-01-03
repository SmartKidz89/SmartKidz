-- 0005_access_codes.sql
-- Friends & family access-code bypass

alter table public.profiles
add column if not exists subscription_bypass boolean not null default false;

-- Extend has_active_subscription() to treat bypass users as entitled.
create or replace function public.has_active_subscription()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(
      (select p.subscription_bypass from public.profiles p where p.id = auth.uid()),
      false
    )
    or exists (
      select 1
      from public.subscriptions s
      where s.parent_id = auth.uid()
        and s.status in ('trialing', 'active')
        and (s.current_period_end is null or s.current_period_end > now() - interval '1 day')
    );
$$;

create table if not exists public.access_codes (
  code text primary key,
  max_uses int not null default 1 check (max_uses >= 1),
  uses int not null default 0 check (uses >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.access_codes enable row level security;

-- Redeem a code for the current user.
-- This function increments uses, then sets profiles.subscription_bypass = true for auth.uid().
create or replace function public.redeem_access_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.access_codes%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'Not signed in');
  end if;

  select * into v
  from public.access_codes
  where code = p_code;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Invalid code');
  end if;

  if v.expires_at is not null and v.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'Code expired');
  end if;

  if v.uses >= v.max_uses then
    return jsonb_build_object('ok', false, 'error', 'Code already used');
  end if;

  update public.access_codes
  set uses = uses + 1
  where code = p_code;

  update public.profiles
  set subscription_bypass = true
  where id = auth.uid();

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.redeem_access_code(text) to authenticated;

-- Note: create/manage codes using SQL or service role. No direct client access is granted.
revoke all on public.access_codes from anon, authenticated;
