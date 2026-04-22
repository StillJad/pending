const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  name: "welcomeset",
  data: new SlashCommandBuilder()
    .setName("welcomeset")
    .setDescription("Set the welcome channel")
    .addChannelOption(option =>
      option.setName("channel").setDescription("Welcome channel").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;
    const client = isInteraction ? interaction.client : message.client;

    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      if (isInteraction) {
        return interaction.reply({ content: "no permission", flags: 64 });
      }
      return message.reply("no permission");
    }

    const channel = isInteraction
      ? interaction.options.getChannel("channel")
      : message.mentions.channels.first();

    if (!channel || channel.type !== ChannelType.GuildText) {
      if (isInteraction) {
        return interaction.reply({ content: "pick a text channel", flags: 64 });
      }
      return message.reply("mention a text channel");
    }

    const config = client.getConfig(isInteraction ? interaction.guild : message.guild);
    config.welcomeChannelId = channel.id;
    client.saveConfig(config, isInteraction ? interaction.guild : message.guild);

    const text = `welcome channel set to ${channel}`;

    if (isInteraction) {
      return interaction.reply({ content: text, flags: 64 });
    }

    return message.reply(text);
  },
};
