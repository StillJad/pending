const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "say",
  description: "Make the bot say something",

  slashData: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Make the bot say something")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("What the bot should say")
        .setRequired(true)
    ),

  async execute(target, args = []) {
    if (target.isChatInputCommand && target.isChatInputCommand()) {
      const text = target.options.getString("text", true);
      await target.channel.send(text);
      return target.reply({ content: "sent", ephemeral: true });
    }

    const text = args.join(" ");
    if (!text) return;

    await target.channel.send(text);
    await target.delete().catch(() => {});
  },
};