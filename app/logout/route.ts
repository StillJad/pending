import { NextResponse } from "next/server";
import {
  clearOAuthStateCookie,
  clearSessionCookie,
  deletePersistentSession,
  getSessionTokenFromRequest,
} from "@/lib/auth";

export async function GET(request: Request) {
  await deletePersistentSession(getSessionTokenFromRequest(request));

  const response = NextResponse.redirect(new URL("/", request.url));
  clearSessionCookie(response);
  clearOAuthStateCookie(response);
  return response;
}
