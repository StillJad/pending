const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketclaim",
  description: "Claim a ticket.",
  data: new SlashCommandBuilder()
    .setName("ticketclaim")
    .setDescription("Claim the current ticket"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const channel = target.channel;
    const user = target.author || target.user;

    if (!channel || !channel.name.startsWith("ticket-")) {
      if (isInteraction) {
        return target.reply({ content: "not a ticket", flags: 64 });
      }
      return target.reply("not a ticket");
    }

    if (!target.client.isStaff(target.member, target.guild)) {
      if (isInteraction) {
        return target.reply({ content: "staff only", flags: 64 });
      }
      return target.reply("staff only");
    }

    try {
      await channel.setTopic(
        target.client.buildTicketTopic(channel, { claimed: user.id })
      );
      await target.client.updateTicketEmbed(channel);

      const replyMsg = await target.reply(
        isInteraction
          ? { content: `claimed by ${target.author || target.user}`, flags: 64 }
          : `claimed by ${target.author || target.user}`
      );
      if (!isInteraction) {
        setTimeout(() => replyMsg.delete().catch(() => {}), 3000);
      }
    } catch (e) {
      console.error("ticketclaim topic update failed:", e);
    }

    try {
      const orderId = target.client.getTicketOrderId(channel) || "unknown";
      await target.client.logTicketEvent(
        target.guild,
        `👤 Ticket claimed for order ${orderId} in #${channel.name} by ${user.tag} (${user.id})`
      );
    } catch (err) {
      console.error("ticketclaim log failed:", err);
    }
  },
};
