const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "kick",
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption(option =>
      option.setName("user").setDescription("User").setRequired(true)
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

    if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
      if (isInteraction) {
        return interaction.reply({ content: "no permission", flags: 64 });
      }
      return message.reply("no permission");
    }

    const user = isInteraction
      ? interaction.options.getUser("user")
      : message.mentions.users.first();

    const reason = isInteraction
      ? interaction.options.getString("reason") || "No reason provided"
      : args.slice(1).join(" ").trim() || "No reason provided";

    if (!user) {
      if (isInteraction) {
        return interaction.reply({ content: "user not found", flags: 64 });
      }
      return message.reply("use ,kick @user [reason]");
    }

    const targetMember = await guild.members.fetch(user.id).catch(() => null);
    if (!targetMember || !targetMember.kickable) {
      if (isInteraction) {
        return interaction.reply({ content: "i can't kick that user", flags: 64 });
      }
      return message.reply("i can't kick that user");
    }

    try {
      await targetMember.kick(reason);

      const config = client.getConfig(guild);
      if (config.logChannelId) {
        const logChannel = guild.channels.cache.get(config.logChannelId);
        if (logChannel && logChannel.isTextBased()) {
          await logChannel.send(
            `👢 Kick by ${author.tag} (${author.id}) | User: ${user.tag} (${user.id}) | Reason: ${reason}`
          );
        }
      }

      const text = `kicked ${user.tag}`;

      if (isInteraction) {
        return interaction.reply({ content: text, flags: 64 });
      }

      const replyMsg = await message.reply(text);
      setTimeout(() => replyMsg.delete().catch(() => {}), 3000);
    } catch (error) {
      console.error("kick failed:", error);
      if (isInteraction) {
        return interaction.reply({ content: "failed to kick user", flags: 64 });
      }
      return message.reply("failed to kick user");
    }
  },
};
