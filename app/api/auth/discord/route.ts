import { NextRequest, NextResponse } from "next/server";
import {
  createOAuthState,
  getDiscordAuthorizeUrl,
  normalizeReturnToPath,
  setOAuthStateCookie,
} from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";

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
          error: "Turnstile verification is required.",
        },
        { status: 400 }
      );
    }

    const verified = await verifyTurnstileToken(turnstileToken, request);

    if (!verified) {
      return Response.json(
        {
          error: "Bot detected",
        },
        { status: 403 }
      );
    }

    const { cookieValue, payload } = await createOAuthState(next);
    const response = NextResponse.json({
      success: true,
      url: getDiscordAuthorizeUrl(payload.state),
    });

    setOAuthStateCookie(response, cookieValue);

    return response;
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
