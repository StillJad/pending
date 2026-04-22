const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "updateprice",
  data: new SlashCommandBuilder()
    .setName("updateprice")
    .setDescription("Update a product price on the website")
    .addStringOption(option =>
      option.setName("product_id").setDescription("Product ID").setRequired(true)
    )
    .addNumberOption(option =>
      option.setName("price").setDescription("New price").setRequired(true)
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

    const productId = isInteraction
      ? interaction.options.getString("product_id")
      : String(args[0] || "").trim();
    const price = isInteraction
      ? interaction.options.getNumber("price")
      : Number(args[1]);
    const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

    if (!productId || !Number.isFinite(price)) {
      if (isInteraction) {
        return interaction.reply({ content: "provide a product id and price", flags: 64 });
      }
      return message.reply("use ,updateprice <product_id> <price>");
    }

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    try {
      const response = await fetch(`${baseUrl}/api/products/${encodeURIComponent(productId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || data.success === false) {
        if (isInteraction) {
          await interaction.editReply({ content: data.error || "failed to update price" });
          return;
        }
        return message.reply(data.error || "failed to update price");
      }

      if (isInteraction) {
        return interaction.editReply({ content: `updated price for ${productId} to ${price}` });
      }
      return message.reply(`updated price for ${productId} to ${price}`);
    } catch (error) {
      console.error("updateprice failed:", error);
      if (isInteraction) {
        await interaction.editReply({ content: "failed to update price" }).catch(() => {});
        return;
      }
      return message.reply("failed to update price");
    }
  },
};
