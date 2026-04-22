const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "renameproduct",
  data: new SlashCommandBuilder()
    .setName("renameproduct")
    .setDescription("Rename a product on the website")
    .addStringOption(option =>
      option.setName("product_id").setDescription("Product ID").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("name").setDescription("New product name").setRequired(true)
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
    const name = isInteraction
      ? interaction.options.getString("name")
      : args.slice(1).join(" ").trim();
    const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

    if (!productId || !name) {
      if (isInteraction) {
        return interaction.reply({ content: "provide a product id and name", flags: 64 });
      }
      return message.reply("use ,renameproduct <product_id> <name>");
    }

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    try {
      const response = await fetch(`${baseUrl}/api/products/${encodeURIComponent(productId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || data.success === false) {
        if (isInteraction) {
          await interaction.editReply({ content: data.error || "failed to rename product" });
          return;
        }
        return message.reply(data.error || "failed to rename product");
      }

      if (isInteraction) {
        return interaction.editReply({ content: `renamed ${productId} to ${name}` });
      }
      return message.reply(`renamed ${productId} to ${name}`);
    } catch (error) {
      console.error("renameproduct failed:", error);
      if (isInteraction) {
        await interaction.editReply({ content: "failed to rename product" }).catch(() => {});
        return;
      }
      return message.reply("failed to rename product");
    }
  },
};
