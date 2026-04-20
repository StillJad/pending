const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "autorole",
  description: "Set autorole",

  slashData: new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("Set autorole")
    .addRoleOption(opt =>
      opt.setName("role").setDescription("role").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(target) {
    if (target.isChatInputCommand && target.isChatInputCommand()) {
      const role = target.options.getRole("role");
      const config = target.client.getConfig();
      config.autorole = role.id;
      target.client.saveConfig(config);
      return target.reply(`autorole set to ${role.name}`);
    }

    if (!target.member.permissions.has("Administrator"))
      return target.reply("no perms");

    const role = target.mentions.roles.first();
    if (!role) return target.reply("mention a role");

    const config = target.client.getConfig();
    config.autorole = role.id;
    target.client.saveConfig(config);

    target.reply(`autorole set to ${role.name}`);
  },
};