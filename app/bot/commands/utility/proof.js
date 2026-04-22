const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "proof",
  description: "Submit seller proof",

  slashData: new SlashCommandBuilder()
    .setName("proof")
    .setDescription("Submit seller proof"),

  async execute(target, args = []) {
    if (target.isChatInputCommand && target.isChatInputCommand()) {
      return;
    }

    if (!target.client.isStaff(target.member, target.guild)) {
      return target.reply("staff only");
    }

    const orderId = String(args[0] || "").trim();
    if (!orderId) {
      return target.reply("use ,proof <order_id>");
    }

    try {
      await target.client.fetchOrderById(orderId);
    } catch {
      return target.reply(`invalid order id: ${orderId}`);
    }

    target.client.pendingProofUploads.set(target.author.id, {
      guildId: target.guild.id,
      channelId: target.channel.id,
      orderId,
      createdAt: Date.now(),
    });

    return target.reply("now send the screenshot in this channel");
  },
};
