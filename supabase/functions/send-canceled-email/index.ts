import React from 'npm:react@18.3.1'
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { Resend } from "npm:resend";
import BuyerCanceled from "./_templates/buyer-canceled.tsx";
import SellerCanceled from "./_templates/seller-canceled.tsx";

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
      time_completed,
      expires_at,
      cancel_reason,
    } : {
      development: boolean,
      buyer_email: string,
      seller_email: string,
      id: string,
      item_title: string,
      item_photo_url: string,
      time_completed: string,
      expires_at: string | null,
      cancel_reason: string,
    } = await req.json();

    const origin = development ? developmentURL : productionURL;

    const buyerHtml = await renderAsync(
      React.createElement(BuyerCanceled, {
        supabaseURL: supabaseURL,
        itemTitle: item_title,
        imgURL: item_photo_url,
        link: `${origin}/my-stuff/${id}`,
        timeCompleted: time_completed,
        expiresAt: expires_at,
        cancelReason: cancel_reason,
      })
    )
    const { error: buyerError } = await resend.emails.send({
      from: "Campus Marketplace <support@campus-marketplace.local>",
      to: [buyer_email],
      subject: `Purchase of ${item_title} Canceled`,
      html: buyerHtml,
    });
    if (buyerError) {
      throw buyerError;
    }

    const sellerHtml = await renderAsync(
      React.createElement(SellerCanceled, {
        supabaseURL: supabaseURL,
        itemTitle: item_title,
        imgURL: item_photo_url,
        link: `${origin}/my-stuff/${id}`,
        timeCompleted: time_completed,
        expiresAt: expires_at,
        cancelReason: cancel_reason,
      })
    )
    const { error } = await resend.emails.send({
      from: "Campus Marketplace <support@campus-marketplace.local>",
      to: [seller_email],
      subject: `Your Sale of ${item_title} Canceled`,
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


