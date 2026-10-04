# Campus Marketplace backend integration

## Architecture

The application uses Next.js 14 with Supabase Auth, Postgres, and Realtime. It includes listing,
schedule, location, meetup, alert, and check-in screens. The transaction API does not use Stripe,
manual card captures, Connect accounts, or caller-supplied buyer and seller identities.

The Campus Marketplace backend is isolated in `campus_*` tables and authenticated Postgres RPCs.
Every actor is derived from Supabase `auth.uid()`. Reservations, wallet holds, price approvals,
completion, and cancellation are serialized with row locks and commit atomically. Money is integer
cents and every wallet/receipt response says `simulated_wallet`.

The branded frontend at `/`, `/buy`, `/sell`, and `/my-stuff` is connected to these endpoints. The
Stripe server client is intentionally disabled; every marketplace screen uses the simulated wallet.

## Local setup

Requirements: Node.js 20, Docker Desktop, and the Supabase CLI.

```bash
cd existing-site
supabase start
supabase db reset

cd client
cp .env.local.example .env.local
npm ci --legacy-peer-deps
npm run dev
```

Use the local URL and anon key printed by `supabase status` in `.env.local`. No Stripe key is needed.
`supabase db reset` applies `supabase/migrations/20261003223000_campus_marketplace_backend.sql`
and then runs the development-only `supabase/seed.sql`. There is no reset HTTP endpoint.

Seeded demo accounts share the development-only password `CampusDemo123!`:

- Sarah: `sarah@campus.demo`, $0 simulated credits, selling a $500 MacBook.
- Alex: `alex@campus.demo`, $800 simulated credits.

After completing at $450, Alex has $350 available and no hold; Sarah has $450 simulated credits.

## HTTP contract

All responses use:

```json
{
  "data": {},
  "meta": {
    "paymentMode": "simulated_wallet",
    "idempotent": false
  }
}
```

Errors use:

```json
{
  "error": {
    "code": "STALE_PRICE_VERSION",
    "message": "Approval does not match the current price version",
    "details": { "currentPriceVersion": 2 }
  }
}
```

The browser's Supabase session cookie authenticates private routes. Never add user IDs to these
payloads; the database derives the caller from the validated session.

The `/login` and `/signup` screens use Supabase Auth directly. A database trigger creates a `$0`
simulated wallet whenever a new auth identity is created; the development seed then gives Alex the
documented `$800` demo balance. The marketplace login path does not require a service-role key.

| Method | Route | Role | Body |
| --- | --- | --- | --- |
| `GET` | `/api/marketplace/listings` | Public | — |
| `POST` | `/api/marketplace/listings` | Authenticated seller | Listing example below |
| `POST` | `/api/marketplace/listings/:listingId/reserve` | Buyer | Selected advertised meetup |
| `GET` | `/api/marketplace/transactions` | Authenticated | — |
| `GET` | `/api/marketplace/transactions/:transactionId` | Participant | — |
| `GET` | `/api/marketplace/wallet` | Authenticated | — |
| `POST` | `/api/marketplace/transactions/:transactionId/meetup-code` | Seller | — |
| `POST` | `/api/marketplace/transactions/:transactionId/meetup-code/verify` | Buyer | Six-digit code |
| `PATCH` | `/api/marketplace/transactions/:transactionId/final-price` | Seller | Cents + expected version |
| `POST` | `/api/marketplace/transactions/:transactionId/approve` | Either participant | Current price version |
| `POST` | `/api/marketplace/transactions/:transactionId/complete` | Either participant | — |
| `POST` | `/api/marketplace/transactions/:transactionId/cancel` | Either participant | — |

Create a listing:

```json
{
  "title": "MacBook",
  "description": "13-inch laptop",
  "priceCents": 50000,
  "meetupOptions": [
    {
      "startsAt": "2030-09-10T21:00:00.000Z",
      "location": "Student Union — North Entrance"
    }
  ]
}
```

Reserve the exact advertised option:

```http
POST /api/marketplace/listings/00000000-0000-4000-a000-000000000100/reserve
Content-Type: application/json

{
  "meetup": {
    "startsAt": "2030-09-10T21:00:00.000Z",
    "location": "Student Union — North Entrance"
  }
}
```

Sarah generates a code:

```http
POST /api/marketplace/transactions/:transactionId/meetup-code
```

Only this seller response includes plaintext `data.code`; only its bcrypt hash is stored. The code
expires after 10 minutes, permits five wrong attempts, is bound to one transaction, and can only be
verified by that transaction's buyer:

```json
{ "code": "123456" }
```

Code verification confirms shared knowledge of the code, not physical presence.

Sarah lowers the final price:

```json
{ "finalPriceCents": 45000, "expectedPriceVersion": 1 }
```

This returns version `2` and clears both approvals. Each device then independently calls `/approve`:

```json
{ "priceVersion": 2 }
```

After meetup verification and both version-two approvals, either participant calls `/complete`.
The listing, receipt, hold, buyer refund, seller credit, and completed status change together.
Repeating `/complete` returns the same receipt with `meta.idempotent: true`.

Either participant can call `/cancel` before completion. It releases the hold and returns the listing
to `available` exactly once. Completion and cancellation lock the same transaction row, so only one
can win a race.

## Updating both devices

The meetup workspace polls the authenticated transaction collection every four seconds. For a more
focused client, poll the private transaction route every 1–2 seconds and compare its `revision`.
Responses have `Cache-Control: no-store`.

The existing Supabase Realtime client can provide immediate notifications instead. Subscribe to the
row, then refetch the sanitized API response when it changes:

```ts
const channel = supabase
  .channel(`campus-transaction-${transactionId}`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "campus_transactions",
      filter: `id=eq.${transactionId}`,
    },
    () => refetchTransaction(),
  )
  .subscribe();
```

Row-level security allows only the buyer and seller to receive/read that transaction. The meetup
code hash is stored in a separate table with no client read policy.

## Validation

```bash
cd existing-site/client
npm run typecheck

cd ..
supabase test db
```

`supabase/tests/campus_marketplace.sql` contains 41 focused pgTAP assertions covering permissions,
self-purchase, competing reservations, insufficient funds, holds, wrong/expired/locked codes,
price-version approval resets, stale approvals, cancellation, exact demo balances, and duplicate
settlement.
