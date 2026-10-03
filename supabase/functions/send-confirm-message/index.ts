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
      id,
      item_title,
    }: {
      development: boolean,
      buyer_phone: string,
      id: string,
      item_title: string,
    } = await req.json();

    const origin = development ? developmentURL : productionURL;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const messageBody = `The seller for ${item_title} has confirmed a meetup! Click here to view: ${origin}/my-stuff/${id}`;

    const body = new URLSearchParams({
      From: fromNumber,
      To: buyer_phone,
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


