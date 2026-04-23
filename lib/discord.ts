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

type DiscordGuildMember = {
  roles: string[];
  user?: {
    id: string;
  };
};

const DISCORD_API_BASE = "https://discord.com/api";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

export function getRequiredRoleIds() {
  return (process.env.DISCORD_REQUIRED_ROLE_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getDiscordAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: getRequiredEnv("DISCORD_CLIENT_ID"),
    redirect_uri: getRequiredEnv("DISCORD_REDIRECT_URI"),
    response_type: "code",
    scope: "identify",
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

export async function fetchDiscordGuildMember(discordUserId: string) {
  const guildId = getRequiredEnv("DISCORD_GUILD_ID");
  const botToken = getRequiredEnv("DISCORD_BOT_TOKEN");

  const response = await fetch(
    `${DISCORD_API_BASE}/guilds/${guildId}/members/${discordUserId}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Discord guild member fetch failed");
  }

  return (await response.json()) as DiscordGuildMember;
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

export function passesDiscordRoleCheck(member: DiscordGuildMember | null) {
  if (!member) {
    return false;
  }

  const requiredRoleIds = getRequiredRoleIds();

  if (!requiredRoleIds.length) {
    return true;
  }

  return member.roles.some((roleId) => requiredRoleIds.includes(roleId));
}
