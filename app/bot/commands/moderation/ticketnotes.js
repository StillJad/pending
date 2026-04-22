const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketnotes",
  description: "Save an internal note on the current ticket.",
  data: new SlashCommandBuilder()
    .setName("ticketnotes")
    .setDescription("Save an internal note on the current ticket")
    .addStringOption((option) =>
      option.setName("note").setDescription("Note to save").setRequired(true)
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

    const note = String(
      isInteraction ? target.options.getString("note") : args.join(" ")
    ).trim();

    if (!note) {
      return isInteraction
        ? target.editReply({ content: "write a note" })
        : target.reply("write a note");
    }

    try {
      await channel.setTopic(target.client.buildTicketTopic(channel, { notes: note }));
      return isInteraction
        ? target.editReply({ content: "ticket note saved" })
        : target.reply("ticket note saved");
    } catch (error) {
      console.error("ticketnotes failed:", error);
      return isInteraction
        ? target.editReply({ content: "failed to save ticket note" })
        : target.reply("failed to save ticket note");
    }
  },
};
