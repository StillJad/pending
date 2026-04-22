const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "statuschannel",
  description: "Set the seller status channel.",
  data: new SlashCommandBuilder()
    .setName("statuschannel")
    .setDescription("Set the seller status channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel for the seller status message")
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
    config.statusChannelId = channel.id;
    target.client.saveConfig(config, target.guild);

    return isInteraction
      ? target.editReply({ content: `status channel set to ${channel}` })
      : target.reply(`status channel set to ${channel}`);
  },
};
