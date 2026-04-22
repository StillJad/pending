const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "orders",
  data: new SlashCommandBuilder()
    .setName("orders")
    .setDescription("View recent orders dashboard"),

  async execute(target) {
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

    const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";
    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    try {
      const response = await fetch(`${baseUrl}/api/orders?limit=10`);

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success || !Array.isArray(data.orders)) {
        if (isInteraction) {
          await interaction.editReply({ content: data.error || "failed to fetch orders" });
          return;
        }
        return message.reply(data.error || "failed to fetch orders");
      }

      const orders = data.orders;

      if (!orders.length) {
        if (isInteraction) {
          await interaction.editReply({ content: "no recent orders found" });
          return;
        }
        return message.reply("no recent orders found");
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("📦 Recent Orders")
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      orders.slice(0, 10).forEach((order, i) => {
        embed.addFields({
          name: `${i + 1}. ${order.order_id || "Unknown ID"}`,
          value:
            `Status: ${order.status || "pending"}\n` +
            `Buyer: ${order.discord_user_id ? `<@${order.discord_user_id}>` : "Unknown"}\n` +
            `Product: ${order.product || "Not set"}\n` +
            `Payment: ${order.payment_method || "Not set"}`,
          inline: false,
        });
      });

      if (isInteraction) {
        return interaction.editReply({ embeds: [embed] });
      }
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("orders dashboard failed:", error);
      if (isInteraction) {
        await interaction.editReply({ content: "failed to fetch orders" }).catch(() => {});
        return;
      }
      return message.reply("failed to fetch orders");
    }
  },
};
