const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

module.exports = {
  name: "setlogchannel",
  data: new SlashCommandBuilder()
    .setName("setlogchannel")
    .setDescription("Set the staff log channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel for staff logs")
        .setRequired(true)
    ),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;
    const client = isInteraction ? interaction.client : message.client;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      if (isInteraction) {
        return interaction.editReply({ content: "no permission" });
      }
      return message.reply("no permission");
    }

    const channel = isInteraction
      ? interaction.options.getChannel("channel")
      : message.mentions.channels.first();

    if (!channel || channel.type !== ChannelType.GuildText) {
      if (isInteraction) {
        return interaction.editReply({ content: "pick a text channel" });
      }
      return message.reply("mention a text channel");
    }

    const config = client.getConfig(isInteraction ? interaction.guild : message.guild);
    config.logChannelId = channel.id;
    client.saveConfig(config, isInteraction ? interaction.guild : message.guild);

    const embed = new EmbedBuilder()
      .setColor(client.getConfig(isInteraction ? interaction.guild : message.guild).embedColor)
      .setTitle("Log Channel Updated")
      .setDescription(`Staff logs will now be sent to ${channel}.`)
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (isInteraction) {
      return interaction.editReply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
  },
};
