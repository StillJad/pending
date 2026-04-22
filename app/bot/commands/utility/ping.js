const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ping",
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const client = isInteraction ? interaction.client : message.client;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    const latency = isInteraction
      ? Date.now() - interaction.createdTimestamp
      : Date.now() - message.createdTimestamp;

    const embed = new EmbedBuilder()
      .setColor(client.getConfig().embedColor)
      .setTitle("Pong")
      .addFields(
        { name: "Bot Latency", value: `${latency}ms`, inline: true },
        { name: "API Latency", value: `${client.ws.ping}ms`, inline: true }
      )
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (isInteraction) {
      return interaction.editReply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
  },
};
