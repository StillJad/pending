const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "proof",
  description: "Submit seller proof",

  slashData: new SlashCommandBuilder()
    .setName("proof")
    .setDescription("Submit seller proof"),

  async execute() {
    // handled in index.js interactionCreate
  },
};