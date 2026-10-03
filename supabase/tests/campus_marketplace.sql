begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(41);

create or replace function public.campus_test_actor(p_user_id uuid)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', p_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
end;
$$;

create or replace function public.campus_test_reset(p_alex_balance bigint default 80000)
returns void language plpgsql as $$
begin
  delete from public.campus_receipts;
  delete from public.campus_meetup_codes;
  delete from public.campus_wallet_holds;
  update public.campus_listings set state = 'available', current_transaction_id = null;
  delete from public.campus_transactions;
  insert into public.campus_wallets (user_id, available_cents) values
    ('00000000-0000-4000-a000-000000000001', 0),
    ('00000000-0000-4000-a000-000000000002', p_alex_balance)
  on conflict (user_id) do update set available_cents = excluded.available_cents;
end;
$$;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-a000-000000000003',
  'authenticated', 'authenticated', 'casey@campus.demo',
  extensions.crypt('CampusDemo123!', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"name":"Casey"}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;
insert into public.campus_wallets (user_id, available_cents)
values ('00000000-0000-4000-a000-000000000003', 100000)
on conflict (user_id) do update set available_cents = excluded.available_cents;

select public.campus_test_reset();
select public.campus_test_actor('00000000-0000-4000-a000-000000000001');
select is(
  public.campus_reserve_listing(
    '00000000-0000-4000-a000-000000000100',
    '2030-09-10T21:00:00.000Z',
    'Student Union — North Entrance'
  )->'error'->>'code',
  'SELF_PURCHASE_NOT_ALLOWED',
  'seller cannot reserve their own listing'
);

select public.campus_test_actor('00000000-0000-4000-a000-000000000002');
do $$
declare v_result jsonb;
begin
  v_result := public.campus_reserve_listing(
    '00000000-0000-4000-a000-000000000100',
    '2030-09-10T21:00:00.000Z',
    'Student Union — North Entrance'
  );
  perform set_config('test.transaction_id', v_result->'data'->>'id', true);
  perform set_config('test.reserve_result', v_result::text, true);
end;
$$;
select is(current_setting('test.reserve_result')::jsonb->>'ok', 'true', 'Alex reserves the MacBook');
select is((select available_cents from public.campus_wallets where user_id = '00000000-0000-4000-a000-000000000002'), 30000::bigint, 'reservation deducts the simulated hold');
select is((select amount_cents from public.campus_wallet_holds where transaction_id = current_setting('test.transaction_id')::uuid), 50000::bigint, 'reservation records a $500 hold');
select is(
  public.campus_reserve_listing(
    '00000000-0000-4000-a000-000000000100',
    '2030-09-10T21:00:00.000Z',
    'Student Union — North Entrance'
  )->>'idempotent',
  'true',
  'identical reservation retry is idempotent'
);
select is((select count(*) from public.campus_wallet_holds), 1::bigint, 'reservation retry creates no second hold');

select public.campus_test_actor('00000000-0000-4000-a000-000000000003');
select is(
  public.campus_reserve_listing(
    '00000000-0000-4000-a000-000000000100',
    '2030-09-10T21:00:00.000Z',
    'Student Union — North Entrance'
  )->'error'->>'code',
  'LISTING_UNAVAILABLE',
  'a different buyer cannot reserve the held listing'
);
select is(public.campus_get_transaction(current_setting('test.transaction_id')::uuid)->'error'->>'code', 'TRANSACTION_FORBIDDEN', 'outsider cannot read private transaction data');

select public.campus_test_actor('00000000-0000-4000-a000-000000000001');
do $$
declare v_result jsonb;
begin
  v_result := public.campus_generate_meetup_code(current_setting('test.transaction_id')::uuid);
  perform set_config('test.meetup_code', v_result->'data'->>'code', true);
  perform set_config(
    'test.wrong_code',
    case when v_result->'data'->>'code' = '000000' then '000001' else '000000' end,
    true
  );
end;
$$;
select matches(current_setting('test.meetup_code'), '^[0-9]{6}$', 'seller receives a six-digit code');
select is(public.campus_verify_meetup_code(current_setting('test.transaction_id')::uuid, current_setting('test.meetup_code'))->'error'->>'code', 'BUYER_ONLY', 'seller cannot verify the buyer code');

select public.campus_test_actor('00000000-0000-4000-a000-000000000002');
select is(public.campus_verify_meetup_code(current_setting('test.transaction_id')::uuid, current_setting('test.wrong_code'))->'error'->>'code', 'MEETUP_CODE_INVALID', 'wrong code is rejected');
select is((select incorrect_attempts from public.campus_meetup_codes where transaction_id = current_setting('test.transaction_id')::uuid), 1, 'wrong code attempt persists');
select isnt(public.campus_verify_meetup_code(current_setting('test.transaction_id')::uuid, current_setting('test.meetup_code'))->'data'->'meetupCode'->>'verifiedAt', null::text, 'correct code persists verification');

select public.campus_test_actor('00000000-0000-4000-a000-000000000001');
select is(public.campus_approve_price(current_setting('test.transaction_id')::uuid, 1)->'data'->'approvals'->>'sellerApproved', 'true', 'seller approves their own side');
select public.campus_test_actor('00000000-0000-4000-a000-000000000002');
select is(public.campus_approve_price(current_setting('test.transaction_id')::uuid, 1)->'data'->'approvals'->>'buyerApproved', 'true', 'buyer approves their own side');

select public.campus_test_actor('00000000-0000-4000-a000-000000000001');
do $$
declare v_result jsonb;
begin
  v_result := public.campus_change_final_price(current_setting('test.transaction_id')::uuid, 45000, 1);
  perform set_config('test.price_result', v_result::text, true);
end;
$$;
select is(current_setting('test.price_result')::jsonb->>'ok', 'true', 'seller lowers price to $450');
select is((current_setting('test.price_result')::jsonb->'data'->>'priceVersion')::integer, 2, 'price change increments version');
select is(
  current_setting('test.price_result')::jsonb->'data'->'approvals',
  '{"priceVersion":2,"sellerApproved":false,"buyerApproved":false}'::jsonb,
  'price change clears both approvals'
);
select public.campus_test_actor('00000000-0000-4000-a000-000000000002');
select is(public.campus_approve_price(current_setting('test.transaction_id')::uuid, 1)->'error'->>'code', 'STALE_PRICE_VERSION', 'stale approval is rejected');
select is(public.campus_approve_price(current_setting('test.transaction_id')::uuid, 2)->'data'->'approvals'->>'buyerApproved', 'true', 'buyer approves version two');
select public.campus_test_actor('00000000-0000-4000-a000-000000000001');
select is(public.campus_approve_price(current_setting('test.transaction_id')::uuid, 2)->'data'->'approvals'->>'sellerApproved', 'true', 'seller approves version two');

select public.campus_test_actor('00000000-0000-4000-a000-000000000002');
do $$
declare v_result jsonb;
begin
  v_result := public.campus_complete_transaction(current_setting('test.transaction_id')::uuid);
  perform set_config('test.complete_result', v_result::text, true);
end;
$$;
select is(current_setting('test.complete_result')::jsonb->'data'->>'status', 'completed', 'verified and approved transaction completes');
select is(current_setting('test.complete_result')::jsonb->'data'->'receipt'->>'paymentMode', 'simulated_wallet', 'receipt clearly identifies simulated payment');
select is(public.campus_complete_transaction(current_setting('test.transaction_id')::uuid)->>'idempotent', 'true', 'duplicate completion is idempotent');
select is((select count(*) from public.campus_receipts), 1::bigint, 'completion records exactly one receipt');
select is((select available_cents from public.campus_wallets where user_id = '00000000-0000-4000-a000-000000000002'), 35000::bigint, 'Alex has $350 after the $450 settlement');
select is((select available_cents from public.campus_wallets where user_id = '00000000-0000-4000-a000-000000000001'), 45000::bigint, 'Sarah gains $450 simulated credits');
select is((select count(*) from public.campus_wallet_holds where status = 'held'), 0::bigint, 'settlement leaves no active hold');
select is((select state from public.campus_listings where id = '00000000-0000-4000-a000-000000000100'), 'sold', 'settlement marks listing sold');

select public.campus_test_reset();
select public.campus_test_actor('00000000-0000-4000-a000-000000000002');
do $$
declare v_result jsonb;
begin
  v_result := public.campus_reserve_listing('00000000-0000-4000-a000-000000000100', '2030-09-10T21:00:00.000Z', 'Student Union — North Entrance');
  perform set_config('test.cancel_tx', v_result->'data'->>'id', true);
end;
$$;
select is(public.campus_cancel_transaction(current_setting('test.cancel_tx')::uuid)->'data'->>'status', 'canceled', 'participant can cancel before completion');
select is(public.campus_cancel_transaction(current_setting('test.cancel_tx')::uuid)->>'idempotent', 'true', 'duplicate cancellation is idempotent');
select is((select available_cents from public.campus_wallets where user_id = '00000000-0000-4000-a000-000000000002'), 80000::bigint, 'cancellation releases buyer funds once');
select is((select count(*) from public.campus_wallet_holds where status = 'held'), 0::bigint, 'cancellation leaves no active hold');
select is((select state from public.campus_listings where id = '00000000-0000-4000-a000-000000000100'), 'available', 'cancellation makes listing available');
select is(public.campus_complete_transaction(current_setting('test.cancel_tx')::uuid)->'error'->>'code', 'TRANSACTION_CANCELED', 'canceled transaction cannot complete');

select public.campus_test_reset(49999);
select public.campus_test_actor('00000000-0000-4000-a000-000000000002');
select is(
  public.campus_reserve_listing('00000000-0000-4000-a000-000000000100', '2030-09-10T21:00:00.000Z', 'Student Union — North Entrance')->'error'->>'code',
  'INSUFFICIENT_SIMULATED_FUNDS',
  'insufficient simulated funds reject reservation'
);
select is((select state from public.campus_listings where id = '00000000-0000-4000-a000-000000000100'), 'available', 'failed funds check leaves listing available');
select is((select count(*) from public.campus_wallet_holds), 0::bigint, 'failed funds check creates no hold');

select public.campus_test_reset();
select public.campus_test_actor('00000000-0000-4000-a000-000000000002');
do $$
declare v_result jsonb;
begin
  v_result := public.campus_reserve_listing('00000000-0000-4000-a000-000000000100', '2030-09-10T21:00:00.000Z', 'Student Union — North Entrance');
  perform set_config('test.code_tx', v_result->'data'->>'id', true);
end;
$$;
select public.campus_test_actor('00000000-0000-4000-a000-000000000001');
select public.campus_generate_meetup_code(current_setting('test.code_tx')::uuid);
update public.campus_meetup_codes
set code_hash = extensions.crypt('999999', extensions.gen_salt('bf', 8))
where transaction_id = current_setting('test.code_tx')::uuid;
update public.campus_meetup_codes set expires_at = now() - interval '1 second' where transaction_id = current_setting('test.code_tx')::uuid;
select public.campus_test_actor('00000000-0000-4000-a000-000000000002');
select is(public.campus_verify_meetup_code(current_setting('test.code_tx')::uuid, '123456')->'error'->>'code', 'MEETUP_CODE_EXPIRED', 'expired code is rejected');

select public.campus_test_actor('00000000-0000-4000-a000-000000000001');
select public.campus_generate_meetup_code(current_setting('test.code_tx')::uuid);
select public.campus_test_actor('00000000-0000-4000-a000-000000000002');
do $$
begin
  perform public.campus_verify_meetup_code(current_setting('test.code_tx')::uuid, '000000');
  perform public.campus_verify_meetup_code(current_setting('test.code_tx')::uuid, '000001');
  perform public.campus_verify_meetup_code(current_setting('test.code_tx')::uuid, '000002');
  perform public.campus_verify_meetup_code(current_setting('test.code_tx')::uuid, '000003');
end;
$$;
select is(public.campus_verify_meetup_code(current_setting('test.code_tx')::uuid, '000004')->'error'->>'code', 'MEETUP_CODE_LOCKED', 'fifth wrong code locks verification');
select is(public.campus_verify_meetup_code(current_setting('test.code_tx')::uuid, '123456')->'error'->>'code', 'MEETUP_CODE_LOCKED', 'locked transaction rejects later guesses');

select * from finish();
rollback;
