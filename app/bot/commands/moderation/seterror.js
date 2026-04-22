module.exports = {
  name: "seterror",
  description: "Set the error log channel.",

  async execute(message) {
    if (!message.client.isStaff(message.member, message.guild)) {
      return message.reply("staff only");
    }

    const channel = message.mentions.channels.first();
    if (!channel || !channel.isTextBased()) {
      return message.reply("mention a channel");
    }

    const config = message.client.getConfig(message.guild);
    config.errorChannelId = channel.id;
    message.client.saveConfig(config, message.guild);

    return message.reply(`error channel set to ${channel}`);
  },
};
