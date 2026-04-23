import { NextRequest, NextResponse } from "next/server";
import {
  createOAuthState,
  getDiscordAuthorizeUrl,
  normalizeReturnToPath,
  setOAuthStateCookie,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const next = normalizeReturnToPath(request.nextUrl.searchParams.get("next"));
    const { cookieValue, payload } = await createOAuthState(next);
    const response = NextResponse.redirect(getDiscordAuthorizeUrl(payload.state));

    setOAuthStateCookie(response, cookieValue);

    return response;
  } catch (error) {
    console.error("Discord auth redirect failed:", error);

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "config");

    return NextResponse.redirect(loginUrl);
  }
}
