const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketrequestclose",
  description: "Request for the current ticket to be closed.",
  data: new SlashCommandBuilder()
    .setName("ticketrequestclose")
    .setDescription("Request for the current ticket to be closed"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const channel = target.channel;

    if (!channel?.name.startsWith("ticket-")) {
      return isInteraction
        ? target.reply({ content: "not a ticket", flags: 64 })
        : target.reply("not a ticket");
    }

    const sellersRoleId = process.env.DISCORD_SELLERS_ROLE_ID || "";
    const sellersMention = sellersRoleId ? `<@&${sellersRoleId}> ` : "";
    const actor = target.author || target.user;

    try {
      await channel.send(`${sellersMention}${actor} requested this ticket to be closed.`);
      return isInteraction
        ? target.reply({ content: "close request sent", flags: 64 })
        : target.reply("close request sent");
    } catch (error) {
      console.error("ticketrequestclose failed:", error);
      return isInteraction
        ? target.reply({ content: "failed to request close", flags: 64 })
        : target.reply("failed to request close");
    }
  },
};
