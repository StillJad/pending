const { SlashCommandBuilder } = require("discord.js");

const STATUS_CHOICES = [
  { name: "Pending", value: "pending" },
  { name: "Paid", value: "paid" },
  { name: "In Progress", value: "in-progress" },
  { name: "Completed", value: "completed" },
];

module.exports = {
  name: "ticketstatus",
  description: "Set the status for the current ticket.",
  data: new SlashCommandBuilder()
    .setName("ticketstatus")
    .setDescription("Set the status for the current ticket")
    .addStringOption((option) =>
      option
        .setName("value")
        .setDescription("Ticket status")
        .setRequired(true)
        .addChoices(...STATUS_CHOICES)
    ),

  async execute(target, args = []) {
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

    const value = String(
      isInteraction ? target.options.getString("value") : args[0] || ""
    )
      .trim()
      .toLowerCase();

    if (!STATUS_CHOICES.some((choice) => choice.value === value)) {
      return isInteraction
        ? target.editReply({ content: "use pending, paid, in-progress, or completed" })
        : target.reply("use pending, paid, in-progress, or completed");
    }

    try {
      const linkedOrderId = target.client.getTicketOrderId(channel);
      await channel.setTopic(target.client.buildTicketTopic(channel, { status: value }));

      if (linkedOrderId) {
        await target.client.updateOrderById(linkedOrderId, { status: value });
      }

      await target.client.updateTicketEmbed(channel);

      if (value === "completed" && linkedOrderId) {
        try {
          const newName = `ticket-completed-${linkedOrderId}`.toLowerCase().slice(0, 100);
          if (channel.name !== newName) {
            await channel.setName(newName);
          }
        } catch (error) {
          console.error("ticketstatus rename failed:", error);
        }
      }

      if (value === "completed") {
        const completedCategoryId = process.env.DISCORD_COMPLETED_CATEGORY_ID;
        if (completedCategoryId) {
          try {
            await channel.setParent(completedCategoryId);
          } catch (error) {
            console.error("ticketstatus move failed:", error);
          }
        }
      }

      return isInteraction
        ? target.editReply({ content: `status set to ${value}` })
        : target.reply(`status set to ${value}`);
    } catch (error) {
      console.error("ticketstatus failed:", error);
      return isInteraction
        ? target.editReply({ content: "failed to update status" })
        : target.reply("failed to update status");
    }
  },
};
