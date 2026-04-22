const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "welcomemessage",
  description: "Update the welcome message.",
  data: new SlashCommandBuilder()
    .setName("welcomemessage")
    .setDescription("Update the welcome message")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Message text. Use \\n for new lines.")
        .setRequired(true)
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

    const text = (
      isInteraction ? target.options.getString("text") : args.join(" ")
    ).trim();

    if (!text) {
      const helpText =
        "send a message. placeholders: {user} {username} {server} {membercount}. use \\n for line breaks";
      return isInteraction
        ? target.editReply({ content: helpText })
        : target.reply(helpText);
    }

    const parsedText = text.replaceAll("\\n", "\n").replaceAll("\\t", "\t");
    const config = target.client.getConfig(target.guild);
    config.welcomeMessage = parsedText;
    target.client.saveConfig(config, target.guild);

    return isInteraction
      ? target.editReply({ content: "welcome message updated. use \\n to create new lines" })
      : target.reply("welcome message updated. use \\n to create new lines");
  },
};
