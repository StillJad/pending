import { NextRequest, NextResponse } from "next/server";
import {
  getDiscordAuthorizeUrl,
  normalizeReturnToPath,
  setOAuthState,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const next = normalizeReturnToPath(request.nextUrl.searchParams.get("next"));
    const state = await setOAuthState(next);
    return NextResponse.redirect(getDiscordAuthorizeUrl(state.state));
  } catch (error) {
    console.error("Discord auth redirect failed:", error);

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "config");

    return NextResponse.redirect(loginUrl);
  }
}
