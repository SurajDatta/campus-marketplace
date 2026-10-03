/**
 * app/api/webhook/connect/route.ts
 * Webhook route to handle connect Stripe events. This route will update the status of an item, payment details, and meetup status.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */

import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import stripe from "@/utils/stripe/stripeServer";
import { updateAccountRequirements } from "@/utils/services/account";


export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  console.log("✅ Success:", event.id, event.type);

  const permittedEvents: string[] = [
    "account.updated",
  ];

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "account.updated":
          data = event.data.object as Stripe.Account;
          const development = data.metadata?.live === "false";
          console.log(`📝 Account status: ${data.details_submitted}`);

          const requirements = data.requirements;
          if (requirements) {
            const currentlyDue = requirements.currently_due ?? [];
            const pastDue = requirements.past_due ?? [];
            const requirementsDue = currentlyDue.concat(pastDue);
            const uniqueRequirements = [...new Set(requirementsDue)];
            const { success } = await updateAccountRequirements(data.id, uniqueRequirements, development);
            if (!success) {
              throw new Error("Failed to update account requirements");
            }
          } else {
            throw new Error("Account requirements are missing");
          }
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 },
      );
    }
  }
  return NextResponse.json({ message: "Received" }, { status: 200 });
}
