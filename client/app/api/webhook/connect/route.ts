import { NextResponse } from "next/server";
import { CAMPUS_PAYMENT_MODE } from "@/types/marketplace";

export async function POST() {
  return NextResponse.json(
    {
      error: {
        code: "REAL_PAYMENTS_DISABLED",
        message: "Stripe Connect webhooks are disabled. Campus Marketplace uses simulated wallet credits.",
      },
      meta: { paymentMode: CAMPUS_PAYMENT_MODE },
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
