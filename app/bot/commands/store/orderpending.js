const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "orderpending",
  data: new SlashCommandBuilder()
    .setName("orderpending")
    .setDescription("View pending orders"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      if (isInteraction) {
        return interaction.editReply({ content: "staff only" });
      }
      return message.reply("staff only");
    }

    const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${baseUrl}/api/orders?status=pending&limit=10`);

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success || !Array.isArray(data.orders)) {
        if (isInteraction) {
          return interaction.editReply({
            content: data.error || "failed to fetch pending orders",
          });
        }
        return message.reply(data.error || "failed to fetch pending orders");
      }

      if (!data.orders.length) {
        if (isInteraction) {
          return interaction.editReply({ content: "no pending orders found" });
        }
        return message.reply("no pending orders found");
      }

      const embed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle("Pending Orders")
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      data.orders.slice(0, 10).forEach((order, index) => {
        embed.addFields({
          name: `${index + 1}. ${order.order_id || "Unknown ID"}`,
          value:
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
      console.error("orderpending failed:", error);
      if (isInteraction) {
        return interaction.editReply({ content: "failed to fetch pending orders" });
      }
      return message.reply("failed to fetch pending orders");
    }
  },
};
