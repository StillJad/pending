const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "removeautorole",
  description: "Remove the configured autorole.",
  data: new SlashCommandBuilder()
    .setName("removeautorole")
    .setDescription("Remove the configured autorole")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const guild = target.guild || target.message?.guild || null;
    const config = target.client.getConfig(guild);
    config.autorole = null;
    target.client.saveConfig(config, guild);

    if (isInteraction) {
      return target.reply({ content: "autorole removed", flags: 64 });
    }

    if (target.reply) {
      return target.reply("autorole removed");
    }

    target.channel.send("autorole removed");
  },
};
