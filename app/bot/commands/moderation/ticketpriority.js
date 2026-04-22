const { SlashCommandBuilder } = require("discord.js");

const PRIORITY_CHOICES = [
  { name: "Low", value: "low" },
  { name: "Medium", value: "medium" },
  { name: "High", value: "high" },
];

module.exports = {
  name: "ticketpriority",
  description: "Set the priority for the current ticket.",
  data: new SlashCommandBuilder()
    .setName("ticketpriority")
    .setDescription("Set the priority for the current ticket")
    .addStringOption((option) =>
      option
        .setName("level")
        .setDescription("Priority level")
        .setRequired(true)
        .addChoices(...PRIORITY_CHOICES)
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

    const level = String(
      isInteraction ? target.options.getString("level") : args[0] || ""
    )
      .trim()
      .toLowerCase();

    if (!PRIORITY_CHOICES.some((choice) => choice.value === level)) {
      return isInteraction
        ? target.editReply({ content: "use low, medium, or high" })
        : target.reply("use low, medium, or high");
    }

    try {
      await channel.setTopic(target.client.buildTicketTopic(channel, { priority: level }));
      return isInteraction
        ? target.editReply({ content: `priority set to ${level}` })
        : target.reply(`priority set to ${level}`);
    } catch (error) {
      console.error("ticketpriority failed:", error);
      return isInteraction
        ? target.editReply({ content: "failed to update priority" })
        : target.reply("failed to update priority");
    }
  },
};
