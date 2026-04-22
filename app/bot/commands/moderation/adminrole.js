const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "adminrole",
  description: "Set the admin/staff role.",
  data: new SlashCommandBuilder()
    .setName("adminrole")
    .setDescription("Set the admin/staff role")
    .addRoleOption((option) =>
      option.setName("role").setDescription("Role to use for staff checks").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;

    if (isInteraction) {
      await target.deferReply({ flags: 64 });
    }

    if (!target.client.isStaff(target.member, target.guild)) {
      return isInteraction
        ? target.editReply({ content: "staff only" })
        : target.reply("staff only");
    }

    const role = isInteraction
      ? target.options.getRole("role")
      : target.mentions.roles.first();

    if (!role) {
      return isInteraction
        ? target.editReply({ content: "mention a role" })
        : target.reply("mention a role");
    }

    const config = target.client.getConfig(target.guild);
    config.adminRoleId = role.id;
    target.client.saveConfig(config, target.guild);

    return isInteraction
      ? target.editReply({ content: `admin role set to ${role}` })
      : target.reply(`admin role set to ${role}`);
  },
};
