const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "orderstatus",
  data: new SlashCommandBuilder()
    .setName("orderstatus")
    .setDescription("Update an order status")
    .addStringOption(option =>
      option.setName("order_id").setDescription("Order ID").setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("status")
        .setDescription("Status")
        .addChoices(
          { name: "Pending", value: "pending" },
          { name: "In Progress", value: "in-progress" },
          { name: "Fulfilled", value: "fulfilled" },
          { name: "Cancelled", value: "cancelled" },
          { name: "Completed", value: "completed" },
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

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    const orderId = isInteraction
      ? interaction.options.getString("order_id")
      : String(args[0] || "").trim();
    const status = isInteraction
      ? interaction.options.getString("status")
      : String(args[1] || "").trim().toLowerCase();
    const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";
    const allowedStatuses = new Set(["pending", "in-progress", "fulfilled", "cancelled", "completed", "vouched"]);

    if (!orderId || !allowedStatuses.has(status)) {
      if (isInteraction) {
        return interaction.editReply({ content: "use a valid order id and status" });
      }
      return message.reply("use ,orderstatus <order_id> <pending|in-progress|fulfilled|cancelled|completed|vouched>");
    }

    try {
      const response = await fetch(`${baseUrl}/api/order`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.INTERNAL_BOT_API_KEY
            ? { "x-internal-bot-key": process.env.INTERNAL_BOT_API_KEY }
            : {}),
        },
        body: JSON.stringify({
          order_id: orderId,
          status,
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
          await interaction.editReply({ content: data.error || "failed to update order status" });
          return;
        }
        return message.reply(data.error || "failed to update order status");
      }

      if (isInteraction) {
        return interaction.editReply({ content: `updated ${orderId} to ${status}` });
      }
      return message.reply(`updated ${orderId} to ${status}`);
    } catch (error) {
      console.error("orderstatus failed:", error);
      if (isInteraction) {
        await interaction.editReply({ content: "failed to update order status" }).catch(() => {});
        return;
      }
      return message.reply("failed to update order status");
    }
  },
};
