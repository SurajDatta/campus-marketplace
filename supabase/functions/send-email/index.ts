import React from 'npm:react@18.3.1'
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { Resend } from "npm:resend";
import { ConfirmSignupEmail } from "./_templates/confirm-signup.tsx";
import MagicLinkEmail from "./_templates/magic-link.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;
const supabaseURL = Deno.env.get("SUPABASE_URL") as string;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret);
  try {
    const { user: { email, user_metadata }, email_data: { token, token_hash, redirect_to, email_action_type } } = wh.verify(payload, headers) as {
      user: {
        email: string;
        user_metadata: { 
          first_name: string
          last_name: string
        }
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
        token_new: string;
        token_hash_new: string;
      };
    };
    if (email_action_type === "signup" || email_action_type === "email_change") {
      const firstName = user_metadata.first_name
      const html = await renderAsync(
        React.createElement(ConfirmSignupEmail, {
          first_name: firstName,
          type: email_action_type,
          redirect_to,
          token_hash,
          email,
          supabaseURL,
        })
      )
      const { error } = await resend.emails.send({
        from: "Licks <support@licks.local>",
        to: [email],
        subject: "Welcome to Licks!",
        html: html,
      });
      if (error) {
        throw error;
      }
    } else if (email_action_type === "magiclink") {
      const html = await renderAsync(
        React.createElement(MagicLinkEmail, {
          token,
          supabaseURL,
        })
      )
      const { error } = await resend.emails.send({
        from: "Licks <support@licks.local>",
        to: [email],
        subject: "Your Verification Code",
        html: html,
      });
      if (error) {
        throw error;
      }
    } else {
      throw new Error("Invalid email action type" + email_action_type);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code,
          message: error.message,
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json");
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: responseHeaders,
  });
});
