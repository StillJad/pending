const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketremove",
  description: "Remove a user from the current ticket.",
  data: new SlashCommandBuilder()
    .setName("ticketremove")
    .setDescription("Remove a user from the current ticket")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to remove").setRequired(true)
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
      await channel.permissionOverwrites.delete(member.id);

      return isInteraction
        ? target.editReply({ content: `${member} removed from ticket` })
        : target.reply(`${member} removed from ticket`);
    } catch (error) {
      console.error("ticketremove failed:", error);
      return isInteraction
        ? target.editReply({ content: "failed to remove user from ticket" })
        : target.reply("failed to remove user from ticket");
    }
  },
};
