import React from 'npm:react@18.3.1'
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { Resend } from "npm:resend";
import BuyerComplete from "./_templates/buyer-complete.tsx";
import SellerComplete from "./_templates/seller-complete.tsx";

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
      meetup_price,
    } : {
      development: boolean,
      buyer_email: string,
      seller_email: string,
      id: string,
      item_title: string,
      item_price: number,
      item_photo_url: string,
      meetup_price: number,
    } = await req.json();
    const origin = development ? developmentURL : productionURL;

    const buyerHtml = await renderAsync(
      React.createElement(BuyerComplete, {
        supabaseURL: supabaseURL,
        itemTitle: item_title,
        itemPrice: item_price,
        imgURL: item_photo_url,
        link: `${origin}/my-stuff/${id}`,
        meetupPrice: meetup_price,
      })
    )
    const { error: buyerError } = await resend.emails.send({
      from: "Campus Marketplace <support@campus-marketplace.local>",
      to: [buyer_email],
      subject: `Congratulations! Your Purchase is Complete`,
      html: buyerHtml,
    });
    if (buyerError) {
      throw buyerError;
    }

    const sellerHtml = await renderAsync(
      React.createElement(SellerComplete, {
        supabaseURL: supabaseURL,
        itemTitle: item_title,
        itemPrice: item_price,
        imgURL: item_photo_url,
        link: `${origin}/my-stuff/${id}`,
        meetupPrice: meetup_price,
      })
    )
    const { error } = await resend.emails.send({
      from: "Campus Marketplace <support@campus-marketplace.local>",
      to: [seller_email],
      subject: `Success! You've Sold ${item_title}`,
      html: sellerHtml,
    });
    if (error) {
      throw error;
    }
    return new Response(
      JSON.stringify({success: true}),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }}
);


