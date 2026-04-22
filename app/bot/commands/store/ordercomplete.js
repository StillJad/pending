const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "ordercomplete",
  data: new SlashCommandBuilder()
    .setName("ordercomplete")
    .setDescription("Mark an order as completed")
    .addStringOption(option =>
      option.setName("order_id").setDescription("Order ID").setRequired(true)
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

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    const orderId = isInteraction
      ? interaction.options.getString("order_id")
      : String(args[0] || "").trim();
    const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

    if (!orderId) {
      if (isInteraction) {
        return interaction.editReply({ content: "provide an order id" });
      }
      return message.reply("use ,ordercomplete <order_id>");
    }

    try {
      const response = await fetch(`${baseUrl}/api/order`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          status: "completed",
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        if (isInteraction) {
          await interaction.editReply({ content: data.error || "failed to complete order" });
          return;
        }
        return message.reply(data.error || "failed to complete order");
      }

      if (isInteraction) {
        return interaction.editReply({ content: `marked ${orderId} completed` });
      }
      return message.reply(`marked ${orderId} completed`);
    } catch (error) {
      console.error("ordercomplete failed:", error);
      if (isInteraction) {
        await interaction.editReply({ content: "failed to complete order" }).catch(() => {});
        return;
      }
      return message.reply("failed to complete order");
    }
  },
};
