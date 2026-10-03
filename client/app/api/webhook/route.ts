/**
 * app/api/webhook/route.ts
 * Webhook route to handle Stripe events. This route will update the status of an item, payment details, and meetup status.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */

import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import stripe from "@/utils/stripe/stripeServer";
import { createMeetup, fetchItemById, fetchLocations, fetchMeetup, updateActiveStatus, updateExpiryTime, updateItemQuantity, updateMeetupConfirmed, updateMeetupStatus, updateTimeCompleted } from "@/utils/services/buy";
import { createAlert } from "@/utils/services/alerts";
import { CheckoutMetadata, CheckoutType, ConfirmMetadata, PaymentIntentData, PaymentIntentType, PotentialMeetup, SubscriptionData } from "@/types";
import { fetchSellerId, updateCustomerId, updateSellerVerifiedItems } from "@/utils/services/sell";
import { updatePaymentIntentMetadata } from "@/utils/services/stripe";

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string,
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
    "checkout.session.completed",
    "payment_intent.succeeded",
    "payment_intent.canceled",
    "payment_intent.payment_failed",
    "customer.subscription.deleted",
  ];

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;
          console.log(`💰 CheckoutSession status: ${data.payment_status}`);
          if (data.metadata == null) {
            throw new Error("Client reference ID is missing");
          }
          const type = data.metadata.type as CheckoutType;
          if (type === "buy") {
            const checkoutMetadata: CheckoutMetadata = {
              item_id: data.metadata.item_id,
              origin: data.metadata.origin,
              development: data.metadata.development,
              buyer_id: data.metadata.buyer_id,
              seller_id: data.metadata.seller_id,
              contact_enabled: data.metadata.contact_enabled,
              schedule_enabled: data.metadata.schedule_enabled,
              safe_meetup_enabled: data.metadata.safe_meetup_enabled,
              contact: data.metadata.contact,
              potential_meetups: data.metadata.potential_meetups,
              price: data.metadata.price,
              expiry_time: data.metadata.expiry_time,
            };


            const buyerId = checkoutMetadata.buyer_id;
            const sellerId = checkoutMetadata.seller_id;
            const contactEnabled = checkoutMetadata.contact_enabled === "true";
            const scheduleEnabled = checkoutMetadata.schedule_enabled === "true";
            const safeMeetupEnabled = checkoutMetadata.safe_meetup_enabled === "true";
            const contact = JSON.parse(checkoutMetadata.contact) as string[];
            const potentialMeetups = JSON.parse(checkoutMetadata.potential_meetups) as PotentialMeetup[];
            const price = Number(checkoutMetadata.price);


            const expiryTime = checkoutMetadata.expiry_time;
            const paymentIntent = data.payment_intent as string;

            const development = checkoutMetadata.development === "true";
            const itemId = checkoutMetadata.item_id;

            const item = await fetchItemById(checkoutMetadata.item_id, checkoutMetadata.development === "true");
            if (!item) {
              throw new Error("Could not find item");
            }

            const title = item.title
            const listedAt = item.last_edited
            const description = item.description
            const condition = item.condition
            const photoUrls = item.photo_urls
            const photoSizes = item.photo_sizes as { x: number, y: number, w: number, h: number }[]
            const negotiable = item.negotiable


            const meetup = await createMeetup(buyerId, sellerId, listedAt, contactEnabled, scheduleEnabled, safeMeetupEnabled, contact, potentialMeetups, title, description, condition, price, photoUrls, photoSizes, negotiable, development, expiryTime, paymentIntent, itemId);
            if (!meetup) {
              throw new Error("Failed to create meetup");
            }

            const {success: updatePaymentIntentSuccess, error: updatePaymentIntentError} = await updatePaymentIntentMetadata(meetup.id, paymentIntent);
            if (!updatePaymentIntentSuccess) {
              throw new Error(`Failed to update payment intent metadata: ${updatePaymentIntentError}`);
            }

            const locations = await fetchLocations(sellerId);

            let buyerAlertId = null;
            let sellerAlertId = null;
            if (contact) {
              buyerAlertId = await createAlert(
                buyerId,
                `You have requested to purchase **${title}** for **$${price.toFixed(2)}** through Quick Meetup, using the following contact methods: **${contact.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}**. Next, please reach out to the seller using the contact information avaiable on the meetup page to exchange and verify the item.`,
                photoUrls[0],
                `${checkoutMetadata.origin}/my-stuff/${meetup.id}`
              );

              sellerAlertId = await createAlert(
                sellerId,
                `A buyer has requested to purchase **${title}** for **$${price.toFixed(2)}** through Quick Meetup, providing the following contact methods: **${contact.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}**. Next, please reach out to the buyer using the contact information avaiable on the meetup page to exchange and verify the item.`,
                photoUrls[0],
                `${checkoutMetadata.origin}/my-stuff/${meetup.id}`
              );

            } else if (scheduleEnabled && potentialMeetups) {
              const meetupLocations: string[] = potentialMeetups.map(({ time, location }) => `**${new Date(time).toLocaleString()}** at **${locations.find((loc) => loc.id === location)?.name}**`);

              buyerAlertId = await createAlert(
                buyerId,
                `You have requested to purchase **${title}** for **$${price.toFixed(2)}** through Scheduled Meetup, choosing the meetup times: ${meetupLocations.join(",")}. The seller has 24 hours (until **${new Date(expiryTime).toLocaleString()}**) to confirm a meetup time; otherwise, the purchase request will be canceled. You can check the item's status at any time on the MyStuff page. We will notify you once a time has been confirmed or if the transaction is canceled.`,
                photoUrls[0],
                `${checkoutMetadata.origin}/my-stuff/${meetup.id}`
              );

              sellerAlertId = await createAlert(
                sellerId,
                `A buyer has requested to purchase **${title}** for **$${price.toFixed(2)}** using Scheduled Meetup, proposing meeting at: ${meetupLocations.join(",")}. Make a selection of which time works best for you, and we will notify the buyer. You need to confirm a meetup time within the next 24 hours (you have until **${new Date(expiryTime).toLocaleString()}**), or the transaction will be canceled.`,
                photoUrls[0],
                `${checkoutMetadata.origin}/my-stuff/${meetup.id}`
              );
            }

            if (!buyerAlertId) {
              throw new Error("Failed to create alert for the buyer");
            }

            if (!sellerAlertId) {
              throw new Error("Failed to create alert for the seller");
            }
          } else if (type === "subscription") {
            const subscriptionMetadata: SubscriptionData = {
              user_id: data.metadata.user_id,
              development: data.metadata.development,
            };
            const development = subscriptionMetadata.development === "true";
            const { success: updateCustomerSuccess, error: updateCustomerError } = await updateCustomerId(subscriptionMetadata.user_id, String(data.customer), development, true)
            if (!updateCustomerSuccess) {
              throw new Error(`Failed to update customer ID: ${updateCustomerError}`);
            }
            const { success: updateItemsVerifySuccess, error: updateItemsVerifyError } = await updateSellerVerifiedItems(subscriptionMetadata.user_id, development, true)
            if (!updateItemsVerifySuccess) {
              throw new Error(`Failed to update seller verified items: ${updateItemsVerifyError}`);
            }
          } else if (type === "confirm") {
            const confirmMetadata: ConfirmMetadata = {
              meetup_id: data.metadata.meetup_id,
              buyer_id: data.metadata.buyer_id,
              seller_id: data.metadata.seller_id,
              item_photo: data.metadata.photo_url,
              item_title: data.metadata.item_title,
              time: data.metadata.time,
              location: data.metadata.location,
            };
            const buyerId = confirmMetadata.buyer_id;
            const sellerId = confirmMetadata.seller_id; // will need to probably create alert for seller as well.
            const meetupId = confirmMetadata.meetup_id;
            const itemTitle = confirmMetadata.item_title;
            const itemPhoto = confirmMetadata.item_photo;
            const meetupTime = confirmMetadata.time
            const meetupLocation = Number(confirmMetadata.location)
            const paymentIntent = data.payment_intent as string;

            const { success: meetupTimeSuccess } = await updateMeetupConfirmed(meetupId, meetupTime, meetupLocation, paymentIntent);
            if (!meetupTimeSuccess) {
              throw new Error('Error updating meetup time.');
            }

            const locations = await fetchLocations(sellerId);
            const { success: meetupStatusSuccess } = await updateMeetupStatus(meetupId, 'meeting');
            if (!meetupStatusSuccess) {
              throw new Error('Error updating meetup status.');
            }

            const location = locations.find((loc) => loc.id == meetupLocation) ?? null;
            if (!location) {
              throw new Error('Location not found');
            }
            // sending email
            const buyerAlertId = await createAlert(
              buyerId,
              `The seller for **${itemTitle}** has selected a meetup time: **${new Date(meetupTime).toLocaleString()}**. As a reminder, the chosen location is: **${location.name}**. You can view this information anytime on the MyStuff page. When you arrive at the designated location at the specified time, please check in to notify the seller of your arrival. As a next step, prepare to meet the seller at the meetup time and location.`,
              itemPhoto,
              `${origin}/my-stuff/${meetupId}`
            );

            if (!buyerAlertId) {
              throw new Error("Failed to create alert for the buyer");
            }

            const sellerAlertId = await createAlert(
              sellerId,
              `You have selected a meetup time for the purchase of **${itemTitle}**: **${new Date(meetupTime).toLocaleString()} at ${location.name}**. You can view this information anytime on the MyStuff page. When you arrive at the designated location at the specified time, please check in to notify the buyer of your arrival. As a next step, prepare to meet the buyer at the meetup time and location.`,
              itemPhoto,
              `${origin}/my-stuff/${meetupId}`
            );

            if (!sellerAlertId) {
              throw new Error("Failed to create alert for the buyer");
            }

          }

          break;
        case "payment_intent.payment_failed":
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`❌ Payment failed: ${data.last_payment_error?.message}`);
          break;
        case "payment_intent.canceled":
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`💰 PaymentIntent status: ${data.status}`);
          if (data.metadata == null) {
            throw new Error("Client reference ID is missing");
          }

          const paymentCancelType = data.metadata.type as PaymentIntentType;

          const paymentCancelMetadata: PaymentIntentData = {
            item_id: data.metadata.item_id,
            origin: data.metadata.origin,
            development: data.metadata.development,
            meetup_id: data.metadata.meetup_id,
          };

          const cancelMeetup = await fetchMeetup(paymentCancelMetadata.meetup_id)
          if (!cancelMeetup) {
            throw new Error("Could not find meetup")
          }

          // we should cancel the meetup in two cases. 1. The buyer has canceled the meetup during the check in phase, which results in accepting the seller's payment, but rejecting the buyer's payment. The buyer would not have met, but the seller could have. In any cancellation 

          if (paymentCancelType === "purchase" || (paymentCancelType === "confirmation" && !(cancelMeetup.buyer_met && cancelMeetup.seller_met))) {
            // all other cases we should cancel the meetup
            const cancelDate = new Date()
            // redundant, but if we ever implement the return after cancellation to be false
            const { success: cancelItemActiveSuccess } = await updateActiveStatus(paymentCancelMetadata.item_id, true);
            if (!cancelItemActiveSuccess) {
              throw new Error('Failed to update active status');
            }
            // incrementing the quantity of the item
            const item = await fetchItemById(paymentCancelMetadata.item_id, paymentCancelMetadata.development === "true");
            if (!item) {
              throw new Error("Could not find item");
            }
            const { success: itemQuantitySuccess } = await updateItemQuantity(paymentCancelMetadata.item_id, item.quantity + 1);
            if (!itemQuantitySuccess) {
              throw new Error("Failed to update item quantity");
            }

            const { success: cancelTimeCompleteSuccess } = await updateTimeCompleted(paymentCancelMetadata.meetup_id, cancelDate.toISOString());
            if (!cancelTimeCompleteSuccess) {
              throw new Error('Failed to update time complete');
            }

            // stripe will cancel payment, so we can safely update the expiry time to null.
            const { success: cancelClearExpiryTime } = await updateExpiryTime(paymentCancelMetadata.meetup_id, null);
            if (!cancelClearExpiryTime) {
              throw new Error('Failed to clear expiry time');
            }

            const expired = cancelMeetup.expires_at && new Date(cancelMeetup.expires_at) < new Date();
            let buyerCancelAlertId = null;
            let sellerCancelAlertId = null;

            if (expired && cancelMeetup.expires_at) {
              if (cancelMeetup.schedule_enabled && cancelMeetup.time === null) { // Meetup was not confirmed
                buyerCancelAlertId = await createAlert(
                  cancelMeetup.buyer_id,
                  `The request to purchase **${cancelMeetup.item_title}** was canceled on **${cancelDate.toLocaleString()}** due to the transaction expiring (expired at: **${new Date(cancelMeetup.expires_at).toLocaleString()}** because the seller did not confirm the meetup). The hold on your card has been released, and the item's status is now canceled. For more details, check the MyStuff page. No further action is needed from you at this time.`,
                  cancelMeetup.item_photo_urls[0],
                  `${paymentCancelMetadata.origin}/my-stuff/${paymentCancelMetadata.meetup_id}`
                );
                if (!buyerCancelAlertId) throw new Error('Failed to create alert for buyer');

                sellerCancelAlertId = await createAlert(
                  cancelMeetup.seller_id,
                  `The request to purchase **${cancelMeetup.item_title}** was canceled on **${cancelDate.toLocaleString()}** due to the transaction expiring (expired at: **${new Date(cancelMeetup.expires_at).toLocaleString()}** because you were unable to confirm the meetup before all of thenm expired). For more details, check the MyStuff page. No further action is needed from you at this time.`,
                  cancelMeetup.item_photo_urls[0],
                  `${paymentCancelMetadata.origin}/my-stuff/${paymentCancelMetadata.meetup_id}`
                );

                if (!sellerCancelAlertId) throw new Error('Failed to create alert for seller');
              } else {
                buyerCancelAlertId = await createAlert(
                  cancelMeetup.buyer_id,
                  `The request to purchase **${cancelMeetup.item_title}** was canceled on **${cancelDate.toLocaleString()}** due to the transaction expiring (expired at: **${new Date(cancelMeetup.expires_at).toLocaleString()}**). The hold on your card has been released, and the item's status is now canceled. For more details, check the MyStuff page. No further action is needed from you at this time.`,
                  cancelMeetup.item_photo_urls[0],
                  `${paymentCancelMetadata.origin}/my-stuff/${paymentCancelMetadata.meetup_id}`
                );

                if (!buyerCancelAlertId) throw new Error('Failed to create alert for buyer');

                sellerCancelAlertId = await createAlert(
                  cancelMeetup.seller_id,
                  `The request to purchase **${cancelMeetup.item_title}** was canceled on **${cancelDate.toLocaleString()}** due to the transaction expiring (expired at: **${new Date(cancelMeetup.expires_at).toLocaleString()}**). For more details, check the MyStuff page. No further action is needed from you at this time.`,
                  cancelMeetup.item_photo_urls[0],
                  `${paymentCancelMetadata.origin}/my-stuff/${paymentCancelMetadata.meetup_id}`
                );

                if (!sellerCancelAlertId) throw new Error('Failed to create alert for seller');
              }
            } else {
              buyerCancelAlertId = await createAlert(
                cancelMeetup.buyer_id,
                `You have canceled the request to purchase **${cancelMeetup.item_title}** on **${cancelDate.toLocaleString()}**. The hold on your card has been released, and the item's status is now canceled. For more details, check the MyStuff page. No further action is needed from you at this time.`,
                cancelMeetup.item_photo_urls[0],
                `${paymentCancelMetadata.origin}/my-stuff/${paymentCancelMetadata.meetup_id}`
              );

              if (!buyerCancelAlertId) throw new Error('Failed to create alert for buyer');

              sellerCancelAlertId = await createAlert(
                cancelMeetup.seller_id,
                `The buyer has canceled the request to purchase **${cancelMeetup.item_title}** on **${cancelDate.toLocaleString()}**. For more details, check the MyStuff page. No further action is needed from you at this time.`,
                cancelMeetup.item_photo_urls[0],
                `$${paymentCancelMetadata.origin}/my-stuff/${paymentCancelMetadata.meetup_id}`
              );

              if (!sellerCancelAlertId) throw new Error('Failed to create alert for seller');
            }
          }


          break;
        case "payment_intent.succeeded":
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`💰 PaymentIntent status: ${data.status}`);
          if (data.metadata == null) {
            throw new Error("Client reference ID is missing");
          }


          const paymentConfirmType = data.metadata.type as PaymentIntentType;

          const paymentConfirmMetadata: PaymentIntentData = {
            item_id: data.metadata.item_id,
            development: data.metadata.development,
            origin: data.metadata.origin,
            meetup_id: data.metadata.meetup_id,
          };

          if (paymentConfirmType !== "confirmation") {
            // we should only run the code, as long as actual meetup gets bought
            const confirmDate = new Date()

            const { success: confirmItemActiveSuccess } = await updateActiveStatus(paymentConfirmMetadata.item_id, false);
            if (!confirmItemActiveSuccess) {
              throw new Error('Failed to update active status');
            }

            // now we can safely move the status of the item from confirmed to complete
            const { success: confirmItemSuccess } = await updateMeetupStatus(paymentConfirmMetadata.meetup_id, 'complete');
            if (!confirmItemSuccess) {
              throw new Error('Failed to update status');
            }

            const { success: confirmTimeCompleteSuccess } = await updateTimeCompleted(paymentConfirmMetadata.meetup_id, confirmDate.toISOString());
            if (!confirmTimeCompleteSuccess) {
              throw new Error('Failed to update time complete');
            }

            // stripe will accept payment, so we can safely update the expiry time to null
            const { success: confirmClearExpiryTime } = await updateExpiryTime(paymentConfirmMetadata.meetup_id, null);
            if (!confirmClearExpiryTime) {
              throw new Error('Failed to clear expiry time');
            }

            const confirmMeetup = await fetchMeetup(paymentConfirmMetadata.meetup_id)
            if (!confirmMeetup) {
              throw new Error("Could not find meetup")
            }

            let buyerConfirmAlertId = null;
            let sellerConfirmAlertId = null;
            const priceChanged = confirmMeetup.meetup_price !== confirmMeetup.item_price;

            if (priceChanged) {
              buyerConfirmAlertId = await createAlert(
                confirmMeetup.buyer_id,
                `You have successfully purchased **${confirmMeetup.item_title}** for **$${confirmMeetup.meetup_price.toFixed(2)}**. Due to a seller discount, you were only charged **$${confirmMeetup.meetup_price.toFixed(2)}**, although an initial hold of **$${Number(confirmMeetup.item_price).toFixed(2)}** was placed on your card. You can view the status of the item on your MyStuff page. No further action is required from you at this time.`,
                confirmMeetup.item_photo_urls[0],
                `${paymentConfirmMetadata.origin}/my-stuff/${paymentConfirmMetadata.meetup_id}`
              );

              if (!buyerConfirmAlertId) {
                throw new Error('Failed to create alert for buyer');
              }

              sellerConfirmAlertId = await createAlert(
                confirmMeetup.seller_id,
                `You have successfully sold **${confirmMeetup.item_title}** for **$${confirmMeetup.meetup_price.toFixed(2)}**. Due to providing a discount to the buyer, you received **$${confirmMeetup.meetup_price.toFixed(2)}** instead of the original listing price of **$${Number(confirmMeetup.item_price).toFixed(2)}**. You can view the status of the item on your MyStuff page. No further action is required from you at this time.`,
                confirmMeetup.item_photo_urls[0],
                `${paymentConfirmMetadata.origin}/my-stuff/${paymentConfirmMetadata.meetup_id}`
              );

              if (!sellerConfirmAlertId) {
                throw new Error('Failed to create alert for seller');
              }

            } else {
              buyerConfirmAlertId = await createAlert(
                confirmMeetup.buyer_id,
                `You have successfully purchased **${confirmMeetup.item_title}** for **$${confirmMeetup.meetup_price.toFixed(2)}**. You can view the status of the item on your MyStuff page. No further action is required from you at this time.`,
                confirmMeetup.item_photo_urls[0],
                `${paymentConfirmMetadata.origin}/my-stuff/${paymentConfirmMetadata.meetup_id}`
              );

              if (!buyerConfirmAlertId) {
                throw new Error('Failed to create alert for buyer');
              }

              sellerConfirmAlertId = await createAlert(
                confirmMeetup.seller_id,
                `You have successfully sold **${confirmMeetup.item_title}** for **$${confirmMeetup.meetup_price.toFixed(2)}**. You can view the status of the item on your MyStuff page. No further action is required from you at this time.`,
                confirmMeetup.item_photo_urls[0],
                `${paymentConfirmMetadata.origin}/my-stuff/${paymentConfirmMetadata.meetup_id}`
              );

              if (!sellerConfirmAlertId) {
                throw new Error('Failed to create alert for seller');
              }
            }
          }

          break;
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`🔒 Subscription status: ${subscription.status}`)
          const { sellerId, development: developmentStatus } = await fetchSellerId(String(subscription.customer));
          if (!sellerId) {
            throw new Error("Failed to fetch seller ID");
          }
          if (!developmentStatus) {
            throw new Error("Failed to fetch development status");
          }
          const { success: updateCustomerSuccess, error: updateCustomerError } = await updateCustomerId(sellerId, String(subscription.customer), developmentStatus, false)
          if (!updateCustomerSuccess) {
            throw new Error(`Failed to update customer ID: ${updateCustomerError}`);
          }
          const { success: removeItemsVerifySuccess, error: removeItemsVerifyError } = await updateSellerVerifiedItems(sellerId, developmentStatus, false)
          if (!removeItemsVerifySuccess) {
            throw new Error(`Failed to update seller verified items: ${removeItemsVerifyError}`);
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
