const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "hardban",
  data: new SlashCommandBuilder()
    .setName("hardban")
    .setDescription("Ban a user and delete their recent messages")
    .addUserOption(option =>
      option.setName("user").setDescription("User to hard ban").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("Reason").setRequired(false)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;
    const guild = isInteraction ? interaction.guild : message.guild;
    const client = isInteraction ? interaction.client : message.client;
    const author = isInteraction ? interaction.user : message.author;

    if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
      if (isInteraction) {
        return interaction.reply({ content: "no permission", flags: 64 });
      }
      return message.reply("no permission");
    }

    let user;
    let reason = "No reason provided";

    if (isInteraction) {
      user = interaction.options.getUser("user");
      reason = interaction.options.getString("reason") || reason;
    } else {
      user = message.mentions.users.first();
      reason = args.slice(1).join(" ").trim() || reason;
      if (!user) return message.reply("use ,hardban @user [reason]");
    }

    const targetMember = await guild.members.fetch(user.id).catch(() => null);

    if (targetMember && !targetMember.bannable) {
      if (isInteraction) {
        return interaction.reply({ content: "i can't ban that user", flags: 64 });
      }
      return message.reply("i can't ban that user");
    }

    try {
      await user.send(`You were banned from **${guild.name}**. Reason: ${reason}`).catch(() => {});
      await guild.members.ban(user.id, {
        reason,
        deleteMessageSeconds: 7 * 24 * 60 * 60,
      });

      const config = client.getConfig ? client.getConfig(guild) : {};
      if (config.logChannelId) {
        const logChannel = guild.channels.cache.get(config.logChannelId);
        if (logChannel && logChannel.isTextBased()) {
          await logChannel.send(
            `🔨 Hardban by ${author.tag} (${author.id}) | User: ${user.tag} (${user.id}) | Reason: ${reason}`
          );
        }
      }

      if (isInteraction) {
        return interaction.reply({ content: `hardbanned ${user.tag}`, flags: 64 });
      }

      const replyMsg = await message.reply(`hardbanned ${user.tag}`);
      setTimeout(() => replyMsg.delete().catch(() => {}), 3000);
    } catch (error) {
      console.error("hardban failed:", error);
      if (isInteraction) {
        return interaction.reply({ content: "failed to hardban user", flags: 64 });
      }
      return message.reply("failed to hardban user");
    }
  },
};
