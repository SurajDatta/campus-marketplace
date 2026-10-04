# Licks

Licks is a Next.js 14 and Supabase application for student-to-student listings,
reservations, and verified meetup transactions.

The responsive blue-and-yellow frontend uses the Licks logo and opens on a Supabase
login screen. It includes the listing browser, seller studio, and shared buyer/seller meetup
workspace. Those screens call the authenticated marketplace API directly and poll active
transactions so both devices stay in sync. The active authentication flow uses email and password
without two-factor authentication.

It uses Supabase Auth, cookie sessions, Postgres, and Realtime. Purchase settlement runs through
atomic Supabase RPCs and clearly identified simulated wallet credits. Real Stripe requests are
disabled in `client/utils/stripe/stripeServer.js`.

See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) for setup, API contracts, demo accounts,
two-device updates, and migration details.
