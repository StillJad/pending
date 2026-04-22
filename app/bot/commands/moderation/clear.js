const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "clear",
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete messages")
    .addIntegerOption(option =>
      option.setName("amount").setDescription("1-100").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;
    const channel = isInteraction ? interaction.channel : message.channel;

    if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      if (isInteraction) {
        return interaction.reply({ content: "no permission", flags: 64 });
      }
      return message.reply("no permission");
    }

    const amount = isInteraction
      ? interaction.options.getInteger("amount")
      : parseInt(args[0], 10);

    if (!amount || amount < 1 || amount > 100) {
      if (isInteraction) {
        return interaction.reply({ content: "give number 1-100", flags: 64 });
      }
      return message.reply("give number 1-100");
    }

    try {
      if (isInteraction) {
        await interaction.deferReply({ flags: 64 });
      }

      await channel.bulkDelete(amount, true).catch(() => {});

      if (isInteraction) {
        return interaction.editReply({ content: `deleted ${amount}` });
      }

      const replyMsg = await message.channel.send(`deleted ${amount}`);
      setTimeout(() => replyMsg.delete().catch(() => {}), 2000);
    } catch (error) {
      console.error("clear failed:", error);
      if (isInteraction) {
        return interaction.editReply({ content: "failed to clear messages" });
      }
      return message.reply("failed to clear messages");
    }
  },
};
