const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

function formatDate(timestamp) {
  if (!timestamp) return "N/A";

  return new Date(timestamp).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getKeyPermissions(member) {
  if (!member) return "None";

  const permissionMap = [
    [PermissionFlagsBits.Administrator, "Administrator"],
    [PermissionFlagsBits.ManageGuild, "Manage Server"],
    [PermissionFlagsBits.ManageRoles, "Manage Roles"],
    [PermissionFlagsBits.ManageChannels, "Manage Channels"],
    [PermissionFlagsBits.ManageMessages, "Manage Messages"],
    [PermissionFlagsBits.ManageWebhooks, "Manage Webhooks"],
    [PermissionFlagsBits.ManageNicknames, "Manage Nicknames"],
    [PermissionFlagsBits.ManageGuildExpressions, "Manage Emojis and Stickers"],
    [PermissionFlagsBits.KickMembers, "Kick Members"],
    [PermissionFlagsBits.BanMembers, "Ban Members"],
    [PermissionFlagsBits.MentionEveryone, "Mention Everyone"],
    [PermissionFlagsBits.ModerateMembers, "Timeout Members"],
  ];

  const perms = permissionMap
    .filter(([flag]) => member.permissions.has(flag))
    .map(([, label]) => label);

  return perms.length ? perms.join(", ") : "None";
}

function getAcknowledgements(member, guild) {
  if (!member || !guild) return "None";

  const acknowledgements = [];

  if (guild.ownerId === member.id) {
    acknowledgements.push("Server Owner");
  }

  return acknowledgements.length ? acknowledgements.join(", ") : "None";
}

module.exports = {
  name: "userinfo",
  description: "Get detailed user info",

  slashData: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get info about a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to check")
        .setRequired(false)
    ),

  async execute(target) {
    const isSlash = target.isChatInputCommand && target.isChatInputCommand();

    if (isSlash) {
      await target.deferReply();
    }

    const user = isSlash
      ? target.options.getUser("user") || target.user
      : target.mentions.users.first() || target.author;

    const member = target.guild?.members?.cache.get(user.id) || null;
    const fullUser = await user.fetch(true);

    const roles = member
      ? member.roles.cache
          .filter((r) => r.id !== target.guild.id)
          .map((r) => r.toString())
      : [];

    const rolesText = roles.length ? roles.join(" ").slice(0, 1024) : "None";
    const keyPermissions = getKeyPermissions(member).slice(0, 1024);
    const acknowledgements = getAcknowledgements(member, target.guild);

    const embed = new EmbedBuilder()
      .setColor(fullUser.accentColor || 0x2f3136)
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL({ dynamic: true, size: 512 }),
      })
      .setDescription(`${user}`)
      .addFields(
        { name: "Joined", value: formatDate(member?.joinedTimestamp), inline: false },
        { name: "Registered", value: formatDate(user.createdTimestamp), inline: false },
        { name: `Roles [${roles.length}]`, value: rolesText, inline: false },
        { name: "Key Permissions", value: keyPermissions || "None", inline: false },
        { name: "Acknowledgements", value: acknowledgements, inline: false }
      )
      .setFooter({
        text: `ID: ${user.id}`,
        iconURL: user.displayAvatarURL({ dynamic: true, size: 128 }),
      })
      .setTimestamp();

    if (fullUser.bio) {
      embed.addFields({ name: "Bio", value: fullUser.bio.slice(0, 1024), inline: false });
    }

    if (fullUser.banner) {
      embed.setImage(fullUser.bannerURL({ dynamic: true, size: 1024 }));
    } else {
      embed.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }));
    }

    if (isSlash) {
      return target.editReply({ embeds: [embed] });
    }

    return target.reply({ embeds: [embed] });
  },
};