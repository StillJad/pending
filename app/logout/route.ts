import { NextResponse } from "next/server";
import { clearOAuthState, clearSession } from "@/lib/auth";

export async function GET(request: Request) {
  await clearSession();
  await clearOAuthState();

  const response = NextResponse.redirect(new URL("/", request.url));
  return response;
}
