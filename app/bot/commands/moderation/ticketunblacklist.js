const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketunblacklist",
  description: "Remove a user from the ticket blacklist.",
  data: new SlashCommandBuilder()
    .setName("ticketunblacklist")
    .setDescription("Remove a user from the ticket blacklist")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to remove").setRequired(true)
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
    config.ticketBlacklist = config.ticketBlacklist.filter((id) => id !== user.id);
    target.client.saveConfig(config, target.guild);

    return isInteraction
      ? target.editReply({ content: `<@${user.id}> removed from ticket blacklist` })
      : target.reply(`<@${user.id}> removed from ticket blacklist`);
  },
};
