export const CAMPUS_PAYMENT_MODE = "simulated_wallet" as const;

export type CampusListingState = "available" | "reserved" | "sold";
export type CampusTransactionStatus = "active" | "completed" | "canceled";

export interface CampusMeetupOption {
  startsAt: string;
  location: string;
}

export interface CampusListing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  priceCents: number;
  state: CampusListingState;
  meetupOptions: CampusMeetupOption[];
  createdAt: string;
  updatedAt: string;
}

export interface CampusReceipt {
  id: string;
  transactionId: string;
  listingId: string;
  reservedPriceCents: number;
  finalPriceCents: number;
  buyerRefundCents: number;
  paymentMode: typeof CAMPUS_PAYMENT_MODE;
  completedAt: string;
}

export interface CampusTransaction {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  status: CampusTransactionStatus;
  reservedPriceCents: number;
  finalPriceCents: number;
  priceVersion: number;
  meetup: CampusMeetupOption;
  meetupCode: {
    generated: boolean;
    expiresAt: string | null;
    attemptsRemaining: number | null;
    verifiedAt: string | null;
    disclaimer: "Code verification confirms shared knowledge of the code, not physical presence.";
  };
  approvals: {
    priceVersion: number;
    sellerApproved: boolean;
    buyerApproved: boolean;
  };
  revision: number;
  receipt: CampusReceipt | null;
  paymentMode: typeof CAMPUS_PAYMENT_MODE;
  createdAt: string;
  updatedAt: string;
}

export interface CampusWallet {
  availableCents: number;
  heldCents: number;
  paymentMode: typeof CAMPUS_PAYMENT_MODE;
}

export interface CampusApiSuccess<T> {
  data: T;
  meta: {
    paymentMode: typeof CAMPUS_PAYMENT_MODE;
    idempotent?: boolean;
  };
}

export interface CampusApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
