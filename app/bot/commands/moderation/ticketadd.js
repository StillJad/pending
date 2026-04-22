const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketadd",
  description: "Add a user to the current ticket.",
  data: new SlashCommandBuilder()
    .setName("ticketadd")
    .setDescription("Add a user to the current ticket")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to add").setRequired(true)
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
        ? target.editReply({ content: `${member} added to ticket` })
        : target.reply(`${member} added to ticket`);
    } catch (error) {
      console.error("ticketadd failed:", error);
      return isInteraction
        ? target.editReply({ content: "failed to add user to ticket" })
        : target.reply("failed to add user to ticket");
    }
  },
};
