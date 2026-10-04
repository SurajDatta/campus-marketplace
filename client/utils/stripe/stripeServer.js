// Licks uses simulated wallet credits. This compile-compatible stub
// deliberately has no Stripe SDK instance or credential, so it cannot issue a request.
const disabled = (..._args) => {
  throw new Error('Real Stripe requests are disabled. Use the Licks simulated-wallet API.');
};

/** @type {any} */
const stripe = {
  webhooks: { constructEvent: disabled },
  checkout: { sessions: { create: disabled } },
  billingPortal: { sessions: { create: disabled } },
  customers: { del: disabled },
  accounts: { create: disabled, retrieve: disabled, update: disabled },
  accountLinks: { create: disabled },
  accountSessions: { create: disabled },
  paymentIntents: { update: disabled, capture: disabled, cancel: disabled },
};

module.exports = stripe;
