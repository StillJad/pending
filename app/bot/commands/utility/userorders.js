const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "userorders",
  data: new SlashCommandBuilder()
    .setName("userorders")
    .setDescription("View a user's order history")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to check")
        .setRequired(false)
    ),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const targetUser = isInteraction
      ? target.options.getUser("user") || target.user
      : target.mentions.users.first() || target.author;

    const config = target.client.getConfig(target.guild);
    const entries = config.userOrderHistory?.[targetUser.id] || [];

    if (!entries.length) {
      if (isInteraction) {
        return target.reply({ content: `no order history for ${targetUser}`, flags: 64 });
      }
      return target.reply(`no order history for ${targetUser}`);
    }

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${targetUser.username}'s Orders`)
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    entries.slice(-10).reverse().forEach((entry, i) => {
      embed.addFields({
        name: `${i + 1}. ${entry.type?.toUpperCase() || "ORDER"} - ${entry.targetId}`,
        value: `Service: ${entry.service || "Unknown"}\nEmail: ${entry.email || "Unknown"}`,
        inline: false
      });
    });

    if (isInteraction) {
      return target.reply({ embeds: [embed], flags: 64 });
    }

    return target.reply({ embeds: [embed] });
  }
};
