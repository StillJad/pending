const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketunclaim",
  description: "Unclaim the current ticket.",
  data: new SlashCommandBuilder()
    .setName("ticketunclaim")
    .setDescription("Unclaim the current ticket"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const channel = target.channel;

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
      if (!target.client.getTicketClaimedId(channel)) {
        if (isInteraction) {
          return target.reply({ content: "ticket is not claimed", flags: 64 });
        }
        return target.reply("ticket is not claimed");
      }

      await channel.setTopic(target.client.buildTicketTopic(channel, { claimed: null }));
      await target.client.updateTicketEmbed(channel);

      await target.reply(
        isInteraction
          ? { content: "ticket unclaimed", flags: 64 }
          : "ticket unclaimed"
      );

      try {
        const actor = target.author || target.user;
        const orderId = target.client.getTicketOrderId(channel) || "unknown";
        await target.client.logTicketEvent(
          target.guild,
          `📤 Ticket unclaimed for order ${orderId} in #${channel.name} by ${actor.tag} (${actor.id})`
        );
      } catch (err) {
        console.error("ticketunclaim log failed:", err);
      }
    } catch (err) {
      console.error("ticketunclaim failed:", err);
      return target.reply("failed to unclaim ticket");
    }
  },
};
