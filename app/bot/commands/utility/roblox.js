const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

const ROBLOX_USERS_API = "https://users.roblox.com/v1";
const ROBLOX_FRIENDS_API = "https://friends.roblox.com/v1";
const ROBLOX_THUMBNAILS_API = "https://thumbnails.roblox.com/v1";
const ROBLOX_BADGES_API = "https://accountinformation.roblox.com/v1";
const ROBLOX_PRESENCE_API = "https://presence.roblox.com/v1";
const ROBLOX_PREMIUM_API = "https://premiumfeatures.roblox.com/v1";

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number.isFinite(value) ? value : 0);
}

function truncate(text, maxLength = 1024) {
  const value = String(text || "").trim();
  if (!value) return "No bio set";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

function formatCount(value) {
  return Number.isFinite(value) ? formatNumber(value) : "Not available";
}

function formatCreated(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? `<t:${Math.floor(timestamp / 1000)}:F>`
    : "Not available";
}

function formatPremiumStatus(data) {
  if (typeof data === "boolean") {
    return data ? "Yes" : "No";
  }

  if (typeof data?.isPremium === "boolean") {
    return data.isPremium ? "Yes" : "No";
  }

  return "Not available";
}

function formatPresence(data) {
  const presence = data?.userPresences?.[0];
  if (!presence) {
    return "Not available";
  }

  return Number(presence.userPresenceType) === 0 ? "Offline" : "Online";
}

function formatList(values, unavailableText = "Not available", emptyText = "None") {
  if (!Array.isArray(values)) {
    return unavailableText;
  }

  if (!values.length) {
    return emptyText;
  }

  const combined = values.join(", ");
  if (combined.length <= 1024) {
    return combined;
  }

  return `${combined.slice(0, 1021)}...`;
}

async function fetchJson(url, options = {}, { optional = false } = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok || Array.isArray(data?.errors)) {
      if (optional) {
        return null;
      }

      throw new Error(
        data?.errors?.[0]?.message ||
          data?.message ||
          `request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    if (optional) {
      return null;
    }

    throw error;
  }
}

async function resolveUser(username) {
  const payload = await fetchJson(`${ROBLOX_USERS_API}/usernames/users`, {
    method: "POST",
    body: JSON.stringify({
      usernames: [username],
      excludeBannedUsers: false,
    }),
  });

  return Array.isArray(payload?.data) ? payload.data[0] || null : null;
}

function buildErrorEmbed(config, description) {
  return new EmbedBuilder()
    .setColor(0xed4245)
    .setDescription(description)
    .setFooter({ text: "Pending | pending.cc" })
    .setTimestamp();
}

module.exports = {
  name: "roblox",
  description: "Look up a Roblox user profile.",
  data: new SlashCommandBuilder()
    .setName("roblox")
    .setDescription("Look up a Roblox user profile")
    .addStringOption((option) =>
      option.setName("username").setDescription("Roblox username").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const message = isInteraction ? null : target;
    const username = String(
      isInteraction ? target.options.getString("username") : args.join(" ")
    ).trim();
    const config = (isInteraction ? target.client : message.client).getConfig(
      isInteraction ? target.guild : message.guild
    );

    if (!username) {
      const payload = {
        embeds: [buildErrorEmbed(config, "use ,roblox <username>")],
      };
      if (isInteraction) {
        return target.reply({ ...payload, flags: 64 });
      }
      return message.reply(payload);
    }

    try {
      const lookup = await resolveUser(username);
      if (!lookup?.id) {
        const payload = {
          embeds: [buildErrorEmbed(config, "roblox user not found")],
        };
        if (isInteraction) {
          return target.reply({ ...payload, flags: 64 });
        }
        return message.reply(payload);
      }

      const userId = lookup.id;
      const [
        profile,
        friends,
        followers,
        following,
        avatar,
        badges,
        usernameHistory,
        presence,
        premiumMembership,
      ] = await Promise.all([
        fetchJson(`${ROBLOX_USERS_API}/users/${userId}`),
        fetchJson(`${ROBLOX_FRIENDS_API}/users/${userId}/friends/count`, {}, { optional: true }),
        fetchJson(`${ROBLOX_FRIENDS_API}/users/${userId}/followers/count`, {}, { optional: true }),
        fetchJson(`${ROBLOX_FRIENDS_API}/users/${userId}/followings/count`, {}, { optional: true }),
        fetchJson(
          `${ROBLOX_THUMBNAILS_API}/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`,
          {},
          { optional: true }
        ),
        fetchJson(`${ROBLOX_BADGES_API}/users/${userId}/roblox-badges`, {}, { optional: true }),
        fetchJson(`${ROBLOX_USERS_API}/users/${userId}/username-history?limit=10&sortOrder=Desc`, {}, { optional: true }),
        fetchJson(`${ROBLOX_PRESENCE_API}/presence/users`, {
          method: "POST",
          body: JSON.stringify({ userIds: [userId] }),
        }, { optional: true }),
        fetchJson(`${ROBLOX_PREMIUM_API}/users/${userId}/validate-membership`, {}, { optional: true }),
      ]);

      const avatarUrl = avatar?.data?.[0]?.imageUrl || null;
      const badgeNames = Array.isArray(badges)
        ? badges.map((badge) => badge?.name).filter(Boolean).slice(0, 10)
        : null;
      const previousUsernames = Array.isArray(usernameHistory?.data)
        ? usernameHistory.data
            .map((entry) => entry?.name || entry?.username)
            .filter(Boolean)
            .slice(0, 10)
        : null;
      const embedColor = Number.isFinite(config.embedColor) ? config.embedColor : 15548997;
      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(`${profile.displayName || profile.name}`)
        .setURL(`https://www.roblox.com/users/${profile.id}/profile`)
        .addFields(
          { name: "Username", value: profile.name || "Unknown", inline: true },
          { name: "Display Name", value: profile.displayName || "Unknown", inline: true },
          { name: "Premium", value: formatPremiumStatus(premiumMembership), inline: true },
          { name: "Bio", value: truncate(profile.description), inline: false },
          { name: "User ID", value: `\`${profile.id}\``, inline: true },
          { name: "Friends", value: formatCount(friends?.count), inline: true },
          { name: "Followers", value: formatCount(followers?.count), inline: true },
          { name: "Following", value: formatCount(following?.count), inline: true },
          {
            name: "Creation Date",
            value: formatCreated(profile.created),
            inline: true,
          },
          { name: "Status", value: formatPresence(presence), inline: true },
          { name: "Badges", value: formatList(badgeNames), inline: false },
          { name: "Previous Usernames", value: formatList(previousUsernames), inline: false }
        )
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      if (avatarUrl) {
        embed.setThumbnail(avatarUrl).setImage(avatarUrl);
      } else {
        embed.addFields({ name: "Avatar", value: "Not available", inline: false });
      }

      if (isInteraction) {
        return target.reply({ embeds: [embed], flags: 64 });
      }
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("roblox command failed:", error);
      const payload = {
        embeds: [buildErrorEmbed(config, "failed to fetch roblox user")],
      };
      if (isInteraction) {
        return target.reply({ ...payload, flags: 64 });
      }
      return message.reply(payload);
    }
  },
};
