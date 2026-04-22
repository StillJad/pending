const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  name: "lockdown",
  data: new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Lock all normal text channels"),

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
    const newlyLocked = [];

    for (const channel of guild.channels.cache.values()) {
      if (channel.type !== ChannelType.GuildText) continue;
      if (channel.name.startsWith("ticket-")) continue;
      if (
        channel.id === config.statusChannelId ||
        channel.id === config.deliveryChannelId ||
        channel.id === config.welcomeChannelId
      ) continue;

      const everyonePerms = channel.permissionsFor(guild.roles.everyone);
      if (!everyonePerms || !everyonePerms.has(PermissionFlagsBits.SendMessages)) {
        continue;
      }

      try {
        await channel.permissionOverwrites.edit(guild.id, {
          SendMessages: false,
        });
        newlyLocked.push(channel.id);
        success++;
      } catch {
        failed++;
      }
    }

    config.lockdownLockedChannels = newlyLocked;
    if (client.saveConfig) {
      client.saveConfig(config, guild);
    }

    if (config.logChannelId) {
      const logChannel = guild.channels.cache.get(config.logChannelId);
      if (logChannel && logChannel.isTextBased()) {
        await logChannel.send(
          `🔒 Lockdown by ${author.tag} (${author.id}) | Success: ${success} | Failed: ${failed}`
        );
      }
    }

    const text = `lockdown complete | success: ${success}, failed: ${failed}`;

    if (isInteraction) {
      return interaction.editReply({ content: text });
    }

    const replyMsg = await message.reply(text);
    setTimeout(() => replyMsg.delete().catch(() => {}), 4000);
  },
};
