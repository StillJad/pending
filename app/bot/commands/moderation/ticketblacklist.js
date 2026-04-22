const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketblacklist",
  description: "Blacklist a user from creating tickets.",
  data: new SlashCommandBuilder()
    .setName("ticketblacklist")
    .setDescription("Blacklist a user from creating tickets")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to blacklist").setRequired(true)
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
    if (!config.ticketBlacklist.includes(user.id)) {
      config.ticketBlacklist.push(user.id);
      target.client.saveConfig(config, target.guild);
    }

    return isInteraction
      ? target.editReply({ content: `<@${user.id}> blacklisted from creating tickets` })
      : target.reply(`<@${user.id}> blacklisted from creating tickets`);
  },
};
