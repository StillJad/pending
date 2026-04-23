import { NextRequest, NextResponse } from "next/server";
import {
  checkDiscordGuildMembership,
  clearOAuthState,
  clearSession,
  exchangeDiscordCode,
  fetchDiscordUser,
  getDiscordAvatarUrl,
  getDiscordDisplayName,
  getOAuthStateFromCookieStore,
  setSession,
} from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = await getOAuthStateFromCookieStore(request.cookies);

  if (!code || !state || !storedState || storedState.state !== state) {
    const failureUrl = new URL("/login", request.url);
    failureUrl.searchParams.set("error", "oauth_failed");
    await clearOAuthState();
    return NextResponse.redirect(failureUrl);
  }

  try {
    const verified = await verifyTurnstileToken(
      storedState.turnstileToken,
      request
    );

    if (!verified) {
      const failureUrl = new URL("/login", request.url);
      failureUrl.searchParams.set("error", "turnstile_failed");
      failureUrl.searchParams.set("next", storedState.next);
      await clearOAuthState();
      await clearSession();
      return NextResponse.redirect(failureUrl);
    }

    const token = await exchangeDiscordCode(code);
    const user = await fetchDiscordUser(token.access_token);
    const guildMember = await checkDiscordGuildMembership(token.access_token);
    await clearOAuthState();

    if (!guildMember) {
      await clearSession();

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "guild_required");
      loginUrl.searchParams.set("next", storedState.next);

      return NextResponse.redirect(loginUrl);
    }

    await setSession({
      avatar: getDiscordAvatarUrl(user),
      discordId: user.id,
      username: getDiscordDisplayName(user),
    });

    return NextResponse.redirect(new URL(storedState.next, request.url));
  } catch (error) {
    console.error("Discord auth callback failed:", error);

    const failureUrl = new URL("/login", request.url);
    failureUrl.searchParams.set("error", "oauth_failed");
    failureUrl.searchParams.set("next", storedState.next);
    await clearOAuthState();
    await clearSession();
    return NextResponse.redirect(failureUrl);
  }
}
