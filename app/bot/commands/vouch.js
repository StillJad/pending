const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "vouch",
  description: "Submit a vouch",

  slashData: new SlashCommandBuilder()
    .setName("vouch")
    .setDescription("Submit a vouch"),

  async execute() {
    // handled in index.js interactionCreate
  },
};