const { EmbedBuilder } = require("discord.js");

function createEmbed(client, guildOrConfig, options = {}) {
  const config =
    guildOrConfig && guildOrConfig.embedColor !== undefined
      ? guildOrConfig
      : client?.getConfig
        ? client.getConfig(guildOrConfig)
        : { embedColor: 15548997 };
  const embedColor = Number.isFinite(config.embedColor) ? config.embedColor : 15548997;

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setFooter({ text: "Pending | pending.cc" })
    .setTimestamp();

  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);

  return embed;
}

module.exports = {
  createEmbed,
};
