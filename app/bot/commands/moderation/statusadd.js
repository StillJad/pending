const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "statusadd",
  description: "Add a user to seller status tracking.",
  data: new SlashCommandBuilder()
    .setName("statusadd")
    .setDescription("Add a user to seller status tracking")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to track").setRequired(true)
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

    const user = isInteraction
      ? target.options.getUser("user")
      : target.mentions.users.first();

    if (!user) {
      return isInteraction
        ? target.editReply({ content: "mention a user" })
        : target.reply("mention a user");
    }

    const config = target.client.getConfig(target.guild);
    if (!config.trackedStatusUserIds.includes(user.id)) {
      config.trackedStatusUserIds.push(user.id);
      target.client.saveConfig(config, target.guild);
    }

    await target.client.updateStatusMessage(target.guild);

    return isInteraction
      ? target.editReply({ content: `${user} added to status tracking` })
      : target.reply(`${user} added to status tracking`);
  },
};
