import { NextRequest, NextResponse } from "next/server";
import {
  clearOAuthStateCookie,
  clearSessionCookie,
  createPersistentSession,
  deletePersistentSession,
  exchangeDiscordCode,
  fetchDiscordGuildMember,
  fetchDiscordUser,
  getDiscordAvatarUrl,
  getDiscordDisplayName,
  getSessionTokenFromRequest,
  passesDiscordRoleCheck,
  readOAuthStateCookie,
  setSessionCookie,
  upsertAuthUser,
} from "@/lib/auth";
import { getRequestIp } from "@/lib/turnstile";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = await readOAuthStateCookie(
    request.cookies.get("oauth_state")?.value ?? null
  );

  const existingSessionToken = getSessionTokenFromRequest(request);

  if (!code || !state || !storedState || storedState.state !== state) {
    const failureUrl = new URL("/login", request.url);
    failureUrl.searchParams.set("error", "oauth_failed");
    const response = NextResponse.redirect(failureUrl);
    clearOAuthStateCookie(response);
    clearSessionCookie(response);
    return response;
  }

  try {
    const token = await exchangeDiscordCode(code);
    const user = await fetchDiscordUser(token.access_token);
    const guildMember = await fetchDiscordGuildMember(user.id);
    const isInServer = Boolean(guildMember);
    const roleCheckPassed = passesDiscordRoleCheck(guildMember);
    const authUser = await upsertAuthUser({
      avatar: getDiscordAvatarUrl(user),
      discordId: user.id,
      ipAddress: getRequestIp(request),
      isInServer,
      roleCheckPassed,
      username: getDiscordDisplayName(user),
    });

    if (existingSessionToken) {
      await deletePersistentSession(existingSessionToken);
    }

    if (!isInServer) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "guild_required");
      loginUrl.searchParams.set("next", storedState.next);
      const response = NextResponse.redirect(loginUrl);
      clearOAuthStateCookie(response);
      clearSessionCookie(response);
      return response;
    }

    if (!roleCheckPassed) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "role_required");
      loginUrl.searchParams.set("next", storedState.next);
      const response = NextResponse.redirect(loginUrl);
      clearOAuthStateCookie(response);
      clearSessionCookie(response);
      return response;
    }

    const sessionToken = await createPersistentSession(authUser.id, request);
    const response = NextResponse.redirect(new URL(storedState.next, request.url));

    clearOAuthStateCookie(response);
    setSessionCookie(response, sessionToken);

    return response;
  } catch (error) {
    console.error("Discord auth callback failed:", error);

    const failureUrl = new URL("/login", request.url);
    failureUrl.searchParams.set("error", "oauth_failed");
    failureUrl.searchParams.set("next", storedState.next);
    const response = NextResponse.redirect(failureUrl);
    clearOAuthStateCookie(response);
    clearSessionCookie(response);
    return response;
  }
}
