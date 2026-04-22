const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "vouchchannel",
  description: "Set the vouch channel.",
  data: new SlashCommandBuilder()
    .setName("vouchchannel")
    .setDescription("Set the vouch channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to use for vouches")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;

    if (isInteraction) {
      await target.deferReply({ flags: 64 });
    }

    if (!target.client.isStaff(target.member, target.guild)) {
      return isInteraction
        ? target.editReply({ content: "staff only" })
        : target.reply("staff only");
    }

    const channel = isInteraction
      ? target.options.getChannel("channel")
      : target.mentions.channels.first();

    if (!channel || channel.type !== ChannelType.GuildText) {
      return isInteraction
        ? target.editReply({ content: "mention a text channel" })
        : target.reply("mention a text channel");
    }

    const config = target.client.getConfig(target.guild);
    config.vouchChannelId = channel.id;
    target.client.saveConfig(config, target.guild);

    return isInteraction
      ? target.editReply({ content: `vouch channel set to ${channel}` })
      : target.reply(`vouch channel set to ${channel}`);
  },
};
