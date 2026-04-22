const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "unban",
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user")
    .addStringOption(option =>
      option.setName("user_id")
        .setDescription("User ID to unban")
        .setRequired(true)
    ),

  async execute(target, args) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;
    const guild = isInteraction ? interaction.guild : message.guild;

    if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
      if (isInteraction) {
        return interaction.reply({ content: "no permission", flags: 64 });
      }
      return message.reply("no permission");
    }

    const userId = isInteraction
      ? interaction.options.getString("user_id")
      : args[0];

    if (!userId) {
      if (isInteraction) {
        return interaction.reply({ content: "provide a user id", flags: 64 });
      }
      return message.reply("provide a user id");
    }

    try {
      await guild.members.unban(userId);

      if (isInteraction) {
        return interaction.reply({ content: `unbanned ${userId}` });
      }

      return message.reply(`unbanned ${userId}`);
    } catch (err) {
      console.error("unban failed:", err);

      if (isInteraction) {
        return interaction.reply({ content: "failed to unban user", flags: 64 });
      }

      return message.reply("failed to unban user");
    }
  },
};
