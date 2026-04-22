const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "orderview",
  data: new SlashCommandBuilder()
    .setName("orderview")
    .setDescription("View an order cleanly")
    .addStringOption(option =>
      option.setName("order_id").setDescription("Order ID").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const orderId = isInteraction
      ? interaction.options.getString("order_id")
      : String(args[0] || "").trim();
    const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

    if (!orderId) {
      if (isInteraction) {
        return interaction.reply({ content: "provide an order id", flags: 64 });
      }
      return message.reply("use ,orderview <order_id>");
    }

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    try {
      const response = await fetch(`${baseUrl}/api/order/${encodeURIComponent(orderId)}`);

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success || !data.order) {
        if (isInteraction) {
          await interaction.editReply({ content: data.error || "invalid order id" });
          return;
        }
        return message.reply(data.error || "invalid order id");
      }

      const order = data.order;

      const statusColors = {
        pending: 0xed4245,
        "in-progress": 0xfee75c,
        fulfilled: 0x57f287,
        completed: 0x57f287,
        vouched: 0x57f287,
        cancelled: 0x5865f2,
      };

      const embed = new EmbedBuilder()
        .setColor(statusColors[order.status] || 0x5865f2)
        .setTitle("📦 Order Summary")
        .addFields(
          { name: "Order ID", value: order.order_id || orderId, inline: true },
          { name: "Customer", value: order.discord_user_id ? `<@${order.discord_user_id}>` : "Unknown", inline: true },
          { name: "Status", value: order.status || "pending", inline: true },
          { name: "Product", value: order.product || "Not set", inline: true },
          { name: "Payment", value: order.payment_method || "Not set", inline: true },
          { name: "Notes", value: order.notes || "None", inline: false }
        )
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      if (isInteraction) {
        return interaction.editReply({ embeds: [embed] });
      }
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("orderview failed:", error);
      if (isInteraction) {
        await interaction.editReply({ content: "failed to fetch order" }).catch(() => {});
        return;
      }
      return message.reply("failed to fetch order");
    }
  },
};
