const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketclose",
  description: "Close the current ticket.",
  data: new SlashCommandBuilder()
    .setName("ticketclose")
    .setDescription("Close the current ticket"),

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

    const linkedOrderId = target.client.getTicketOrderId(channel);

    try {
      if (linkedOrderId) {
        try {
          await target.client.updateOrderById(linkedOrderId, { status: "closed" });
        } catch (error) {
          console.error("ticketclose order update failed:", error);
        }
      }

      if (isInteraction) {
        await target.editReply({ content: "closing ticket..." });
      } else {
        await target.reply("closing ticket...");
      }

      setTimeout(() => {
        channel.delete().catch((error) => {
          console.error("ticketclose failed:", error);
        });
      }, 1500);
    } catch (error) {
      console.error("ticketclose failed:", error);
      return isInteraction
        ? target.editReply({ content: "failed to close ticket" })
        : target.reply("failed to close ticket");
    }

    return null;
  },
};
