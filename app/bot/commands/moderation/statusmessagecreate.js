const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require("discord.js");

function buildFields(guild, config, getPresenceEmoji) {
  if (!config.trackedStatusUserIds.length) {
    return [
      {
        name: "No tracked users",
        value: "Add users with ,statusadd @user",
        inline: false,
      },
    ];
  }

  return config.trackedStatusUserIds.map((userId) => {
    const member = guild.members.cache.get(userId);
    const status = member?.presence?.status || "offline";
    const emoji = getPresenceEmoji(status);

    return {
      name: member?.user?.username || "Unknown",
      value: `<@${userId}>\nStatus: ${emoji} ${status}`,
      inline: false,
    };
  });
}

module.exports = {
  name: "statusmessagecreate",
  description: "Create the tracked seller status message.",
  data: new SlashCommandBuilder()
    .setName("statusmessagecreate")
    .setDescription("Create the tracked seller status message"),

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

    const config = target.client.getConfig(target.guild);
    if (!config.statusChannelId) {
      return isInteraction
        ? target.editReply({ content: "set a status channel first" })
        : target.reply("set a status channel first");
    }

    const statusChannel = target.guild.channels.cache.get(config.statusChannelId);
    if (!statusChannel || statusChannel.type !== ChannelType.GuildText) {
      return isInteraction
        ? target.editReply({ content: "invalid status channel" })
        : target.reply("invalid status channel");
    }

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("📊 Seller Status")
      .addFields(buildFields(target.guild, config, target.client.getPresenceEmoji))
      .setFooter({ text: "/Pending | Pending.cc" });

    const statusMessage = await statusChannel.send({ embeds: [embed] });

    config.statusMessageId = statusMessage.id;
    target.client.saveConfig(config, target.guild);

    return isInteraction
      ? target.editReply({ content: `status message created in ${statusChannel}` })
      : target.reply(`status message created in ${statusChannel}`);
  },
};
