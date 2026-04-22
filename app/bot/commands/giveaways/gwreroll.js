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

function buildWinnerEmbed(oldEmbed, winnerId) {
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
    .setFooter({ text: "Giveaway rerolled | Pending.cc" })
    .setTimestamp();
}

module.exports = {
  name: "gwreroll",
  description: "Reroll a giveaway winner.",
  data: new SlashCommandBuilder()
    .setName("gwreroll")
    .setDescription("Reroll a giveaway")
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
      return message.reply("use `,gwreroll <giveawayId|messageId>`");
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

      const previousWinnerId = getGiveawayWinnerId(giveaway);
      const newWinner = await pickRandomEntrant(
        giveawayMessage,
        previousWinnerId ? [previousWinnerId] : []
      );

      if (!newWinner) {
        if (isInteraction) {
          return interaction.editReply({ content: "no eligible users to reroll" });
        }
        return message.reply("no eligible users to reroll");
      }

      const oldEmbed = giveawayMessage.embeds[0];
      if (!oldEmbed) {
        throw new Error("giveaway embed missing");
      }

      const rerolledEmbed = buildWinnerEmbed(oldEmbed, newWinner.id);
      await giveawayMessage.edit({ embeds: [rerolledEmbed] });

      const target = giveaways.find(
        (item) =>
          item.giveawayId === giveaway.giveawayId &&
          String(item.messageId || "") === String(giveaway.messageId || "")
      );

      if (target) {
        target.winnerId = newWinner.id;
        target.winner = newWinner.id;
        target.winnerIds = [newWinner.id];
        target.rerolledAt = Date.now();
        target.ended = true;
        database.saveGiveaways(giveaways);
      }

      if (isInteraction) {
        return interaction.editReply({ content: "rerolled" });
      }

      return message.reply("rerolled");
    } catch (error) {
      console.error("gwreroll failed:", error);
      if (isInteraction) {
        return interaction.editReply({ content: "failed to reroll giveaway" });
      }
      return message.reply("failed to reroll giveaway");
    }
  },
};
