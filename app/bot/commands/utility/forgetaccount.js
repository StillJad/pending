const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "forgetaccount",
  description: "Remove a delivered account identity from storage.",
  data: new SlashCommandBuilder()
    .setName("forgetaccount")
    .setDescription("Remove a delivered account identity from storage")
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription("Email or identity to forget")
        .setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const identity = String(
      isInteraction ? target.options.getString("email") : args[0] || ""
    )
      .trim()
      .toLowerCase();

    if (!identity) {
      return isInteraction
        ? target.reply({ content: "use ,forgetaccount <email>", flags: 64 })
        : target.reply("use ,forgetaccount <email>");
    }

    const config = target.client.getConfig(target.guild);
    if (!Array.isArray(config.usedDeliveryIdentities)) {
      config.usedDeliveryIdentities = [];
    }

    const before = config.usedDeliveryIdentities.length;
    config.usedDeliveryIdentities = config.usedDeliveryIdentities.filter((item) => item !== identity);
    target.client.saveConfig(config, target.guild);

    if (config.usedDeliveryIdentities.length === before) {
      return isInteraction
        ? target.reply({ content: "that account was not stored", flags: 64 })
        : target.reply("that account was not stored");
    }

    return isInteraction
      ? target.reply({ content: `forgot ${identity}`, flags: 64 })
      : target.reply(`forgot ${identity}`);
  },
};
