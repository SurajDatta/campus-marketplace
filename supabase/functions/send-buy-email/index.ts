import React from 'npm:react@18.3.1'
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { Resend } from "npm:resend";
import BuyerReceipt from "./_templates/buyer-receipt.tsx";
import SellerReceipt from "./_templates/seller-receipt.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const developmentURL = Deno.env.get("DEVELOPMENT_URL") as string;
const productionURL = Deno.env.get("PRODUCTION_URL") as string;
const supabaseURL = Deno.env.get("SUPABASE_URL") as string;

Deno.serve(async (req) => {
  try {
    const { 
      development,
      buyer_email,
      seller_email,
      id,
      item_title,
      item_price,
      item_photo_url,
      bought_at,
      selected_contact,
      selected_times,
      selected_locations,
      quick_meetup,
      scheduled_meetup,
      expiry_time 
    } : {
      development: boolean,
      buyer_email: string,
      seller_email: string,
      id: string,
      item_title: string,
      item_price: number,
      item_photo_url: string,
      bought_at: string,
      selected_contact: string[],
      selected_times: string[],
      selected_locations: string[],
      quick_meetup: boolean,
      scheduled_meetup: boolean,
      expiry_time: string,
    } = await req.json();
    console.log("Request body", {
      development,
      buyer_email,
      seller_email,
      id,
      item_title,
      item_price,
      item_photo_url,
      bought_at,
      selected_contact,
      selected_times,
      selected_locations,
      quick_meetup,
      scheduled_meetup,
      expiry_time,
    });
    const origin = development ? developmentURL : productionURL;

    if (selected_times.length !== selected_locations.length) {
      throw new Error("Selected times and locations do not match");
    }

    const options = {timeZone: 'America/New_York'}

    const selectedMeetups = selected_times.map((time, index) => {
      return `${new Date(time).toLocaleString('en-US', options)} (EST) at ${selected_locations[index]}`;
    }).join(", ");
    const selectedContact = selected_contact.join(", ");

    const buyerHtml = await renderAsync(
      React.createElement(BuyerReceipt, {
        supabaseURL: supabaseURL,
        itemTitle: item_title,
        itemPrice: item_price,
        selectedContact: selectedContact,
        meetupLocations: selectedMeetups,
        imgURL: item_photo_url,
        link: `${origin}/my-stuff/${id}`,
        quickMeetup: quick_meetup,
        scheduledMeetup: scheduled_meetup,
        expiryTime: expiry_time,
        boughtAt: bought_at,
      })
    )
    console.log("Buyer HTML", buyerHtml);
    const { error: buyerError } = await resend.emails.send({
      from: "Licks <support@licks.local>",
      to: [buyer_email],
      subject: `Purchase Confirmation for ${item_title}`,
      html: buyerHtml,
    });
    if (buyerError) {
      throw buyerError;
    }

    const sellerHtml = await renderAsync(
      React.createElement(SellerReceipt, {
        supabaseURL: supabaseURL,
        itemTitle: item_title,
        itemPrice: item_price,
        selectedContact: selectedContact,
        meetupLocations: selectedMeetups,
        imgURL: item_photo_url,
        link: `${origin}/my-stuff/${id}`,
        quickMeetup: quick_meetup,
        scheduledMeetup: scheduled_meetup,
        expiryTime: expiry_time,
        boughtAt: bought_at,
      })
    )
    console.log("Seller HTML", sellerHtml);
    const { error: sellerError } = await resend.emails.send({
      from: "Licks <support@licks.local>",
      to: [seller_email],
      subject: `Congratulations! Potential Buyer for ${item_title}`,
      html: sellerHtml,
    });
    if (sellerError) {
      throw sellerError;
    }
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
}
);


