const { EmbedBuilder } = require("discord.js");
const database = require("../../lib/database");

module.exports = {
  name: "snipe",
  description: "Show the last deleted message in this channel.",

  async execute(message) {
    const sniped = database.getSnipedMessage(message.channel.id);
    if (!sniped) {
      return message.reply("nothing to snipe");
    }

    const config = message.client.getConfig(message.guild);
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle("Sniped Message")
      .addFields(
        {
          name: "Author",
          value: sniped.authorId === "Unknown" ? "Unknown" : `<@${sniped.authorId}>`,
          inline: true,
        },
        {
          name: "Deleted",
          value: sniped.deletedAt
            ? `<t:${Math.floor(Number(sniped.deletedAt) / 1000)}:R>`
            : "Unknown",
          inline: true,
        },
        {
          name: "Content",
          value: String(sniped.content || "[No content]").slice(0, 1024),
          inline: false,
        }
      )
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (Array.isArray(sniped.attachments) && sniped.attachments.length) {
      embed.addFields({
        name: "Attachments",
        value: sniped.attachments.join("\n").slice(0, 1024),
        inline: false,
      });
    }

    return message.reply({ embeds: [embed] });
  },
};
