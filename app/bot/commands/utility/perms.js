const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "perms",
  data: new SlashCommandBuilder()
    .setName("perms")
    .setDescription("Show a user's permissions")
    .addUserOption(option =>
      option.setName("user").setDescription("User").setRequired(false)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const guild = isInteraction ? interaction.guild : message.guild;
    const client = isInteraction ? interaction.client : message.client;

    let user;
    if (isInteraction) {
      user = interaction.options.getUser("user") || interaction.user;
    } else {
      user = message.mentions.users.first() || message.author;
    }

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      if (isInteraction) return interaction.reply({ content: "user not found", flags: 64 });
      return message.reply("user not found");
    }

    const perms = member.permissions.toArray();
    const shown = perms.length ? perms.join(", ") : "none";

    const embed = new EmbedBuilder()
      .setColor(client.getConfig().embedColor)
      .setTitle("Permissions")
      .addFields(
        { name: "User", value: `${user}`, inline: true },
        { name: "Has Admin", value: member.permissions.has(PermissionFlagsBits.Administrator) ? "Yes" : "No", inline: true },
        { name: "Permissions", value: shown.slice(0, 1024), inline: false }
      )
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (isInteraction) {
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    return message.reply({ embeds: [embed] });
  },
};
