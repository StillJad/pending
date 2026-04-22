const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

function matchesQuery(order, query) {
  const haystack = [
    order.order_id,
    order.discord_user_id,
    order.discord_username,
    order.product,
    order.payment_method,
    order.notes,
    order.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

module.exports = {
  name: "ordersearch",
  data: new SlashCommandBuilder()
    .setName("ordersearch")
    .setDescription("Search orders")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Search query")
        .setRequired(true)
    ),

  async execute(target, args = []) {
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

    const query = isInteraction
      ? interaction.options.getString("query").trim().toLowerCase()
      : args.join(" ").trim().toLowerCase();
    const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

    if (!query) {
      if (isInteraction) {
        return interaction.editReply({ content: "provide a search query" });
      }
      return message.reply("use ,ordersearch <query>");
    }

    try {
      const response = await fetch(`${baseUrl}/api/orders?limit=50`);

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success || !Array.isArray(data.orders)) {
        if (isInteraction) {
          return interaction.editReply({
            content: data.error || "failed to search orders",
          });
        }
        return message.reply(data.error || "failed to search orders");
      }

      const orders = data.orders.filter((order) => matchesQuery(order, query)).slice(0, 10);

      if (!orders.length) {
        if (isInteraction) {
          return interaction.editReply({ content: "no matching orders found" });
        }
        return message.reply("no matching orders found");
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`Order Search: ${query}`)
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      orders.forEach((order, index) => {
        embed.addFields({
          name: `${index + 1}. ${order.order_id || "Unknown ID"}`,
          value:
            `Status: ${order.status || "pending"}\n` +
            `Buyer: ${order.discord_user_id ? `<@${order.discord_user_id}>` : "Unknown"}\n` +
            `Product: ${order.product || "Not set"}`,
          inline: false,
        });
      });

      if (isInteraction) {
        return interaction.editReply({ embeds: [embed] });
      }
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("ordersearch failed:", error);
      if (isInteraction) {
        return interaction.editReply({ content: "failed to search orders" });
      }
      return message.reply("failed to search orders");
    }
  },
};
