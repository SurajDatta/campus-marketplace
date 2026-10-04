-- Licks backend.
-- All payment behavior in this migration is a simulation; no real payment provider is called.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.campus_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 120),
  description text not null default '' check (length(description) <= 2000),
  price_cents bigint not null check (price_cents > 0),
  state text not null default 'available' check (state in ('available', 'reserved', 'sold')),
  meetup_options jsonb not null check (
    jsonb_typeof(meetup_options) = 'array' and jsonb_array_length(meetup_options) between 1 and 20
  ),
  current_transaction_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campus_transactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.campus_listings(id),
  seller_id uuid not null references auth.users(id),
  buyer_id uuid not null references auth.users(id),
  status text not null default 'active' check (status in ('active', 'completed', 'canceled')),
  reserved_price_cents bigint not null check (reserved_price_cents > 0),
  final_price_cents bigint not null check (
    final_price_cents > 0 and final_price_cents <= reserved_price_cents
  ),
  price_version integer not null default 1 check (price_version > 0),
  meetup_starts_at timestamptz not null,
  meetup_location text not null check (length(btrim(meetup_location)) between 1 and 160),
  meetup_verified_at timestamptz,
  seller_approved_version integer,
  buyer_approved_version integer,
  revision bigint not null default 1 check (revision > 0),
  canceled_by uuid references auth.users(id),
  canceled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (seller_id <> buyer_id)
);

alter table public.campus_listings
  drop constraint if exists campus_listings_current_transaction_id_fkey;
alter table public.campus_listings
  add constraint campus_listings_current_transaction_id_fkey
  foreign key (current_transaction_id) references public.campus_transactions(id);

create unique index if not exists campus_one_active_transaction_per_listing
  on public.campus_transactions(listing_id) where status = 'active';
create index if not exists campus_transactions_participants_idx
  on public.campus_transactions(seller_id, buyer_id, updated_at desc);

create table if not exists public.campus_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available_cents bigint not null default 0 check (available_cents >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.campus_wallet_holds (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null unique references public.campus_transactions(id),
  buyer_id uuid not null references auth.users(id),
  amount_cents bigint not null check (amount_cents > 0),
  status text not null default 'held' check (status in ('held', 'settled', 'released')),
  settled_cents bigint check (settled_cents is null or settled_cents > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The code hash is isolated in a table that clients can never select from.
create table if not exists public.campus_meetup_codes (
  transaction_id uuid primary key references public.campus_transactions(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  incorrect_attempts integer not null default 0 check (incorrect_attempts >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campus_receipts (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null unique references public.campus_transactions(id),
  listing_id uuid not null references public.campus_listings(id),
  seller_id uuid not null references auth.users(id),
  buyer_id uuid not null references auth.users(id),
  reserved_price_cents bigint not null,
  final_price_cents bigint not null,
  buyer_refund_cents bigint not null check (buyer_refund_cents >= 0),
  payment_mode text not null default 'simulated_wallet' check (payment_mode = 'simulated_wallet'),
  completed_at timestamptz not null default now()
);

alter table public.campus_listings enable row level security;
alter table public.campus_transactions enable row level security;
alter table public.campus_wallets enable row level security;
alter table public.campus_wallet_holds enable row level security;
alter table public.campus_meetup_codes enable row level security;
alter table public.campus_receipts enable row level security;

drop policy if exists campus_listings_public_read on public.campus_listings;
create policy campus_listings_public_read on public.campus_listings
  for select using (true);

drop policy if exists campus_transactions_participant_read on public.campus_transactions;
create policy campus_transactions_participant_read on public.campus_transactions
  for select to authenticated
  using (auth.uid() = seller_id or auth.uid() = buyer_id);

drop policy if exists campus_wallet_owner_read on public.campus_wallets;
create policy campus_wallet_owner_read on public.campus_wallets
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists campus_holds_participant_read on public.campus_wallet_holds;
create policy campus_holds_participant_read on public.campus_wallet_holds
  for select to authenticated using (
    exists (
      select 1 from public.campus_transactions t
      where t.id = transaction_id
        and (t.seller_id = auth.uid() or t.buyer_id = auth.uid())
    )
  );

drop policy if exists campus_receipts_participant_read on public.campus_receipts;
create policy campus_receipts_participant_read on public.campus_receipts
  for select to authenticated
  using (auth.uid() = seller_id or auth.uid() = buyer_id);

-- No policy is intentionally created for campus_meetup_codes.
revoke all on public.campus_listings from anon, authenticated;
revoke all on public.campus_transactions from anon, authenticated;
revoke all on public.campus_wallets from anon, authenticated;
revoke all on public.campus_wallet_holds from anon, authenticated;
revoke all on public.campus_meetup_codes from anon, authenticated;
revoke all on public.campus_receipts from anon, authenticated;
grant select on public.campus_listings to anon, authenticated;
grant select on public.campus_transactions to authenticated;
grant select on public.campus_wallets to authenticated;
grant select on public.campus_wallet_holds to authenticated;
grant select on public.campus_receipts to authenticated;

create or replace function public.campus_error(
  p_code text,
  p_message text,
  p_status integer,
  p_details jsonb default '{}'::jsonb
) returns jsonb
language sql immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'ok', false,
    'status', p_status,
    'error', jsonb_build_object('code', p_code, 'message', p_message, 'details', p_details)
  );
$$;

create or replace function public.campus_listing_json(p_listing_id uuid)
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', l.id,
    'sellerId', l.seller_id,
    'title', l.title,
    'description', l.description,
    'priceCents', l.price_cents,
    'state', l.state,
    'meetupOptions', l.meetup_options,
    'createdAt', l.created_at,
    'updatedAt', l.updated_at
  )
  from public.campus_listings l where l.id = p_listing_id;
$$;

create or replace function public.campus_transaction_json(p_transaction_id uuid)
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', t.id,
    'listingId', t.listing_id,
    'sellerId', t.seller_id,
    'buyerId', t.buyer_id,
    'status', t.status,
    'reservedPriceCents', t.reserved_price_cents,
    'finalPriceCents', t.final_price_cents,
    'priceVersion', t.price_version,
    'meetup', jsonb_build_object(
      'startsAt', t.meetup_starts_at,
      'location', t.meetup_location
    ),
    'meetupCode', jsonb_build_object(
      'generated', c.transaction_id is not null,
      'expiresAt', c.expires_at,
      'attemptsRemaining', case when c.transaction_id is null then null else greatest(0, 5 - c.incorrect_attempts) end,
      'verifiedAt', t.meetup_verified_at,
      'disclaimer', 'Code verification confirms shared knowledge of the code, not physical presence.'
    ),
    'approvals', jsonb_build_object(
      'priceVersion', t.price_version,
      'sellerApproved', t.seller_approved_version = t.price_version,
      'buyerApproved', t.buyer_approved_version = t.price_version
    ),
    'revision', t.revision,
    'receipt', case when r.id is null then null else jsonb_build_object(
      'id', r.id,
      'transactionId', r.transaction_id,
      'listingId', r.listing_id,
      'reservedPriceCents', r.reserved_price_cents,
      'finalPriceCents', r.final_price_cents,
      'buyerRefundCents', r.buyer_refund_cents,
      'paymentMode', r.payment_mode,
      'completedAt', r.completed_at
    ) end,
    'paymentMode', 'simulated_wallet',
    'createdAt', t.created_at,
    'updatedAt', t.updated_at
  )
  from public.campus_transactions t
  left join public.campus_meetup_codes c on c.transaction_id = t.id
  left join public.campus_receipts r on r.transaction_id = t.id
  where t.id = p_transaction_id;
$$;

revoke all on function public.campus_error(text, text, integer, jsonb) from public, anon, authenticated;
revoke all on function public.campus_listing_json(uuid) from public, anon, authenticated;
revoke all on function public.campus_transaction_json(uuid) from public, anon, authenticated;

create or replace function public.campus_create_listing(
  p_title text,
  p_description text,
  p_price_cents bigint,
  p_meetup_options jsonb
) returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_listing_id uuid;
  v_option jsonb;
begin
  if v_actor is null then
    return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401);
  end if;
  if length(btrim(coalesce(p_title, ''))) not between 1 and 120
     or length(coalesce(p_description, '')) > 2000
     or p_price_cents is null or p_price_cents <= 0 then
    return public.campus_error('VALIDATION_ERROR', 'Listing title, description, or price is invalid', 400);
  end if;
  if jsonb_typeof(p_meetup_options) <> 'array'
     or jsonb_array_length(p_meetup_options) not between 1 and 20 then
    return public.campus_error('MEETUP_OPTIONS_INVALID', 'Provide between 1 and 20 meetup options', 400);
  end if;
  for v_option in select value from jsonb_array_elements(p_meetup_options)
  loop
    begin
      if length(btrim(coalesce(v_option->>'location', ''))) not between 1 and 160
         or (v_option->>'startsAt')::timestamptz <= now() then
        return public.campus_error('MEETUP_OPTIONS_INVALID', 'Each meetup option needs a future time and public location', 400);
      end if;
    exception when others then
      return public.campus_error('MEETUP_OPTIONS_INVALID', 'Each meetup option needs a valid ISO timestamp', 400);
    end;
  end loop;

  insert into public.campus_listings (seller_id, title, description, price_cents, meetup_options)
  values (v_actor, btrim(p_title), coalesce(p_description, ''), p_price_cents, p_meetup_options)
  returning id into v_listing_id;

  return jsonb_build_object('ok', true, 'status', 201, 'data', public.campus_listing_json(v_listing_id));
end;
$$;

create or replace function public.campus_reserve_listing(
  p_listing_id uuid,
  p_meetup_starts_at timestamptz,
  p_meetup_location text
) returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_listing public.campus_listings%rowtype;
  v_transaction_id uuid;
  v_existing public.campus_transactions%rowtype;
  v_available bigint;
begin
  if v_actor is null then
    return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401);
  end if;

  select * into v_listing from public.campus_listings where id = p_listing_id for update;
  if not found then
    return public.campus_error('LISTING_NOT_FOUND', 'Listing not found', 404);
  end if;
  if v_listing.seller_id = v_actor then
    return public.campus_error('SELF_PURCHASE_NOT_ALLOWED', 'Sellers cannot reserve their own listing', 409);
  end if;

  if v_listing.state <> 'available' then
    select * into v_existing from public.campus_transactions
    where id = v_listing.current_transaction_id;
    if found and v_existing.status = 'active' and v_existing.buyer_id = v_actor
       and v_existing.meetup_starts_at = p_meetup_starts_at
       and v_existing.meetup_location = p_meetup_location then
      return jsonb_build_object('ok', true, 'status', 200, 'idempotent', true,
        'data', public.campus_transaction_json(v_existing.id));
    end if;
    return public.campus_error('LISTING_UNAVAILABLE', 'Listing is already reserved or sold', 409);
  end if;

  if p_meetup_starts_at <= now() or not exists (
    select 1 from jsonb_array_elements(v_listing.meetup_options) option
    where (option->>'startsAt')::timestamptz = p_meetup_starts_at
      and option->>'location' = p_meetup_location
  ) then
    return public.campus_error('MEETUP_OPTION_INVALID', 'Select an advertised future meetup time and location', 400);
  end if;

  select available_cents into v_available from public.campus_wallets
  where user_id = v_actor for update;
  if not found or v_available < v_listing.price_cents then
    return public.campus_error('INSUFFICIENT_SIMULATED_FUNDS', 'Insufficient simulated wallet funds', 409);
  end if;

  insert into public.campus_transactions (
    listing_id, seller_id, buyer_id, reserved_price_cents, final_price_cents,
    meetup_starts_at, meetup_location
  ) values (
    v_listing.id, v_listing.seller_id, v_actor, v_listing.price_cents, v_listing.price_cents,
    p_meetup_starts_at, p_meetup_location
  ) returning id into v_transaction_id;

  update public.campus_listings
  set state = 'reserved', current_transaction_id = v_transaction_id, updated_at = now()
  where id = v_listing.id;
  update public.campus_wallets
  set available_cents = available_cents - v_listing.price_cents, updated_at = now()
  where user_id = v_actor;
  insert into public.campus_wallet_holds (transaction_id, buyer_id, amount_cents)
  values (v_transaction_id, v_actor, v_listing.price_cents);

  return jsonb_build_object('ok', true, 'status', 201, 'idempotent', false,
    'data', public.campus_transaction_json(v_transaction_id));
end;
$$;

create or replace function public.campus_get_transaction(p_transaction_id uuid)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_transaction public.campus_transactions%rowtype;
begin
  if v_actor is null then return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401); end if;
  select * into v_transaction from public.campus_transactions where id = p_transaction_id;
  if not found then return public.campus_error('TRANSACTION_NOT_FOUND', 'Transaction not found', 404); end if;
  if v_actor <> v_transaction.seller_id and v_actor <> v_transaction.buyer_id then
    return public.campus_error('TRANSACTION_FORBIDDEN', 'Only transaction participants can access it', 403);
  end if;
  return jsonb_build_object('ok', true, 'status', 200, 'data', public.campus_transaction_json(p_transaction_id));
end;
$$;

create or replace function public.campus_list_transactions()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_data jsonb;
begin
  if v_actor is null then return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401); end if;
  select coalesce(jsonb_agg(public.campus_transaction_json(id) order by updated_at desc), '[]'::jsonb)
  into v_data from public.campus_transactions
  where seller_id = v_actor or buyer_id = v_actor;
  return jsonb_build_object('ok', true, 'status', 200, 'data', v_data);
end;
$$;

create or replace function public.campus_get_wallet()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_available bigint;
  v_held bigint;
begin
  if v_actor is null then return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401); end if;
  select available_cents into v_available from public.campus_wallets where user_id = v_actor;
  if not found then return public.campus_error('WALLET_NOT_FOUND', 'Simulated wallet not found', 404); end if;
  select coalesce(sum(amount_cents), 0) into v_held from public.campus_wallet_holds
  where buyer_id = v_actor and status = 'held';
  return jsonb_build_object('ok', true, 'status', 200, 'data', jsonb_build_object(
    'availableCents', v_available, 'heldCents', v_held, 'paymentMode', 'simulated_wallet'
  ));
end;
$$;

create or replace function public.campus_generate_meetup_code(p_transaction_id uuid)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_transaction public.campus_transactions%rowtype;
  v_bytes bytea;
  v_number bigint;
  v_code text;
  v_expires_at timestamptz := now() + interval '10 minutes';
begin
  if v_actor is null then return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401); end if;
  select * into v_transaction from public.campus_transactions where id = p_transaction_id for update;
  if not found then return public.campus_error('TRANSACTION_NOT_FOUND', 'Transaction not found', 404); end if;
  if v_actor <> v_transaction.seller_id then
    return public.campus_error('SELLER_ONLY', 'Only the seller can generate the meetup code', 403);
  end if;
  if v_transaction.status <> 'active' then
    return public.campus_error('TRANSACTION_NOT_ACTIVE', 'Meetup codes require an active transaction', 409);
  end if;
  if v_transaction.meetup_verified_at is not null then
    return public.campus_error('MEETUP_ALREADY_VERIFIED', 'The meetup code was already verified', 409);
  end if;

  v_bytes := extensions.gen_random_bytes(4);
  v_number := (
    get_byte(v_bytes, 0)::bigint * 16777216 + get_byte(v_bytes, 1)::bigint * 65536 +
    get_byte(v_bytes, 2)::bigint * 256 + get_byte(v_bytes, 3)::bigint
  ) % 1000000;
  v_code := lpad(v_number::text, 6, '0');

  insert into public.campus_meetup_codes (transaction_id, code_hash, expires_at, incorrect_attempts)
  values (p_transaction_id, extensions.crypt(v_code, extensions.gen_salt('bf', 8)), v_expires_at, 0)
  on conflict (transaction_id) do update set
    code_hash = excluded.code_hash, expires_at = excluded.expires_at,
    incorrect_attempts = 0, updated_at = now();
  update public.campus_transactions set revision = revision + 1, updated_at = now()
  where id = p_transaction_id;

  return jsonb_build_object(
    'ok', true, 'status', 200,
    'data', jsonb_build_object(
      'code', v_code,
      'expiresAt', v_expires_at,
      'transaction', public.campus_transaction_json(p_transaction_id)
    )
  );
end;
$$;

create or replace function public.campus_verify_meetup_code(p_transaction_id uuid, p_code text)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_transaction public.campus_transactions%rowtype;
  v_code_row public.campus_meetup_codes%rowtype;
  v_remaining integer;
begin
  if v_actor is null then return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401); end if;
  select * into v_transaction from public.campus_transactions where id = p_transaction_id for update;
  if not found then return public.campus_error('TRANSACTION_NOT_FOUND', 'Transaction not found', 404); end if;
  if v_actor <> v_transaction.buyer_id then
    return public.campus_error('BUYER_ONLY', 'Only the buyer can verify the meetup code', 403);
  end if;
  if v_transaction.status <> 'active' then
    return public.campus_error('TRANSACTION_NOT_ACTIVE', 'The transaction is not active', 409);
  end if;
  if v_transaction.meetup_verified_at is not null then
    return jsonb_build_object('ok', true, 'status', 200, 'idempotent', true,
      'data', public.campus_transaction_json(p_transaction_id));
  end if;
  if p_code is null or p_code !~ '^[0-9]{6}$' then
    return public.campus_error('VALIDATION_ERROR', 'Code must contain exactly six digits', 400);
  end if;

  select * into v_code_row from public.campus_meetup_codes
  where transaction_id = p_transaction_id for update;
  if not found then return public.campus_error('MEETUP_CODE_NOT_GENERATED', 'The seller has not generated a meetup code', 409); end if;
  if v_code_row.expires_at <= now() then
    return public.campus_error('MEETUP_CODE_EXPIRED', 'The meetup code has expired', 410);
  end if;
  if v_code_row.incorrect_attempts >= 5 then
    return public.campus_error('MEETUP_CODE_LOCKED', 'Too many incorrect meetup code attempts', 429);
  end if;

  if extensions.crypt(p_code, v_code_row.code_hash) <> v_code_row.code_hash then
    update public.campus_meetup_codes
    set incorrect_attempts = incorrect_attempts + 1, updated_at = now()
    where transaction_id = p_transaction_id
    returning greatest(0, 5 - incorrect_attempts) into v_remaining;
    update public.campus_transactions set revision = revision + 1, updated_at = now()
    where id = p_transaction_id;
    return public.campus_error(
      case when v_remaining = 0 then 'MEETUP_CODE_LOCKED' else 'MEETUP_CODE_INVALID' end,
      case when v_remaining = 0 then 'Too many incorrect meetup code attempts' else 'Incorrect meetup code' end,
      case when v_remaining = 0 then 429 else 400 end,
      jsonb_build_object('attemptsRemaining', v_remaining)
    );
  end if;

  update public.campus_transactions
  set meetup_verified_at = now(), revision = revision + 1, updated_at = now()
  where id = p_transaction_id;
  return jsonb_build_object('ok', true, 'status', 200, 'idempotent', false,
    'data', public.campus_transaction_json(p_transaction_id));
end;
$$;

create or replace function public.campus_change_final_price(
  p_transaction_id uuid,
  p_final_price_cents bigint,
  p_expected_price_version integer
) returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_transaction public.campus_transactions%rowtype;
begin
  if v_actor is null then return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401); end if;
  select * into v_transaction from public.campus_transactions where id = p_transaction_id for update;
  if not found then return public.campus_error('TRANSACTION_NOT_FOUND', 'Transaction not found', 404); end if;
  if v_actor <> v_transaction.seller_id then return public.campus_error('SELLER_ONLY', 'Only the seller can change the final price', 403); end if;
  if v_transaction.status <> 'active' then return public.campus_error('TRANSACTION_NOT_ACTIVE', 'Prices cannot change after completion or cancellation', 409); end if;
  if v_transaction.price_version <> p_expected_price_version then
    return public.campus_error('STALE_PRICE_VERSION', 'The price version is stale', 409,
      jsonb_build_object('currentPriceVersion', v_transaction.price_version));
  end if;
  if p_final_price_cents is null or p_final_price_cents <= 0 or p_final_price_cents > v_transaction.reserved_price_cents then
    return public.campus_error('FINAL_PRICE_INVALID', 'Final price must be positive and no higher than the reserved price', 400);
  end if;
  if p_final_price_cents >= v_transaction.final_price_cents then
    return public.campus_error('PRICE_MUST_DECREASE', 'The seller may only lower the current final price', 400);
  end if;
  update public.campus_transactions set
    final_price_cents = p_final_price_cents, price_version = price_version + 1,
    seller_approved_version = null, buyer_approved_version = null,
    revision = revision + 1, updated_at = now()
  where id = p_transaction_id;
  return jsonb_build_object('ok', true, 'status', 200, 'data', public.campus_transaction_json(p_transaction_id));
end;
$$;

create or replace function public.campus_approve_price(p_transaction_id uuid, p_price_version integer)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_transaction public.campus_transactions%rowtype;
begin
  if v_actor is null then return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401); end if;
  select * into v_transaction from public.campus_transactions where id = p_transaction_id for update;
  if not found then return public.campus_error('TRANSACTION_NOT_FOUND', 'Transaction not found', 404); end if;
  if v_actor <> v_transaction.seller_id and v_actor <> v_transaction.buyer_id then
    return public.campus_error('TRANSACTION_FORBIDDEN', 'Only transaction participants can approve', 403);
  end if;
  if v_transaction.status <> 'active' then return public.campus_error('TRANSACTION_NOT_ACTIVE', 'Approvals require an active transaction', 409); end if;
  if v_transaction.price_version <> p_price_version then
    return public.campus_error('STALE_PRICE_VERSION', 'Approval does not match the current price version', 409,
      jsonb_build_object('currentPriceVersion', v_transaction.price_version));
  end if;
  if v_actor = v_transaction.seller_id then
    if v_transaction.seller_approved_version = p_price_version then
      return jsonb_build_object('ok', true, 'status', 200, 'idempotent', true, 'data', public.campus_transaction_json(p_transaction_id));
    end if;
    update public.campus_transactions set seller_approved_version = p_price_version,
      revision = revision + 1, updated_at = now() where id = p_transaction_id;
  else
    if v_transaction.buyer_approved_version = p_price_version then
      return jsonb_build_object('ok', true, 'status', 200, 'idempotent', true, 'data', public.campus_transaction_json(p_transaction_id));
    end if;
    update public.campus_transactions set buyer_approved_version = p_price_version,
      revision = revision + 1, updated_at = now() where id = p_transaction_id;
  end if;
  return jsonb_build_object('ok', true, 'status', 200, 'idempotent', false, 'data', public.campus_transaction_json(p_transaction_id));
end;
$$;

create or replace function public.campus_complete_transaction(p_transaction_id uuid)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_transaction public.campus_transactions%rowtype;
  v_hold public.campus_wallet_holds%rowtype;
  v_refund bigint;
begin
  if v_actor is null then return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401); end if;
  select * into v_transaction from public.campus_transactions where id = p_transaction_id for update;
  if not found then return public.campus_error('TRANSACTION_NOT_FOUND', 'Transaction not found', 404); end if;
  if v_actor <> v_transaction.seller_id and v_actor <> v_transaction.buyer_id then
    return public.campus_error('TRANSACTION_FORBIDDEN', 'Only transaction participants can complete', 403);
  end if;
  if v_transaction.status = 'completed' then
    return jsonb_build_object('ok', true, 'status', 200, 'idempotent', true, 'data', public.campus_transaction_json(p_transaction_id));
  end if;
  if v_transaction.status = 'canceled' then return public.campus_error('TRANSACTION_CANCELED', 'A canceled transaction cannot complete', 409); end if;
  if v_transaction.meetup_verified_at is null then return public.campus_error('MEETUP_NOT_VERIFIED', 'Verify the meetup code before completion', 409); end if;
  if v_transaction.seller_approved_version <> v_transaction.price_version
     or v_transaction.buyer_approved_version <> v_transaction.price_version then
    return public.campus_error('APPROVALS_INCOMPLETE', 'Both participants must approve the current price version', 409);
  end if;

  select * into v_hold from public.campus_wallet_holds where transaction_id = p_transaction_id for update;
  if not found or v_hold.status <> 'held' then return public.campus_error('HOLD_NOT_SETTLEABLE', 'The simulated wallet hold is not settleable', 409); end if;
  v_refund := v_hold.amount_cents - v_transaction.final_price_cents;

  update public.campus_listings set state = 'sold', updated_at = now()
  where id = v_transaction.listing_id and state = 'reserved' and current_transaction_id = p_transaction_id;
  if not found then return public.campus_error('LISTING_STATE_CONFLICT', 'Listing is no longer reserved by this transaction', 409); end if;
  update public.campus_wallet_holds set status = 'settled', settled_cents = v_transaction.final_price_cents,
    updated_at = now() where id = v_hold.id and status = 'held';
  update public.campus_wallets set available_cents = available_cents + v_refund, updated_at = now()
  where user_id = v_transaction.buyer_id;
  insert into public.campus_wallets (user_id, available_cents)
  values (v_transaction.seller_id, v_transaction.final_price_cents)
  on conflict (user_id) do update set
    available_cents = public.campus_wallets.available_cents + excluded.available_cents,
    updated_at = now();
  insert into public.campus_receipts (
    transaction_id, listing_id, seller_id, buyer_id, reserved_price_cents,
    final_price_cents, buyer_refund_cents
  ) values (
    p_transaction_id, v_transaction.listing_id, v_transaction.seller_id,
    v_transaction.buyer_id, v_transaction.reserved_price_cents,
    v_transaction.final_price_cents, v_refund
  );
  update public.campus_transactions set status = 'completed', completed_at = now(),
    revision = revision + 1, updated_at = now() where id = p_transaction_id;
  return jsonb_build_object('ok', true, 'status', 200, 'idempotent', false, 'data', public.campus_transaction_json(p_transaction_id));
end;
$$;

create or replace function public.campus_cancel_transaction(p_transaction_id uuid)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_transaction public.campus_transactions%rowtype;
  v_hold public.campus_wallet_holds%rowtype;
begin
  if v_actor is null then return public.campus_error('AUTH_REQUIRED', 'A valid Supabase session is required', 401); end if;
  select * into v_transaction from public.campus_transactions where id = p_transaction_id for update;
  if not found then return public.campus_error('TRANSACTION_NOT_FOUND', 'Transaction not found', 404); end if;
  if v_actor <> v_transaction.seller_id and v_actor <> v_transaction.buyer_id then
    return public.campus_error('TRANSACTION_FORBIDDEN', 'Only transaction participants can cancel', 403);
  end if;
  if v_transaction.status = 'canceled' then
    return jsonb_build_object('ok', true, 'status', 200, 'idempotent', true, 'data', public.campus_transaction_json(p_transaction_id));
  end if;
  if v_transaction.status = 'completed' then return public.campus_error('TRANSACTION_COMPLETED', 'A completed transaction cannot be canceled', 409); end if;
  select * into v_hold from public.campus_wallet_holds where transaction_id = p_transaction_id for update;
  if not found or v_hold.status <> 'held' then return public.campus_error('HOLD_NOT_RELEASABLE', 'The simulated wallet hold is not releasable', 409); end if;

  update public.campus_wallet_holds set status = 'released', updated_at = now()
  where id = v_hold.id and status = 'held';
  update public.campus_wallets set available_cents = available_cents + v_hold.amount_cents, updated_at = now()
  where user_id = v_transaction.buyer_id;
  update public.campus_listings set state = 'available', current_transaction_id = null, updated_at = now()
  where id = v_transaction.listing_id and state = 'reserved' and current_transaction_id = p_transaction_id;
  if not found then return public.campus_error('LISTING_STATE_CONFLICT', 'Listing is no longer reserved by this transaction', 409); end if;
  update public.campus_transactions set status = 'canceled', canceled_by = v_actor,
    canceled_at = now(), revision = revision + 1, updated_at = now()
  where id = p_transaction_id;
  return jsonb_build_object('ok', true, 'status', 200, 'idempotent', false, 'data', public.campus_transaction_json(p_transaction_id));
end;
$$;

revoke all on function public.campus_create_listing(text, text, bigint, jsonb) from public, anon;
revoke all on function public.campus_reserve_listing(uuid, timestamptz, text) from public, anon;
revoke all on function public.campus_get_transaction(uuid) from public, anon;
revoke all on function public.campus_list_transactions() from public, anon;
revoke all on function public.campus_get_wallet() from public, anon;
revoke all on function public.campus_generate_meetup_code(uuid) from public, anon;
revoke all on function public.campus_verify_meetup_code(uuid, text) from public, anon;
revoke all on function public.campus_change_final_price(uuid, bigint, integer) from public, anon;
revoke all on function public.campus_approve_price(uuid, integer) from public, anon;
revoke all on function public.campus_complete_transaction(uuid) from public, anon;
revoke all on function public.campus_cancel_transaction(uuid) from public, anon;
grant execute on function public.campus_create_listing(text, text, bigint, jsonb) to authenticated;
grant execute on function public.campus_reserve_listing(uuid, timestamptz, text) to authenticated;
grant execute on function public.campus_get_transaction(uuid) to authenticated;
grant execute on function public.campus_list_transactions() to authenticated;
grant execute on function public.campus_get_wallet() to authenticated;
grant execute on function public.campus_generate_meetup_code(uuid) to authenticated;
grant execute on function public.campus_verify_meetup_code(uuid, text) to authenticated;
grant execute on function public.campus_change_final_price(uuid, bigint, integer) to authenticated;
grant execute on function public.campus_approve_price(uuid, integer) to authenticated;
grant execute on function public.campus_complete_transaction(uuid) to authenticated;
grant execute on function public.campus_cancel_transaction(uuid) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'campus_transactions'
    ) then alter publication supabase_realtime add table public.campus_transactions; end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'campus_listings'
    ) then alter publication supabase_realtime add table public.campus_listings; end if;
  end if;
end;
$$;
