const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const giveawaysPath = path.join(__dirname, "../../data/giveaways.json");

function getGiveaways() {
  if (!fs.existsSync(giveawaysPath)) return [];
  return JSON.parse(fs.readFileSync(giveawaysPath, "utf8"));
}

module.exports = {
  name: "gwinfo",
  description: "Show giveaway information.",
  data: new SlashCommandBuilder()
    .setName("gwinfo")
    .setDescription("Show giveaway information")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("Giveaway ID or message ID")
        .setRequired(true)
    ),
  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const message = isInteraction ? null : target;

    try {
      const id = isInteraction
        ? target.options.getString("id")
        : args[0];

      if (!id) {
        if (isInteraction) {
          return target.reply({ content: "provide a giveaway id", flags: 64 });
        }
        return message.reply("usage: ,gwinfo <giveawayId|messageId>");
      }

      const giveaways = getGiveaways();

      const giveaway = giveaways.find(
        (g) => g.giveawayId === id || g.messageId === id
      );

      if (!giveaway) {
        if (isInteraction) {
          return target.reply({ content: "invalid giveaway id", flags: 64 });
        }
        return message.reply("invalid giveaway id");
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("Giveaway Info")
        .addFields(
          { name: "Giveaway", value: `\`${giveaway.giveawayId || giveaway.messageId}\``, inline: true },
          { name: "Created by", value: giveaway.hostId ? `<@${giveaway.hostId}>` : "Unknown", inline: true },
          { name: "Status", value: giveaway.ended ? "Ended" : "Active", inline: true },
          { name: "Winner", value: giveaway.winner ? `<@${giveaway.winner}>` : "Not set", inline: true }
        )
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      if (isInteraction) {
        return target.reply({ embeds: [embed], flags: 64 });
      }
      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error("gwinfo failed:", err);
      if (isInteraction) {
        return target.reply({ content: "failed to fetch giveaway info", flags: 64 });
      }
      return message.reply("failed to fetch giveaway info");
    }
  },
};
