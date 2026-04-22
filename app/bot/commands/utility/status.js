const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "status",
  description: "Set a simple status message.",
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Set a simple status message")
    .addStringOption((option) =>
      option.setName("value").setDescription("Status value").setRequired(true)
    ),
  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const status = isInteraction ? target.options.getString("value") : args[0];
    if (!status) {
      if (isInteraction) {
        return target.reply({ content: "give status", flags: 64 });
      }
      return target.reply("give status");
    }

    if (isInteraction) {
      return target.reply({ content: `status set to ${status}`, flags: 64 });
    }
    return target.reply(`status set to ${status}`);
  },
};
