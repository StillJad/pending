const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const database = require("../../lib/database");
const {
  findGiveawayByLookup,
  fetchGiveawayMessage,
  pickRandomEntrant,
  getGiveawayWinnerId,
} = require("../../lib/giveaways");

function isStaff(member, client, guild) {
  if (typeof client?.isStaff === "function") {
    return client.isStaff(member, guild);
  }

  return member.permissions?.has(PermissionFlagsBits.Administrator) || false;
}

function buildEndedEmbed(oldEmbed, winnerId) {
  const baseTitle = (oldEmbed.title || "🎉 Giveaway")
    .replace(/\s*\(ENDED\)$/i, "")
    .replace(/\s*\(REROLLED\)$/i, "");

  const fields = [...(oldEmbed.fields || [])].filter(
    (field) => field.name !== "Winner" && field.name !== "Winner(s)"
  );

  fields.push({
    name: "Winner",
    value: winnerId ? `<@${winnerId}>` : "No valid entries",
    inline: false,
  });

  return EmbedBuilder.from(oldEmbed)
    .setTitle(`${baseTitle} (ENDED)`)
    .setFields(fields)
    .setFooter({ text: "Giveaway ended | Pending.cc" })
    .setTimestamp();
}

module.exports = {
  name: "gwend",
  description: "End an active giveaway.",
  data: new SlashCommandBuilder()
    .setName("gwend")
    .setDescription("End a giveaway")
    .addStringOption((option) =>
      option
        .setName("giveaway_id")
        .setDescription("Giveaway ID or message ID")
        .setRequired(true)
    ),

  async execute(ctx, args = []) {
    const isInteraction = !!ctx.isChatInputCommand;
    const interaction = isInteraction ? ctx : null;
    const message = isInteraction ? null : ctx;
    const member = isInteraction ? interaction.member : message.member;
    const guild = isInteraction ? interaction.guild : message.guild;
    const client = isInteraction ? interaction.client : message.client;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    if (!isStaff(member, client, guild)) {
      if (isInteraction) {
        return interaction.editReply({ content: "staff only" });
      }
      return message.reply("staff only");
    }

    const input = isInteraction
      ? interaction.options.getString("giveaway_id")
      : args[0];

    if (!input) {
      if (isInteraction) {
        return interaction.editReply({ content: "provide a giveaway id" });
      }
      return message.reply("use `,gwend <giveawayId|messageId>`");
    }

    const giveaways = database.getGiveaways();
    const giveaway = findGiveawayByLookup(input);

    if (!giveaway) {
      if (isInteraction) {
        return interaction.editReply({ content: "giveaway not found" });
      }
      return message.reply("giveaway not found");
    }

    try {
      const giveawayMessage = await fetchGiveawayMessage(guild, giveaway);
      if (!giveawayMessage) {
        if (isInteraction) {
          return interaction.editReply({ content: "giveaway message not found" });
        }
        return message.reply("giveaway message not found");
      }

      let winnerId = getGiveawayWinnerId(giveaway);
      if (!winnerId) {
        const winnerUser = await pickRandomEntrant(giveawayMessage);
        winnerId = winnerUser?.id || null;
      }

      const oldEmbed = giveawayMessage.embeds[0];
      if (!oldEmbed) {
        throw new Error("giveaway embed missing");
      }

      const endedEmbed = buildEndedEmbed(oldEmbed, winnerId);
      await giveawayMessage.edit({ embeds: [endedEmbed] });

      const target = giveaways.find(
        (item) =>
          item.giveawayId === giveaway.giveawayId &&
          String(item.messageId || "") === String(giveaway.messageId || "")
      );

      if (target) {
        target.ended = true;
        target.endedAt = Date.now();
        target.winnerId = winnerId;
        target.winner = winnerId;
        target.winnerIds = winnerId ? [winnerId] : [];
        database.saveGiveaways(giveaways);
      }

      const content = `giveaway ended${winnerId ? ` | winner: <@${winnerId}>` : ""}`;
      if (isInteraction) {
        return interaction.editReply({ content });
      }

      return message.reply(content);
    } catch (error) {
      console.error("gwend failed:", error);
      if (isInteraction) {
        return interaction.editReply({ content: "failed to end giveaway" });
      }
      return message.reply("failed to end giveaway");
    }
  },
};
