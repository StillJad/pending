const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const database = require("../../lib/database");

function parseDuration(input) {
  if (!input) return null;
  const match = String(input).toLowerCase().match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const value = Number(match[1]);
  const unit = match[2];
  const map = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * map[unit];
}

function isStaff(member, client, guild) {
  if (typeof client?.isStaff === "function") {
    return client.isStaff(member, guild);
  }

  return member.permissions?.has(PermissionFlagsBits.Administrator) || false;
}

async function logAction(guild, client, text) {
  try {
    const config = client.getConfig ? client.getConfig(guild) : {};
    if (!config.logChannelId) return;

    const channel =
      guild.channels.cache.get(config.logChannelId) ||
      (await guild.channels.fetch(config.logChannelId).catch(() => null));

    if (!channel || !channel.isTextBased()) return;
    await channel.send(text);
  } catch (error) {
    console.error("gwstart log failed:", error);
  }
}

function buildEmbed({
  prize,
  description,
  winners,
  extraEntries,
  hostTag,
  endsAt,
  ended = false,
  winnerText = null,
}) {
  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle(ended ? "🎉 Giveaway Ended" : "🎉 Giveaway")
    .setDescription(description || "No description provided.")
    .addFields(
      { name: "Prize", value: prize, inline: false },
      { name: "Winners", value: String(winners), inline: true },
      { name: "Hosted by", value: hostTag, inline: true },
      {
        name: "Ends",
        value: ended ? "Ended" : `<t:${Math.floor(endsAt / 1000)}:R>`,
        inline: true,
      }
    )
    .setFooter({ text: "React with 🎉 to enter | Pending.cc" })
    .setTimestamp();

  if (extraEntries) {
    embed.addFields({
      name: "Extra Entries",
      value: extraEntries,
      inline: false,
    });
  }

  if (winnerText) {
    embed.addFields({
      name: "Winner(s)",
      value: winnerText,
      inline: false,
    });
  }

  return embed;
}

module.exports = {
  name: "gwstart",
  description: "Start a giveaway.",
  data: new SlashCommandBuilder()
    .setName("gwstart")
    .setDescription("Start a giveaway")
    .addStringOption((option) =>
      option.setName("prize").setDescription("Prize").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration like 10m, 2h, 1d")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("Number of winners")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Giveaway description")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("extra_entries")
        .setDescription("Extra entry info text")
        .setRequired(false)
    ),

  async execute(ctx, args = []) {
    const isInteraction = !!ctx.isChatInputCommand;
    const message = isInteraction ? null : ctx;
    const interaction = isInteraction ? ctx : null;
    const member = isInteraction ? interaction.member : message.member;
    const channel = isInteraction ? interaction.channel : message.channel;
    const guild = isInteraction ? interaction.guild : message.guild;
    const client = isInteraction ? interaction.client : message.client;

    if (!isStaff(member, client, guild)) {
      if (isInteraction) {
        return interaction.reply({ content: "staff only", flags: 64 });
      }
      return message.reply("<:remake:1495128909132595240> staff only");
    }

    let prize;
    let durationInput;
    let winners;
    let description = "";
    let extraEntries = "";

    if (isInteraction) {
      prize = interaction.options.getString("prize");
      durationInput = interaction.options.getString("duration");
      winners = interaction.options.getInteger("winners");
      description = interaction.options.getString("description") || "";
      extraEntries = interaction.options.getString("extra_entries") || "";
    } else {
      const joined = args.join(" ");
      const winnersMatch = joined.match(/(?:^|\s)winners:(\d+)/i);
      const durationMatch = joined.match(/(?:^|\s)duration:([^\s]+)/i);
      const prizeMatch = joined.match(/(?:^|\s)prize:(.*?)(?=\s+\w+:|$)/i);
      const descriptionMatch = joined.match(/(?:^|\s)description:(.*?)(?=\s+\w+:|$)/i);
      const extraEntriesMatch = joined.match(/(?:^|\s)extra_entries:(.*?)(?=\s+\w+:|$)/i);

      prize = prizeMatch?.[1]?.trim();
      durationInput = durationMatch?.[1]?.trim();
      winners = Number(winnersMatch?.[1] || 1);
      description = descriptionMatch?.[1]?.trim() || "";
      extraEntries = extraEntriesMatch?.[1]?.trim() || "";
    }

    if (!prize || !durationInput || !winners || winners < 1) {
      const usage =
        "use `,gwstart prize:<prize> duration:<10m|2h|1d> winners:<number> description:<text> extra_entries:<text>`";
      if (isInteraction) {
        return interaction.reply({ content: usage, flags: 64 });
      }
      return message.reply(usage);
    }

    const durationMs = parseDuration(durationInput);
    if (!durationMs) {
      const text = "invalid duration. use stuff like 30m, 2h, 1d";
      if (isInteraction) {
        return interaction.reply({ content: text, flags: 64 });
      }
      return message.reply(text);
    }

    const endsAt = Date.now() + durationMs;
    const giveawayId = `GW-${Date.now().toString().slice(-6)}`;
    const embed = buildEmbed({
      prize,
      description,
      winners,
      extraEntries,
      hostTag: isInteraction ? interaction.user.tag : message.author.tag,
      endsAt,
    });

    const msg = await channel.send({ embeds: [embed] });
    await msg.react("🎉").catch(() => {});

    const giveaways = database.getGiveaways();
    giveaways.push({
      giveawayId,
      messageId: msg.id,
      channelId: msg.channel.id,
      guildId: guild.id,
      prize,
      winners,
      description,
      extraEntries,
      endsAt,
      ended: false,
      hostId: isInteraction ? interaction.user.id : message.author.id,
    });
    database.saveGiveaways(giveaways);

    await logAction(
      guild,
      client,
      `🎉 Giveaway started by ${(isInteraction ? interaction.user : message.author).tag} in ${channel} | Prize: ${prize} | Winners: ${winners} | Message ID: ${msg.id}`
    );

    const replyText = `giveaway started: ${msg.url} | ID: \`${giveawayId}\``;

    if (isInteraction) {
      return interaction.reply({ content: replyText, flags: 64 });
    }

    return message.reply(replyText);
  },
};
