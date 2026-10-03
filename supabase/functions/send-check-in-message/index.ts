import { encodeBase64 } from "jsr:@sigma/rust-base64";

const accountSid: string | undefined = Deno.env.get("TWILIO_ACCOUNT_SID");
const authToken: string | undefined = Deno.env.get("TWILIO_AUTH_TOKEN");
const fromNumber: string | undefined = Deno.env.get("TWILIO_PHONE_NUMBER")
const developmentURL = Deno.env.get("DEVELOPMENT_URL") as string;
const productionURL = Deno.env.get("PRODUCTION_URL") as string;

Deno.serve(async (req) => {
  try {
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Your Twilio account credentials are missing. Please add them.");
    }

    const {
      development,
      buyer_phone,
      seller_phone,
      id,
      buyer_met,
      seller_met,
    } : {
      development: boolean,
      buyer_phone: string,
      seller_phone: string,
      id: string,
      buyer_met: boolean,
      seller_met: boolean
    } = await req.json();

    const origin = development ? developmentURL : productionURL;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    let messageBody: string = "";
    let toNumber: string = "";
    if (buyer_met && !seller_met) {
      messageBody = `The buyer has checked in to the meetup. Click here to view: ${origin}/my-stuff/${id}`;
      toNumber = seller_phone;
    } else if (seller_met && !buyer_met) {
      messageBody = `The seller has checked in to the meetup. Click here to view: ${origin}/my-stuff/${id}`;
      toNumber = buyer_phone;
    }

    const body = new URLSearchParams({
      From: fromNumber,
      To: toNumber,
      Body: messageBody,
    });

    const encodedCredentials = encodeBase64(new TextEncoder().encode(`${accountSid}:${authToken}`));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${encodedCredentials}`,
      },
      body,
    });
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }}
);


