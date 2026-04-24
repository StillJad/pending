import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRequestIp } from "@/lib/turnstile";

export type AuthSession = {
  avatar?: string;
  discordId: string;
  isInServer?: boolean;
  roleCheckPassed?: boolean;
  username: string;
};

type AuthUserRow = {
  avatar: string | null;
  discord_id: string;
  id: string;
  ip_address: string | null;
  is_in_server: boolean;
  role_check_passed: boolean;
  username: string;
};

type SessionRow = {
  expires_at: string;
  id: string;
  session_token: string;
  user_id: string;
};

type SessionContext = AuthSession & {
  expiresAt: string;
  isInServer: boolean;
  roleCheckPassed: boolean;
  sessionId: string;
  sessionToken: string;
  userId: string;
};

type OAuthState = {
  createdAt: string;
  next: string;
  state: string;
};

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

const SESSION_COOKIE_NAME = "session";
const OAUTH_STATE_COOKIE_NAME = "oauth_state";
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

function getSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
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
    encoder.encode(getRequiredEnv("DISCORD_CLIENT_SECRET")),
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

async function unpackSignedValue<T>(value: string | null | undefined) {
  if (!value) {
    return null;
  }

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
    return JSON.parse(decoder.decode(base64UrlToBytes(encodedPayload))) as T;
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

function createSessionToken() {
  return `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
}

function getUserAgent(request: Request) {
  return request.headers.get("user-agent")?.slice(0, 512) ?? null;
}

function toPublicSession(session: SessionContext): AuthSession {
  return {
    avatar: session.avatar,
    discordId: session.discordId,
    isInServer: session.isInServer,
    roleCheckPassed: session.roleCheckPassed,
    username: session.username,
  };
}

function toSessionContext(sessionRow: SessionRow, userRow: AuthUserRow): SessionContext {
  return {
    avatar: userRow.avatar ?? undefined,
    discordId: userRow.discord_id,
    expiresAt: sessionRow.expires_at,
    isInServer: userRow.is_in_server,
    roleCheckPassed: userRow.role_check_passed,
    sessionId: sessionRow.id,
    sessionToken: sessionRow.session_token,
    userId: userRow.id,
    username: userRow.username,
  };
}

function isFreshTimestamp(value: string, maxAgeSeconds: number) {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return Date.now() - timestamp <= maxAgeSeconds * 1000;
}

async function getSessionContextByToken(sessionToken: string | null | undefined) {
  if (!sessionToken) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: sessionRow, error: sessionError } = await supabase
    .from("sessions")
    .select("id, user_id, session_token, expires_at")
    .eq("session_token", sessionToken)
    .gt("expires_at", now)
    .maybeSingle();

  if (sessionError || !sessionRow) {
    return null;
  }

  const sessionData = sessionRow as SessionRow;

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select(
      "id, discord_id, username, avatar, ip_address, is_in_server, role_check_passed"
    )
    .eq("id", sessionRow.user_id)
    .maybeSingle();

  if (userError || !userRow) {
    await deletePersistentSession(sessionToken);
    return null;
  }

  return toSessionContext(sessionData, userRow as AuthUserRow);
}

export function normalizeReturnToPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value === "/login" ? "/" : value;
}

export async function createOAuthState(next: string) {
  const payload: OAuthState = {
    createdAt: new Date().toISOString(),
    next: normalizeReturnToPath(next),
    state: crypto.randomUUID(),
  };

  return {
    cookieValue: await packSignedValue(payload),
    payload,
  };
}

export async function readOAuthStateCookie(value: string | null | undefined) {
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

export function setOAuthStateCookie(response: NextResponse, cookieValue: string) {
  response.cookies.set(
    OAUTH_STATE_COOKIE_NAME,
    cookieValue,
    getSessionCookieOptions(OAUTH_STATE_MAX_AGE)
  );
}

export function clearOAuthStateCookie(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, "", {
    ...getSessionCookieOptions(0),
    expires: new Date(0),
  });
}

export function setSessionCookie(response: NextResponse, sessionToken: string) {
  response.cookies.set(
    SESSION_COOKIE_NAME,
    sessionToken,
    getSessionCookieOptions(SESSION_MAX_AGE)
  );
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(0),
    expires: new Date(0),
  });
}

export function getSessionTokenFromRequest(request: Request) {
  return getCookieValue(request.headers.get("cookie"), SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getSessionContextByToken(
    cookieStore.get(SESSION_COOKIE_NAME)?.value
  );

  return session ? toPublicSession(session) : null;
}

export async function getSessionFromCookieStore(cookieStore: CookieStoreLike) {
  return getSessionContextByToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function getSessionFromRequest(request: Request) {
  return getSessionContextByToken(getSessionTokenFromRequest(request));
}

export function getSessionAccessError(session: SessionContext | null) {
  if (!session) {
    return "login_required";
  }

  if (!session.isInServer) {
    return "guild_required";
  }

  if (!session.roleCheckPassed) {
    return "role_required";
  }

  return null;
}

export async function upsertAuthUser(input: {
  avatar?: string;
  discordId: string;
  ipAddress: string | null;
  isInServer: boolean;
  roleCheckPassed: boolean;
  username: string;
}) {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        auth_provider: "discord",
        avatar: input.avatar ?? null,
        discord_id: input.discordId,
        ip_address: input.ipAddress,
        is_in_server: input.isInServer,
        last_login_at: now,
        role_check_passed: input.roleCheckPassed,
        updated_at: now,
        username: input.username,
      },
      {
        onConflict: "discord_id",
      }
    )
    .select(
      "id, discord_id, username, avatar, ip_address, is_in_server, role_check_passed"
    )
    .single();

  if (error || !data) {
    throw new Error("Failed to save user");
  }

  return data as AuthUserRow;
}

export async function createPersistentSession(userId: string, request: Request) {
  const supabase = getSupabaseAdmin();
  const sessionToken = createSessionToken();
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_MAX_AGE * 1000).toISOString();

  const { error } = await supabase.from("sessions").insert([
    {
      expires_at: expiresAt,
      ip_address: getRequestIp(request),
      session_token: sessionToken,
      user_agent: getUserAgent(request),
      user_id: userId,
    },
  ]);

  if (error) {
    throw new Error("Failed to create session");
  }

  return sessionToken;
}

export async function deletePersistentSession(sessionToken: string | null | undefined) {
  if (!sessionToken) {
    return;
  }

  const supabase = getSupabaseAdmin();
  await supabase.from("sessions").delete().eq("session_token", sessionToken);
}
