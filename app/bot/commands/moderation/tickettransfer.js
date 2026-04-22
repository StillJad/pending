const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "tickettransfer",
  description: "Give another user access to the current ticket.",
  data: new SlashCommandBuilder()
    .setName("tickettransfer")
    .setDescription("Give another user access to the current ticket")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to transfer to").setRequired(true)
    ),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const channel = target.channel;

    if (isInteraction) {
      await target.deferReply({ flags: 64 });
    }

    if (!target.client.isStaff(target.member, target.guild)) {
      return isInteraction
        ? target.editReply({ content: "staff only" })
        : target.reply("staff only");
    }

    if (!channel?.name.startsWith("ticket-")) {
      return isInteraction
        ? target.editReply({ content: "not a ticket" })
        : target.reply("not a ticket");
    }

    const member = isInteraction
      ? await target.guild.members.fetch(target.options.getUser("user").id).catch(() => null)
      : target.mentions.members.first();

    if (!member) {
      return isInteraction
        ? target.editReply({ content: "mention a user" })
        : target.reply("mention a user");
    }

    try {
      await channel.permissionOverwrites.edit(member.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      return isInteraction
        ? target.editReply({ content: `ticket transferred to ${member}` })
        : target.reply(`ticket transferred to ${member}`);
    } catch (error) {
      console.error("tickettransfer failed:", error);
      return isInteraction
        ? target.editReply({ content: "failed to transfer ticket" })
        : target.reply("failed to transfer ticket");
    }
  },
};
