const { SlashCommandBuilder } = require("discord.js");

const REPLY_TEXT = "fm command not configured yet";

module.exports = {
  name: "fm",
  description: "Placeholder fm command.",
  data: new SlashCommandBuilder()
    .setName("fm")
    .setDescription("Placeholder fm command"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;

    if (isInteraction) {
      return target.reply({ content: REPLY_TEXT, flags: 64 });
    }

    return target.reply(REPLY_TEXT);
  },
};
