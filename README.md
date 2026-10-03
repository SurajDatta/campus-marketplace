# Campus Marketplace

Campus Marketplace is a Next.js 14 and Supabase application for student-to-student listings,
reservations, and verified meetup transactions.

It uses Supabase Auth, cookie sessions, Postgres, and Realtime. Purchase settlement runs through
atomic Supabase RPCs and clearly identified simulated wallet credits. Real Stripe requests are
disabled in `client/utils/stripe/stripeServer.js`.

See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) for setup, API contracts, demo accounts,
two-device updates, and migration details.
