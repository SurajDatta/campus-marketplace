/**
 * app/auth/callback/googleCallback/route.ts
 * Route that is hit when the user clicks the button on the confirm signup page. Will redirect the user to the confirm signup page with the token hash and type.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */
import { addCodes } from "@/utils/services/google";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectUrl = searchParams.get("state") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error#error=server_error&error_code=404&error_description=Error+creating+calendar`)
  }
  const {success} = await addCodes(code, `${origin}/auth/googleCallback`)
  if (success) {
    return NextResponse.redirect(redirectUrl + `?gcalstatus=success`)
  } else {
    return NextResponse.redirect(redirectUrl + `?gcalstatus=error`)
  }
}