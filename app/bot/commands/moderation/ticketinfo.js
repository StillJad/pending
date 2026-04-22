const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketinfo",
  description: "Show ticket details.",
  data: new SlashCommandBuilder()
    .setName("ticketinfo")
    .setDescription("Show details for the current ticket"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const channel = target.channel;

    if (!channel || !channel.name.startsWith("ticket-")) {
      if (isInteraction) {
        return target.reply({ content: "not a ticket", flags: 64 });
      }
      return target.reply("not a ticket");
    }

    const claimedId = target.client.getTicketClaimedId(channel);
    const status = target.client.getTicketStatus(channel) || "pending";
    const orderId = target.client.getTicketOrderId(channel) || "none";
    const content = `ticket: ${channel.name}\nid: ${channel.id}\norder: ${orderId}\nclaimed: ${claimedId ? `<@${claimedId}>` : "none"}\nstatus: ${status}\ncreated: <t:${Math.floor(channel.createdTimestamp / 1000)}:F>`;

    if (isInteraction) {
      return target.reply({ content, flags: 64 });
    }

    return target.reply(content);
  },
};
