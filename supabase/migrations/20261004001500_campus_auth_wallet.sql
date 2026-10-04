-- Connect new Supabase Auth identities to the simulated Campus Marketplace wallet.
-- New accounts start at $0; development demo balances are applied by supabase/seed.sql.

create or replace function public.campus_create_wallet_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.campus_wallets (user_id, available_cents)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.campus_create_wallet_for_new_user() from public, anon, authenticated;

drop trigger if exists campus_auth_user_wallet on auth.users;
create trigger campus_auth_user_wallet
  after insert on auth.users
  for each row execute function public.campus_create_wallet_for_new_user();

insert into public.campus_wallets (user_id, available_cents)
select id, 0 from auth.users
on conflict (user_id) do nothing;
