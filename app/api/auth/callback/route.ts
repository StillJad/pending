import { NextRequest, NextResponse } from "next/server";
import {
  checkDiscordGuildMembership,
  clearOAuthStateCookie,
  createSessionCookieValue,
  exchangeDiscordCode,
  fetchDiscordUser,
  getDiscordAvatarUrl,
  getDiscordDisplayName,
  readOAuthStateCookie,
  setSessionCookie,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = await readOAuthStateCookie(
    request.cookies.get("pending_oauth_state")?.value ?? null
  );

  if (!code || !state || !storedState || storedState.state !== state) {
    const failureUrl = new URL("/login", request.url);
    failureUrl.searchParams.set("error", "oauth_failed");

    const response = NextResponse.redirect(failureUrl);
    clearOAuthStateCookie(response);
    return response;
  }

  try {
    const token = await exchangeDiscordCode(code);
    const user = await fetchDiscordUser(token.access_token);
    const guildMember = await checkDiscordGuildMembership(token.access_token);

    const sessionValue = await createSessionCookieValue({
      avatar: getDiscordAvatarUrl(user),
      createdAt: new Date().toISOString(),
      discordId: user.id,
      guildMember,
      username: getDiscordDisplayName(user),
    });

    const redirectUrl = new URL(
      guildMember
        ? storedState.next
        : `/login?next=${encodeURIComponent(storedState.next)}&error=guild_required`,
      request.url
    );

    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    setSessionCookie(response, sessionValue);

    return response;
  } catch (error) {
    console.error("Discord auth callback failed:", error);

    const failureUrl = new URL("/login", request.url);
    failureUrl.searchParams.set("error", "oauth_failed");
    failureUrl.searchParams.set("next", storedState.next);

    const response = NextResponse.redirect(failureUrl);
    clearOAuthStateCookie(response);

    return response;
  }
}
