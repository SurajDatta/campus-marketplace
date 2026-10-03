import React from 'npm:react@18.3.1'
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { Resend } from "npm:resend";
import BuyerConfirm from "./_templates/buyer-confirm.tsx";
import SellerConfirm from "./_templates/seller-confirm.tsx";

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
      time,
      location,
    } : {
      development: boolean,
      buyer_email: string,
      seller_email: string,
      id: string,
      item_title: string,
      item_photo_url: string,
      time: string,
      location: string
    } = await req.json();
    const origin = development ? developmentURL : productionURL;

    const options = {timeZone: 'America/New_York'}
    const meetupTime = new Date(time).toLocaleString('en-US', options) + " (EST)"

    const buyerHtml = await renderAsync(
      React.createElement(BuyerConfirm, {
        supabaseURL: supabaseURL,
        itemTitle: item_title,
        imgURL: item_photo_url,
        link: `${origin}/my-stuff/${id}`,
        meetupTime: meetupTime,
        meetupLocation: location,
      })
    )
    const { error: buyerError } = await resend.emails.send({
      from: "Campus Marketplace <support@campus-marketplace.local>",
      to: [buyer_email],
      subject: `Meetup Time Confirmed for ${item_title}`,
      html: buyerHtml,
    });
    if (buyerError) {
      throw buyerError;
    }

    const sellerHtml = await renderAsync(
      React.createElement(SellerConfirm, {
        supabaseURL: supabaseURL,
        itemTitle: item_title,
        imgURL: item_photo_url,
        link: `${origin}/my-stuff/${id}`,
        meetupTime: meetupTime,
        meetupLocation: location,
      })
    )
    const { error } = await resend.emails.send({
      from: "Campus Marketplace <support@campus-marketplace.local>",
      to: [seller_email],
      subject: `Meetup Time Confirmed for ${item_title}`,
      html: sellerHtml,
    });
    if (error) {
      throw error;
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


