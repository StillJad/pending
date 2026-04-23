import { cookies } from "next/headers";

export type AuthSession = {
  discordId: string;
  username: string;
  avatar?: string;
};

type OAuthState = {
  next: string;
  state: string;
  turnstileToken: string;
};

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

type DiscordTokenResponse = {
  access_token: string;
  scope: string;
  token_type: string;
};

type DiscordUser = {
  avatar?: string | null;
  global_name?: string | null;
  id: string;
  username: string;
};

const DISCORD_API_BASE = "https://discord.com/api";
const SESSION_COOKIE_NAME = "session";
const OAUTH_STATE_COOKIE_NAME = "oauth_state";
const OAUTH_STATE_MAX_AGE = 60 * 10;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
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

function encodeCookieValue(value: unknown) {
  return encodeURIComponent(JSON.stringify(value));
}

function decodeCookieValue<T>(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return null;
  }
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

function parseSession(value: string | null | undefined) {
  const session = decodeCookieValue<AuthSession>(value);

  if (!session?.discordId || !session.username) {
    return null;
  }

  return session;
}

function parseOAuthState(value: string | null | undefined) {
  const state = decodeCookieValue<OAuthState>(value);

  if (!state?.state || !state.next || !state.turnstileToken) {
    return null;
  }

  return {
    next: normalizeReturnToPath(state.next),
    state: state.state,
    turnstileToken: state.turnstileToken,
  };
}

export function normalizeReturnToPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value === "/login" ? "/" : value;
}

export async function getSession() {
  const cookieStore = await cookies();
  return parseSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function setSession(session: AuthSession) {
  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    encodeCookieValue({
      avatar: session.avatar,
      discordId: session.discordId,
      username: session.username,
    }),
    getCookieOptions(SESSION_MAX_AGE)
  );
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionFromCookieStore(cookieStore: CookieStoreLike) {
  return parseSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function getSessionFromRequest(request: Request) {
  return parseSession(
    getCookieValue(request.headers.get("cookie"), SESSION_COOKIE_NAME)
  );
}

export async function setOAuthState(next: string, turnstileToken: string) {
  const cookieStore = await cookies();
  const payload: OAuthState = {
    next: normalizeReturnToPath(next),
    state: crypto.randomUUID(),
    turnstileToken,
  };

  cookieStore.set(
    OAUTH_STATE_COOKIE_NAME,
    encodeCookieValue(payload),
    getCookieOptions(OAUTH_STATE_MAX_AGE)
  );

  return payload;
}

export async function clearOAuthState() {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_STATE_COOKIE_NAME);
}

export async function getOAuthStateFromCookieStore(cookieStore: CookieStoreLike) {
  return parseOAuthState(cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value);
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
    code,
    grant_type: "authorization_code",
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
    return undefined;
  }

  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}
