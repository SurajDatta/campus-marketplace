/**
 * services/stripe.ts
 * Service functions used to stripe operations, like creating a checkout session and accepting payments.
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
"use server"
import type { Stripe } from "stripe";
import { headers } from "next/headers";
import stripe from "../stripe/stripeServer";
import { User } from "@supabase/supabase-js";
import { CheckoutMetadata, CheckoutType, ConfirmMetadata, PaymentIntentData, PaymentIntentType, PotentialMeetup, Profile, SubscriptionData } from "@/types";


const createStatementDescriptor = (firstName: string | null, lastName: string | null) => {
  const name = `${firstName} ${lastName}`;
  const maxLength = 22;

  // Truncate the firstName if necessary
  const truncatedName = name.substring(0, maxLength).toUpperCase();

  return truncatedName;
};

export const createCheckoutSession = async (
  buyerEmail: string,
  sellerEmail: string,
  redirectURL: string,
  connectedAccountId: string | null,
  development: boolean,
  itemId: string,
  buyerId: string,
  sellerId: string,
  contactEnabled: boolean,
  scheduleEnabled: boolean,
  safeMeetupEnabled: boolean,
  contact: string[],
  potentialMeetups: PotentialMeetup[],
  title: string,
  price: number,
  photoURLs: string[],
  expiryTime: string

): Promise<{ client_secret: string | null; url: string | null }> => {
  const origin: string = headers().get("origin") as string;

  const connectedAccountUpdates = connectedAccountId ? {
    application_fee_amount: 100, // Platform fee $1 flat
    on_behalf_of: connectedAccountId,
    transfer_data: {
      destination: connectedAccountId,
    },
  } : {};

  const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
    metadata: {
      "type": "buy" as CheckoutType,
      "item_id": itemId,
      "origin": origin,
      "development": development.toString(),
      "buyer_id": buyerId,
      "seller_id": sellerId,
      "contact_enabled": contactEnabled.toString(),
      "schedule_enabled": scheduleEnabled.toString(),
      "safe_meetup_enabled": safeMeetupEnabled.toString(),
      "contact": JSON.stringify(contact),
      "potential_meetups": JSON.stringify(potentialMeetups),
      "price": price.toString(),
      "expiry_time": expiryTime,
    } as CheckoutMetadata,
    payment_method_types: ['card'],
    customer_email: buyerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: title,
            images: photoURLs,
          },
          unit_amount: Math.round(price * 100), // Add $1.00 platform fee
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/my-stuff?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${redirectURL}`,
    payment_intent_data: {
      ...connectedAccountUpdates,
      capture_method: 'manual',
      metadata: {
        "type": "purchase" as PaymentIntentType,
        "item_id": itemId,
        "development": development.toString(),
        "origin": origin,
        "meetup_id": "", // will set this meetup id after the meetup is created.
      } as PaymentIntentData, // can add a receipt_email, but don't know if we need it.
      receipt_email: sellerEmail,
    },
    // custom_text: {
    //   submit: {
    //     message: `When you decide to make a purchase, we'll place a hold on your card for the item's price, but don't worry—you won't be charged until you've met the seller and are satisfied with the product. If you're not happy with it, you'll have the option to cancel.`,
    //   }
    // }
  });
  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
};


export const createSellerCheckoutSession = async (
  email: string,
  meetupId: string,
  buyerId: string,
  sellerId: string,
  meetupPrice: number,
  itemTitle: string,
  itemPhoto: string,
  locationImg: string,
  meetupTime: string,
  meetupLocation: number,
  development: boolean,
  itemId: string
) => {
  const origin: string = headers().get("origin") as string;
  const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
    metadata: {
      "type": "confirm" as CheckoutType,
      "meetup_id": meetupId,
      "buyer_id": buyerId,
      "seller_id": sellerId,
      "item_title": itemTitle,
      "item_photo": itemPhoto,
      "time": meetupTime,
      "location": String(meetupLocation)
    } as ConfirmMetadata,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Meetup: ${itemTitle}`,
            images: [locationImg],
          },
          unit_amount: Math.round(meetupPrice * 100 * 0.25), // 25% of the meetup price
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/my-stuff/${meetupId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/my-stuff/${meetupId}`,
    payment_intent_data: {
      capture_method: 'manual',
      receipt_email: email,
      metadata: {
        type: "confirmation" as PaymentIntentType,
        item_id: itemId,
        origin: origin,
        development: development.toString(),
        meetup_id: meetupId
      }
    },
  });
  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
}

export const createSubscriptionSession = async (
  user: User,
  redirectURL: string,
  development: boolean
): Promise<string | null> => {
  const origin: string = headers().get("origin") as string;
  const subscriptionSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
        quantity: 1,

      },
    ],
    mode: 'subscription',
    metadata: {
      "type": "subscription" as CheckoutType,
      "user_id": user.id,
      "development": String(development),
    } as SubscriptionData,
    success_url: `${origin}${redirectURL}`,
    cancel_url: `${origin}${redirectURL}`,
  });
  return subscriptionSession.url;
}

export const createPortalSession = async (
  customerId: string,
  redirectURL: string,
): Promise<string> => {
  const origin: string = headers().get("origin") as string;
  const portalSession: Stripe.BillingPortal.Session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}${redirectURL}`,
  });
  return portalSession.url;
}

export const deleteSubscriptionPortal = async (customerId: string): Promise<{ success: boolean, error: string }> => {
  try {
    const response = await stripe.customers.del(customerId);
    if (response.deleted) {
      return { success: true, error: "" };
    } else {
      throw new Error("Failed to delete customer portal");
    }
  } catch (error: any) {
    console.error('An error occurred when calling the Stripe API to delete a customer portal:', error);
    return { success: false, error: error.message };
  }
}

export const fetchAccountBuisnessProfile = async (accountId: string): Promise<{ buisnessProfile: Stripe.Account.BusinessProfile | null; error: string | null }> => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return { buisnessProfile: account.business_profile, error: null };
  } catch (error: any) {
    console.error('An error occurred when calling the Stripe API to retrieve account:', error);
    return { buisnessProfile: null, error: error.message };
  }
}

export const updatePaymentIntentMetadata = async (meetupId: string, paymentMethodId: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    await stripe.paymentIntents.update(paymentMethodId, {
      metadata: {
        meetup_id: meetupId,
      }
    });
    return { success: true, error: null };
  } catch (error: any) {
    console.error('An error occurred when calling the Stripe API to update payment intent:', error);
    return { success: false, error: error.message };
  }
}

export const createStripeAccount = async (userProfile: Profile, user: User, development: boolean): Promise<{ accountId: string | null; error: string | null }> => {

  try {
    const account = await stripe.accounts.create({
      individual: {
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        email: user.email,
        phone: user.phone,
      },
      controller: {
        stripe_dashboard: {
          type: "none",
        },
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      country: "US",
      business_type: "individual",
      business_profile: {
        mcc: "7278",
        name: `${userProfile.first_name} ${userProfile.last_name}`,
        product_description: "Buying and selling of goods on Licks. Sell anything from clothes, accessories, collectibles, electronics, and more.",
        url: `https://licks.local/buy/${userProfile.id}`,
        support_phone: user.phone,
      },
      settings: {
        payments: {
          statement_descriptor: createStatementDescriptor(userProfile.first_name, userProfile.last_name),
        }
      },
      metadata: {
        live: !development
      }

    });
    return { accountId: account.id, error: null };
  } catch (error: any) {
    console.error('An error occurred when calling the Stripe API to create an account:', error);
    return { accountId: null, error: error.message };
  }
};

export const updateUserAddress = async (accountId: string, address: Stripe.Address | null): Promise<{ success: boolean; error: string | null }> => {
  try {
    await stripe.accounts.update(accountId, {
      business_profile: {
        support_address: address,
      }
    });
    return { success: true, error: null };
  } catch (error: any) {
    console.error('An error occurred when calling the Stripe API to update an account:', error);
    return { success: false, error: error.message };
  }
}

export const createOnboardingLink = async (accountId: string, redirectLink: string, onboarding: boolean): Promise<string | null> => {
  const origin: string = headers().get("origin") as string;
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}${redirectLink}`,
      return_url: `${origin}${redirectLink}`,
      type: "account_onboarding",
    });
    return accountLink.url;
  } catch (error: any) {
    console.error('An error occurred when calling the Stripe API to create an account link:', error);
    return null;
  }
}

export const updateProfileLink = async (accountId: string, redirectURL: string): Promise<{ url: string } | null> => {
  const origin: string = headers().get("origin") as string;
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}${redirectURL}`,
      return_url: `${origin}${redirectURL}`,
      type: "account_update",
    });
    return { url: accountLink.url }
  } catch (error: any) {
    console.error('An error occurred when calling the Stripe API to create an account link:', error);
    return null;
  }
}

export const createAccountSession = async (accountId: string): Promise<{ client_secret: string | null; error: string | null }> => {
  try {
    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
        payments: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
          }
        },
        payouts: {
          enabled: true,
          features: {
            instant_payouts: true,
            standard_payouts: true,
            edit_payout_schedule: true,
            external_account_collection: true,
          },
        },
        account_management: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
      }
    });
    return { client_secret: accountSession.client_secret, error: null };
  } catch (error: any) {
    console.error(
      "An error occurred when calling the Stripe API to create an account session",
      error
    );
    return { client_secret: null, error: error.message };
  }
}