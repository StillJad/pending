const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "embed",
  description: "Send an embed",

  slashData: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Send an embed")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Embed content")
        .setRequired(true)
    ),

  async execute(target, args = []) {
    // SLASH
    if (target.isChatInputCommand && target.isChatInputCommand()) {
      const text = target.options.getString("text", true);

      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setDescription(text);

      await target.channel.send({ embeds: [embed] });
      return target.reply({ content: "sent", ephemeral: true });
    }

    // PREFIX
    const text = args.join(" ");
    if (!text) return;

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription(text);

    await target.channel.send({ embeds: [embed] });
    await target.delete().catch(() => {});
  },
};