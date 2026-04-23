import { NextResponse } from "next/server";
import { clearOAuthStateCookie, clearSessionCookie } from "@/lib/auth";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));

  clearSessionCookie(response);
  clearOAuthStateCookie(response);

  return response;
}
