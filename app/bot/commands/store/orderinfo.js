const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function getLinkedAccountText(config, orderId) {
  const linkedEntries = Object.values(config.userOrderHistory || {})
    .flat()
    .filter((entry) => entry.targetId === orderId);

  if (!linkedEntries.length) {
    return "none";
  }

  return linkedEntries
    .map(
      (entry) =>
        `Service: ${entry.service || "Unknown"} | Email: ${entry.email || "Unknown"} | Claimed by: ${entry.claimedBy || "Unclaimed"} | Delivered by: ${entry.deliveredBy || "Not delivered"}`
    )
    .join("\n")
    .slice(0, 1024);
}

module.exports = {
  name: "orderinfo",
  description: "Show full info for an order.",
  data: new SlashCommandBuilder()
    .setName("orderinfo")
    .setDescription("Show full info for an order")
    .addStringOption((option) =>
      option
        .setName("order_id")
        .setDescription("Order ID. Leave blank to use the current ticket.")
        .setRequired(false)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;

    if (isInteraction) {
      await target.deferReply({ flags: 64 });
    }

    if (!target.client.isStaff(target.member, target.guild)) {
      return isInteraction
        ? target.editReply({ content: "staff only" })
        : target.reply("staff only");
    }

    const explicitOrderId = String(
      isInteraction ? target.options.getString("order_id") || "" : args[0] || ""
    ).trim();
    const orderId = explicitOrderId || target.client.getTicketOrderId(target.channel);

    if (!orderId) {
      return isInteraction
        ? target.editReply({ content: "no order id linked to this ticket" })
        : target.reply("no order id linked to this ticket");
    }

    try {
      const order = await target.client.fetchOrderById(orderId);
      const config = target.client.getConfig(target.guild);
      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(`Order ${order.order_id}`)
        .addFields(
          { name: "Status", value: order.status || "pending", inline: true },
          { name: "Buyer ID", value: order.discord_user_id || "unknown", inline: true },
          { name: "Buyer Username", value: order.discord_username || "unknown", inline: true },
          { name: "Payment Method", value: order.payment_method || "not set", inline: true },
          { name: "Product", value: order.product || "not set", inline: true },
          { name: "Notes", value: order.notes || "none", inline: false },
          { name: "Linked Account", value: getLinkedAccountText(config, orderId), inline: false }
        )
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      return isInteraction
        ? target.editReply({ embeds: [embed] })
        : target.reply({ embeds: [embed] });
    } catch (error) {
      console.error("orderinfo failed:", error);
      return isInteraction
        ? target.editReply({ content: `failed to fetch order: ${orderId}` })
        : target.reply(`failed to fetch order: ${orderId}`);
    }
  },
};
