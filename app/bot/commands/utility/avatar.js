const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "avatar",
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("View a user's avatar")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to view")
        .setRequired(false)
    ),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const client = isInteraction ? interaction.client : message.client;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    const user = isInteraction
      ? interaction.options.getUser("user") || interaction.user
      : message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setColor(client.getConfig().embedColor)
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 1024, extension: "png" }))
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (isInteraction) {
      return interaction.editReply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
  },
};
