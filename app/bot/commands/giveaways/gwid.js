const { SlashCommandBuilder } = require("discord.js");
const database = require("../../lib/database");

module.exports = {
  name: "gwid",
  description: "Create a placeholder giveaway id.",
  data: new SlashCommandBuilder()
    .setName("gwid")
    .setDescription("Create a placeholder giveaway id"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const message = isInteraction ? null : target;
    const channel = isInteraction ? target.channel : message.channel;
    const guild = isInteraction ? target.guild : message.guild;
    const author = isInteraction ? target.user : message.author;

    try {
      const giveawayId = `GW-${Date.now().toString().slice(-6)}`;
      const giveaways = database.getGiveaways();

      giveaways.push({
        giveawayId,
        messageId: null,
        channelId: channel.id,
        guildId: guild?.id || null,
        ended: false,
        claimed: false,
        hostId: author.id,
        winner: null,
      });

      database.saveGiveaways(giveaways);
      if (isInteraction) {
        return target.reply({ content: `giveaway created: \`${giveawayId}\``, flags: 64 });
      }
      return message.reply(`giveaway created: \`${giveawayId}\``);
    } catch (error) {
      console.error("gwid failed:", error);
      if (isInteraction) {
        return target.reply({ content: "failed to create giveaway id", flags: 64 });
      }
      return message.reply("failed to create giveaway id");
    }
  },
};
