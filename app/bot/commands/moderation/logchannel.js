const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "logchannel",
  description: "Set the log channel.",
  data: new SlashCommandBuilder()
    .setName("logchannel")
    .setDescription("Set the log channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to use for logs")
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
    config.logChannelId = channel.id;
    target.client.saveConfig(config, target.guild);

    return isInteraction
      ? target.editReply({ content: `log channel set to ${channel}` })
      : target.reply(`log channel set to ${channel}`);
  },
};
