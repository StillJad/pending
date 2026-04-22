const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "membercount",
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Show server member count"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const guild = isInteraction ? interaction.guild : message.guild;
    const client = isInteraction ? interaction.client : message.client;

    const embed = new EmbedBuilder()
      .setColor(client.getConfig().embedColor)
      .setTitle("Member Count")
      .addFields(
        { name: "Server", value: guild.name, inline: true },
        { name: "Members", value: String(guild.memberCount), inline: true }
      )
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (isInteraction) {
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    return message.reply({ embeds: [embed] });
  },
};
