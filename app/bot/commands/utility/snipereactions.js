const { EmbedBuilder } = require("discord.js");
const database = require("../../lib/database");

module.exports = {
  name: "snipereactions",
  description: "Show the last removed reaction in this channel.",

  async execute(message) {
    const sniped = database.getSnipedReaction(message.channel.id);
    if (!sniped) {
      return message.reply("no reactions to snipe");
    }

    const config = message.client.getConfig(message.guild);
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle("Sniped Reaction")
      .addFields(
        {
          name: "Reaction",
          value: String(sniped.emoji || "Unknown"),
          inline: true,
        },
        {
          name: "Removed By",
          value: sniped.userId ? `<@${sniped.userId}>` : "Unknown",
          inline: true,
        },
        {
          name: "Message Author",
          value: sniped.authorId === "Unknown" ? "Unknown" : `<@${sniped.authorId}>`,
          inline: true,
        },
        {
          name: "Message",
          value: String(sniped.messageContent || "[No content]").slice(0, 1024),
          inline: false,
        },
        {
          name: "Removed",
          value: sniped.removedAt
            ? `<t:${Math.floor(Number(sniped.removedAt) / 1000)}:R>`
            : "Unknown",
          inline: true,
        }
      )
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};
