import React from 'npm:react@18.3.1'
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { Resend } from "npm:resend";
import { BuyerCheckIn } from "./_templates/buyer-check-in.tsx";
import { SellerCheckIn } from "./_templates/seller-check-in.tsx";

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
      item_photo_url,
      buyer_met,
      seller_met,
      buyer_met_at,
      seller_met_at,
    } : {
      development: boolean,
      buyer_email: string,
      seller_email: string,
      id: string,
      item_title: string,
      item_photo_url: string,
      buyer_met: boolean,
      seller_met: boolean,
      buyer_met_at: string,
      seller_met_at: string,
    } = await req.json();
    console.log("Request body", {
      development,
      buyer_email,
      seller_email,
      id,
      item_title,
      item_photo_url,
      buyer_met,
      seller_met,
      buyer_met_at,
      seller_met_at,
    });
    const origin = development ? developmentURL : productionURL;
    if (buyer_met && !seller_met) {
      const sellerHtml = await renderAsync(
        React.createElement(BuyerCheckIn, {
          supabaseURL: supabaseURL,
          itemTitle: item_title,
          imgURL: item_photo_url,
          link: `${origin}/my-stuff/${id}`,
          checkInTime: buyer_met_at,
        })
      )
      console.log("Seller HTML", sellerHtml);
      const { error: sellerError } = await resend.emails.send({
        from: "Campus Marketplace <support@campus-marketplace.local>",
        to: [seller_email],
        subject: `The buyer for ${item_title} has arrived at the meetup`,
        html: sellerHtml,
      });
      if (sellerError) {
        throw sellerError;
      }
    } else if (!buyer_met && seller_met) {
      const buyerHtml = await renderAsync(
        React.createElement(SellerCheckIn, {
          supabaseURL: supabaseURL,
          itemTitle: item_title,
          imgURL: item_photo_url,
          link: `${origin}/my-stuff/${id}`,
          checkInTime: seller_met_at,
        })
      )
      console.log("Buyer HTML", buyerHtml);
      const { error: buyerError} = await resend.emails.send({
        from: "Campus Marketplace <support@campus-marketplace.local>",
        to: [buyer_email],
        subject: `The seller for ${item_title} has arrived at the meetup`,
        html: buyerHtml,
      });
      if (buyerError) {
        throw buyerError;
      }
    } else {
      // there are no emails to be sent
    }
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
}
);


