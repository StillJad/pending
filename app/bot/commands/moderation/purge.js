const { SlashCommandBuilder } = require("discord.js");
const clearCommand = require("./clear");

module.exports = {
  name: "purge",
  description: "Delete messages.",
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete messages")
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("1-100").setRequired(true)
    ),

  async execute(target, args = []) {
    return clearCommand.execute(target, args);
  },
};
