const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "ticketmove",
  description: "Move the current ticket to another category.",
  data: new SlashCommandBuilder()
    .setName("ticketmove")
    .setDescription("Move the current ticket to another category")
    .addChannelOption((option) =>
      option
        .setName("category")
        .setDescription("Category to move the ticket into")
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const channel = target.channel;

    if (isInteraction) {
      await target.deferReply({ flags: 64 });
    }

    if (!target.client.isStaff(target.member, target.guild)) {
      return isInteraction
        ? target.editReply({ content: "staff only" })
        : target.reply("staff only");
    }

    if (!channel?.name.startsWith("ticket-")) {
      return isInteraction
        ? target.editReply({ content: "not a ticket" })
        : target.reply("not a ticket");
    }

    const category = isInteraction
      ? target.options.getChannel("category")
      : target.guild.channels.cache.get(String(args[0] || "").replace(/[<#>]/g, ""));

    if (!category || category.type !== ChannelType.GuildCategory) {
      return isInteraction
        ? target.editReply({ content: "invalid category id" })
        : target.reply("invalid category id");
    }

    try {
      await channel.setParent(category.id);
      return isInteraction
        ? target.editReply({ content: `ticket moved to ${category.name}` })
        : target.reply(`ticket moved to ${category.name}`);
    } catch (error) {
      console.error("ticketmove failed:", error);
      return isInteraction
        ? target.editReply({ content: "failed to move ticket" })
        : target.reply("failed to move ticket");
    }
  },
};
