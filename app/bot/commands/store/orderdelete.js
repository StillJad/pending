const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "orderdelete",
  data: new SlashCommandBuilder()
    .setName("orderdelete")
    .setDescription("Delete an order")
    .addStringOption((option) =>
      option
        .setName("order_id")
        .setDescription("Order ID")
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

    const orderId = isInteraction
      ? interaction.options.getString("order_id")
      : String(args[0] || "").trim();
    const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

    if (!orderId) {
      if (isInteraction) {
        return interaction.editReply({ content: "provide an order id" });
      }
      return message.reply("use ,orderdelete <order_id>");
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/order/${encodeURIComponent(orderId)}`,
        { method: "DELETE" }
      );

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        if (isInteraction) {
          return interaction.editReply({
            content: data.error || "failed to delete order",
          });
        }
        return message.reply(data.error || "failed to delete order");
      }

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("Order Deleted")
        .setDescription(`Deleted order \`${orderId}\`.`)
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      if (isInteraction) {
        return interaction.editReply({ embeds: [embed] });
      }
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("orderdelete failed:", error);
      if (isInteraction) {
        return interaction.editReply({ content: "failed to delete order" });
      }
      return message.reply("failed to delete order");
    }
  },
};
