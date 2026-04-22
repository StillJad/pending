const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "ordersfilter",
  data: new SlashCommandBuilder()
    .setName("ordersfilter")
    .setDescription("View orders by status")
    .addStringOption(option =>
      option
        .setName("status")
        .setDescription("Order status")
        .addChoices(
          { name: "Pending", value: "pending" },
          { name: "In Progress", value: "in-progress" },
          { name: "Fulfilled", value: "fulfilled" },
          { name: "Completed", value: "completed" },
          { name: "Cancelled", value: "cancelled" },
          { name: "Vouched", value: "vouched" }
        )
        .setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      if (isInteraction) {
        return interaction.reply({ content: "staff only", flags: 64 });
      }
      return message.reply("staff only");
    }

    const status = isInteraction
      ? interaction.options.getString("status")
      : String(args[0] || "").trim().toLowerCase();
    const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";
    const allowedStatuses = new Set(["pending", "in-progress", "fulfilled", "completed", "cancelled", "vouched"]);

    if (!allowedStatuses.has(status)) {
      if (isInteraction) {
        return interaction.reply({ content: "use a valid order status", flags: 64 });
      }
      return message.reply("use ,ordersfilter <pending|in-progress|fulfilled|completed|cancelled|vouched>");
    }

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/orders?status=${encodeURIComponent(status)}&limit=10`
      );

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success || !Array.isArray(data.orders)) {
        if (isInteraction) {
          await interaction.editReply({ content: data.error || "failed to fetch filtered orders" });
          return;
        }
        return message.reply(data.error || "failed to fetch filtered orders");
      }

      const orders = data.orders;

      if (!orders.length) {
        if (isInteraction) {
          await interaction.editReply({ content: `no ${status} orders found` });
          return;
        }
        return message.reply(`no ${status} orders found`);
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`📦 Orders: ${status}`)
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      orders.slice(0, 10).forEach((order, i) => {
        embed.addFields({
          name: `${i + 1}. ${order.order_id || "Unknown ID"}`,
          value:
            `Buyer: ${order.discord_user_id ? `<@${order.discord_user_id}>` : "Unknown"}\n` +
            `Product: ${order.product || "Not set"}\n` +
            `Payment: ${order.payment_method || "Not set"}\n` +
            `Status: ${order.status || "pending"}`,
          inline: false,
        });
      });

      if (isInteraction) {
        return interaction.editReply({ embeds: [embed] });
      }
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("ordersfilter failed:", error);
      if (isInteraction) {
        await interaction.editReply({ content: "failed to fetch filtered orders" }).catch(() => {});
        return;
      }
      return message.reply("failed to fetch filtered orders");
    }
  },
};
