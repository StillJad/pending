const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const PAYMENT_CHOICES = [
  { name: "Paid", value: "paid" },
  { name: "BTC", value: "btc" },
  { name: "ETH", value: "eth" },
  { name: "LTC", value: "ltc" },
  { name: "USDT", value: "usdt" },
  { name: "SOL", value: "sol" },
  { name: "PayPal", value: "paypal" },
];

module.exports = {
  name: "paid",
  description: "Mark the current ticket as paid.",
  data: new SlashCommandBuilder()
    .setName("paid")
    .setDescription("Mark the current ticket as paid")
    .addStringOption((option) =>
      option
        .setName("method")
        .setDescription("Payment method")
        .setRequired(false)
        .addChoices(...PAYMENT_CHOICES)
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

    const channel = target.channel;
    if (!channel?.name.startsWith("ticket-")) {
      return isInteraction
        ? target.editReply({ content: "not a ticket" })
        : target.reply("not a ticket");
    }

    const methodInput = String(
      isInteraction ? target.options.getString("method") || "paid" : args.join(" ") || "paid"
    )
      .trim()
      .toLowerCase();
    const allowedMethods = PAYMENT_CHOICES.map((choice) => choice.value);

    if (!allowedMethods.includes(methodInput)) {
      const helpText = "use ,paid or ,paid btc/eth/ltc/usdt/sol/paypal";
      return isInteraction
        ? target.editReply({ content: helpText })
        : target.reply(helpText);
    }

    try {
      const linkedOrderId = target.client.getTicketOrderId(channel);
      const orderSuffix = target.client.sanitizeChannelSegment(linkedOrderId || "order");
      const statusValue = methodInput === "paid" ? "paid" : `paid-${methodInput}`;

      await channel.setTopic(target.client.buildTicketTopic(channel, { status: statusValue }));

      if (linkedOrderId) {
        const orderUpdates = { status: statusValue };
        if (methodInput !== "paid") {
          orderUpdates.payment_method = methodInput;
        }
        await target.client.updateOrderById(linkedOrderId, orderUpdates);
      }

      const paymentSegment =
        methodInput === "paid" ? "confirmed" : target.client.sanitizeChannelSegment(methodInput);
      const newChannelName = `ticket-paid-${paymentSegment}-${orderSuffix}`.slice(0, 100);
      if (channel.name !== newChannelName) {
        await channel.setName(newChannelName);
      }

      await target.client.updateTicketEmbed(channel);

      const inProgressCategoryId = process.env.DISCORD_IN_PROGRESS_CATEGORY_ID;
      if (inProgressCategoryId) {
        try {
          await channel.setParent(inProgressCategoryId);
        } catch (error) {
          console.error("paid command move failed:", error);
        }
      }

      const methodLabel =
        methodInput === "paid"
          ? "Payment Confirmed"
          : `Payment Confirmed (${methodInput.toUpperCase()})`;

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle(methodLabel)
        .setDescription("Payment has been confirmed by staff.\n\nThank you for your purchase.")
        .setFooter({ text: "/Pending | Pending.cc" });

      await channel.send({ embeds: [embed] });
      await target.client.logTicketEvent(
        target.guild,
        `💰 Payment confirmed for order ${linkedOrderId || "unknown"} in #${channel.name} by ${(target.author || target.user).tag} using ${methodInput.toUpperCase()}`
      );

      return isInteraction
        ? target.editReply({ content: `marked as ${methodInput}` })
        : target.reply(`marked as ${methodInput}`);
    } catch (error) {
      console.error("paid command failed:", error);
      return isInteraction
        ? target.editReply({ content: "failed" })
        : target.reply("failed");
    }
  },
};
