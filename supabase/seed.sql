-- Development-only, repeatable Licks demo reset.
-- `supabase db reset` runs this file locally. Never run it against production.

truncate table
  public.campus_receipts,
  public.campus_meetup_codes,
  public.campus_wallet_holds,
  public.campus_transactions,
  public.campus_listings,
  public.campus_wallets
restart identity cascade;

delete from auth.identities
where user_id in (
  '00000000-0000-4000-a000-000000000001'::uuid,
  '00000000-0000-4000-a000-000000000002'::uuid
);
delete from auth.users
where id in (
  '00000000-0000-4000-a000-000000000001'::uuid,
  '00000000-0000-4000-a000-000000000002'::uuid
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-a000-000000000001',
  'authenticated', 'authenticated', 'sarah@campus.demo',
  extensions.crypt('CampusDemo123!', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"name":"Sarah"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-a000-000000000002',
  'authenticated', 'authenticated', 'alex@campus.demo',
  extensions.crypt('CampusDemo123!', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"name":"Alex"}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
(
  '00000000-0000-4000-b000-000000000001', 'sarah@campus.demo',
  '00000000-0000-4000-a000-000000000001',
  '{"sub":"00000000-0000-4000-a000-000000000001","email":"sarah@campus.demo"}',
  'email', now(), now(), now()
),
(
  '00000000-0000-4000-b000-000000000002', 'alex@campus.demo',
  '00000000-0000-4000-a000-000000000002',
  '{"sub":"00000000-0000-4000-a000-000000000002","email":"alex@campus.demo"}',
  'email', now(), now(), now()
);

insert into public.campus_wallets (user_id, available_cents) values
  ('00000000-0000-4000-a000-000000000001', 0),
  ('00000000-0000-4000-a000-000000000002', 80000)
on conflict (user_id) do update set
  available_cents = excluded.available_cents,
  updated_at = now();

insert into public.campus_listings (
  id, seller_id, title, description, price_cents, state, meetup_options
) values (
  '00000000-0000-4000-a000-000000000100',
  '00000000-0000-4000-a000-000000000001',
  'MacBook',
  'Demo MacBook listed by Sarah for the Licks walkthrough.',
  50000,
  'available',
  '[
    {"startsAt":"2030-09-10T21:00:00.000Z","location":"Student Union — North Entrance"},
    {"startsAt":"2030-09-11T19:30:00.000Z","location":"Main Library — Welcome Desk"}
  ]'::jsonb
);
