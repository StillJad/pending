const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "nuke",
  data: new SlashCommandBuilder()
    .setName("nuke")
    .setDescription("Nuke the current channel")
    .addStringOption(option =>
      option
        .setName("confirm")
        .setDescription('Type YES to confirm')
        .setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;
    const channel = isInteraction ? interaction.channel : message.channel;
    const guild = isInteraction ? interaction.guild : message.guild;
    const client = isInteraction ? interaction.client : message.client;
    const author = isInteraction ? interaction.user : message.author;

    if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      if (isInteraction) {
        return interaction.reply({ content: "no permission", flags: 64 });
      }
      return message.reply("no permission");
    }

    const confirm = isInteraction
      ? interaction.options.getString("confirm")
      : (args[0] || "");

    if (confirm !== "YES") {
      if (isInteraction) {
        return interaction.reply({ content: 'type YES to confirm', flags: 64 });
      }
      return message.reply("use ,nuke YES");
    }

    const config = client.getConfig ? client.getConfig(guild) : {};

    if (
      channel.name.startsWith("ticket-") ||
      channel.id === config.statusChannelId ||
      channel.id === config.deliveryChannelId ||
      channel.id === config.welcomeChannelId
    ) {
      if (isInteraction) {
        return interaction.reply({ content: "that channel cannot be nuked", flags: 64 });
      }
      return message.reply("that channel cannot be nuked");
    }

    try {
      if (isInteraction) {
        await interaction.reply({ content: "nuking channel...", flags: 64 });
      }

      const oldName = channel.name;
      const oldPosition = channel.rawPosition;
      const cloned = await channel.clone({
        name: oldName,
        reason: `Nuked by ${author.tag}`,
      });

      if (channel.parentId) {
        await cloned.setParent(channel.parentId).catch(() => {});
      }

      await cloned.setPosition(oldPosition).catch(() => {});
      await channel.delete(`Nuked by ${author.tag}`);

      await cloned.send(`<a:ClownSilly:1492255788029448215> nuked dat shi boii ${author}`);

      if (config.logChannelId) {
        const logChannel = guild.channels.cache.get(config.logChannelId);
        if (logChannel && logChannel.isTextBased()) {
          await logChannel.send(
            `<a:ClownSilly:1492255788029448215> nuked dat shi boii ${author.tag} (${author.id}) | Channel: #${oldName}`
          );
        }
      }
    } catch (error) {
      console.error("nuke failed:", error);
      if (!isInteraction) {
        return message.reply("failed to nuke channel");
      }
    }
  },
};
