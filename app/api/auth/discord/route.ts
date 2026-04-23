import { NextRequest, NextResponse } from "next/server";
import {
  getDiscordAuthorizeUrl,
  normalizeReturnToPath,
  setOAuthState,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    normalizeReturnToPath(request.nextUrl.searchParams.get("next"))
  );

  return NextResponse.redirect(loginUrl);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const next = normalizeReturnToPath(
      typeof body.next === "string" ? body.next : null
    );
    const turnstileToken =
      typeof body.turnstileToken === "string" ? body.turnstileToken : "";

    if (!turnstileToken) {
      return Response.json(
        {
          error: "Verification failed. Try again.",
        },
        { status: 400 }
      );
    }

    const state = await setOAuthState(next, turnstileToken);

    return Response.json({
      success: true,
      url: getDiscordAuthorizeUrl(state.state),
    });
  } catch (error) {
    console.error("Discord auth redirect failed:", error);

    return Response.json(
      {
        error: "Discord login is not configured yet.",
      },
      { status: 500 }
    );
  }
}
