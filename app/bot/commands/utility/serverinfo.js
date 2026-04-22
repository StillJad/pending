const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "serverinfo",
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("View server information"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const guild = isInteraction ? interaction.guild : message.guild;
    const client = isInteraction ? interaction.client : message.client;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    const embed = new EmbedBuilder()
      .setColor(client.getConfig().embedColor)
      .setTitle(guild.name)
      .addFields(
        { name: "Guild Name", value: guild.name, inline: true },
        { name: "Guild ID", value: guild.id, inline: true },
        { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
        { name: "Member Count", value: String(guild.memberCount), inline: true },
        {
          name: "Created",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
          inline: true,
        }
      )
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (guild.iconURL()) {
      embed.setThumbnail(guild.iconURL({ size: 512 }));
    }

    if (isInteraction) {
      return interaction.editReply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
  },
};
