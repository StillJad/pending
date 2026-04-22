const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  name: "unlockall",
  data: new SlashCommandBuilder()
    .setName("unlockall")
    .setDescription("Unlock all normal text channels"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;
    const guild = isInteraction ? interaction.guild : message.guild;
    const client = isInteraction ? interaction.client : message.client;
    const author = isInteraction ? interaction.user : message.author;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      if (isInteraction) {
        return interaction.editReply({ content: "no permission" });
      }
      return message.reply("no permission");
    }

    const config = client.getConfig ? client.getConfig(guild) : {};
    if (!Array.isArray(config.lockdownLockedChannels)) {
      config.lockdownLockedChannels = [];
    }

    let success = 0;
    let failed = 0;

    for (const channelId of config.lockdownLockedChannels) {
      const channel = guild.channels.cache.get(channelId);
      if (!channel) {
        failed++;
        continue;
      }

      try {
        await channel.permissionOverwrites.edit(guild.id, {
          SendMessages: null,
        });
        success++;
      } catch {
        failed++;
      }
    }

    config.lockdownLockedChannels = [];
    if (client.saveConfig) {
      client.saveConfig(config, guild);
    }

    if (config.logChannelId) {
      const logChannel = guild.channels.cache.get(config.logChannelId);
      if (logChannel && logChannel.isTextBased()) {
        await logChannel.send(
          `🔓 Unlockall by ${author.tag} (${author.id}) | Success: ${success} | Failed: ${failed}`
        );
      }
    }

    const text = `unlockall complete | success: ${success}, failed: ${failed}`;

    if (isInteraction) {
      return interaction.editReply({ content: text });
    }

    const replyMsg = await message.reply(text);
    setTimeout(() => replyMsg.delete().catch(() => {}), 4000);
  },
};
