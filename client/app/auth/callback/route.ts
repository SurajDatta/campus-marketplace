/**
 * app/auth/callback/route.ts
 * Route that is hit when the user clicks the button on the confirm signup page. Will redirect the user to the confirm signup page with the token hash and type.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */

import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type"); 
  const email = searchParams.get("email");
  const redirectUrl = searchParams.get("redirect_to");
  if (token_hash && type && redirectUrl) {
    if (type === "signup") {
      return NextResponse.redirect(`${redirectUrl}/verify/confirm-signup?token_hash=${token_hash}&type=${type}&email=${email}`);
    }
  }
  return NextResponse.redirect(`${redirectUrl}/auth/auth-code-error`); // Return the user to an error page with some instructions
}