const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "steal",
  data: new SlashCommandBuilder()
    .setName("steal")
    .setDescription("Steal an emoji from a message link")
    .addStringOption(option =>
      option.setName("source_message_link").setDescription("Discord message link").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("emoji_name").setDescription("New emoji name").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;
    const guild = isInteraction ? interaction.guild : message.guild;

    if (!member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
      if (isInteraction) {
        return interaction.reply({ content: "no permission", flags: 64 });
      }
      return message.reply("no permission");
    }

    const link = isInteraction
      ? interaction.options.getString("source_message_link")
      : args[0];

    const emojiName = isInteraction
      ? interaction.options.getString("emoji_name")
      : args[1];

    if (!link || !emojiName) {
      if (isInteraction) {
        return interaction.reply({ content: "invalid usage", flags: 64 });
      }
      return message.reply("use ,steal <message_link> <emoji_name>");
    }

    const emojiMatch = link.match(/https?:\/\/cdn\.discordapp\.com\/emojis\/(\d+)\.(png|gif|webp)/i);
    if (!emojiMatch) {
      if (isInteraction) {
        return interaction.reply({ content: "only direct emoji CDN links are supported", flags: 64 });
      }
      return message.reply("only direct emoji CDN links are supported");
    }

    const emojiUrl = emojiMatch[0];

    try {
      const emoji = await guild.emojis.create({
        attachment: emojiUrl,
        name: emojiName,
      });

      const text = `emoji created: ${emoji}`;

      if (isInteraction) {
        return interaction.reply({ content: text, flags: 64 });
      }

      return message.reply(text);
    } catch (error) {
      console.error("steal failed:", error);
      if (isInteraction) {
        return interaction.reply({ content: "failed to create emoji", flags: 64 });
      }
      return message.reply("failed to create emoji");
    }
  },
};
