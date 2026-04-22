const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "lock",
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock the channel"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;
    const channel = isInteraction ? interaction.channel : message.channel;
    const guild = isInteraction ? interaction.guild : message.guild;

    if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      if (isInteraction) {
        return interaction.reply({ content: "no permission", flags: 64 });
      }
      return message.reply("no permission");
    }

    await channel.permissionOverwrites.edit(guild.id, {
      SendMessages: false,
    });

    if (isInteraction) {
      return interaction.reply({ content: "🔒 channel locked", flags: 64 });
    }

    const replyMsg = await message.reply("🔒 channel locked");
    setTimeout(() => replyMsg.delete().catch(() => {}), 3000);
  },
};
