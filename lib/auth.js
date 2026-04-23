import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export type AuthSession = {
  discordId: string;
  username: string;
  avatar: string | null;
  createdAt: string;
  guildMember: boolean;
};

type OAuthState = {
  state: string;
  next: string;
  createdAt: string;
};

type CookieStoreLike = {
  get(name: string): {
    value: string;
  } | undefined;
};

type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
};

type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
};

const DISCORD_API_BASE = "https://discord.com/api";
const SESSION_COOKIE_NAME = "pending_session";
const OAUTH_STATE_COOKIE_NAME = "pending_oauth_state";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const OAUTH_STATE_MAX_AGE = 60 * 10;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function getSessionSecret() {
  return process.env.AUTH_SECRET ?? getRequiredEnv("DISCORD_CLIENT_SECRET");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signValue(value: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return bytesToBase64Url(new Uint8Array(signature));
}

async function packSignedValue<T>(payload: T) {
  const encodedPayload = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

async function unpackSignedValue<T>(value: string) {
  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const key = await getSigningKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    encoder.encode(encodedPayload)
  );

  if (!valid) {
    return null;
  }

  try {
    const payload = decoder.decode(base64UrlToBytes(encodedPayload));
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}

function isFreshTimestamp(value: string, maxAgeSeconds: number) {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return Date.now() - timestamp <= maxAgeSeconds * 1000;
}

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const parts = cookieHeader.split(/;\s*/);

  for (const part of parts) {
    const separator = part.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = part.slice(0, separator);

    if (key === name) {
      return part.slice(separator + 1);
    }
  }

  return null;
}

export function normalizeReturnToPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value === "/login" ? "/" : value;
}

export async function createOAuthState(next: string) {
  const payload: OAuthState = {
    state: crypto.randomUUID(),
    next: normalizeReturnToPath(next),
    createdAt: new Date().toISOString(),
  };

  return {
    cookieValue: await packSignedValue(payload),
    payload,
  };
}

export async function readOAuthStateCookie(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const payload = await unpackSignedValue<OAuthState>(value);

  if (!payload?.state || !payload.next || !payload.createdAt) {
    return null;
  }

  if (!isFreshTimestamp(payload.createdAt, OAUTH_STATE_MAX_AGE)) {
    return null;
  }

  return {
    ...payload,
    next: normalizeReturnToPath(payload.next),
  };
}

export async function createSessionCookieValue(session: AuthSession) {
  return packSignedValue(session);
}

export async function readSessionCookieValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const payload = await unpackSignedValue<AuthSession>(value);

  if (!payload?.discordId || !payload.username || !payload.createdAt) {
    return null;
  }

  return payload;
}

export async function getSessionFromCookieStore(cookieStore: CookieStoreLike) {
  return readSessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function getSessionFromRequest(request: Request) {
  const cookieValue = getCookieValue(
    request.headers.get("cookie"),
    SESSION_COOKIE_NAME
  );

  return readSessionCookieValue(cookieValue);
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return getSessionFromCookieStore(cookieStore);
}

export function setSessionCookie(response: NextResponse, value: string) {
  response.cookies.set(SESSION_COOKIE_NAME, value, getCookieOptions(SESSION_MAX_AGE));
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getCookieOptions(0),
    expires: new Date(0),
  });
}

export function setOAuthStateCookie(response: NextResponse, value: string) {
  response.cookies.set(
    OAUTH_STATE_COOKIE_NAME,
    value,
    getCookieOptions(OAUTH_STATE_MAX_AGE)
  );
}

export function clearOAuthStateCookie(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, "", {
    ...getCookieOptions(0),
    expires: new Date(0),
  });
}

export function getDiscordAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: getRequiredEnv("DISCORD_CLIENT_ID"),
    redirect_uri: getRequiredEnv("DISCORD_REDIRECT_URI"),
    response_type: "code",
    scope: "identify guilds",
    state,
  });

  return `${DISCORD_API_BASE}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeDiscordCode(code: string) {
  const body = new URLSearchParams({
    client_id: getRequiredEnv("DISCORD_CLIENT_ID"),
    client_secret: getRequiredEnv("DISCORD_CLIENT_SECRET"),
    grant_type: "authorization_code",
    code,
    redirect_uri: getRequiredEnv("DISCORD_REDIRECT_URI"),
  });

  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    body,
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Discord token exchange failed");
  }

  return (await response.json()) as DiscordTokenResponse;
}

export async function fetchDiscordUser(accessToken: string) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Discord user fetch failed");
  }

  return (await response.json()) as DiscordUser;
}

export async function checkDiscordGuildMembership(accessToken: string) {
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return true;
  }

  const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return false;
  }

  const guilds = (await response.json()) as Array<{ id: string }>;
  return guilds.some((guild) => guild.id === guildId);
}

export function getDiscordDisplayName(user: DiscordUser) {
  return user.global_name?.trim() || user.username;
}

export function getDiscordAvatarUrl(user: DiscordUser) {
  if (!user.avatar) {
    return null;
  }

  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}
