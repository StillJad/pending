const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "raid",
  data: new SlashCommandBuilder()
    .setName("raid")
    .setDescription("Mass action against recent joins")
    .addStringOption(option =>
      option
        .setName("action")
        .setDescription("Action")
        .addChoices(
          { name: "Kick", value: "kick" },
          { name: "Ban", value: "ban" }
        )
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("joined_within")
        .setDescription("Minutes since join")
        .setRequired(true)
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

    const action = isInteraction
      ? interaction.options.getString("action")
      : (args[0] || "").toLowerCase();

    const joinedWithin = isInteraction
      ? interaction.options.getInteger("joined_within")
      : parseInt(args[1], 10);

    if (!["kick", "ban"].includes(action) || !joinedWithin || joinedWithin < 1) {
      if (isInteraction) {
        return interaction.reply({ content: "invalid usage", flags: 64 });
      }
      return message.reply("use ,raid <kick|ban> <minutes>");
    }

    const cutoff = Date.now() - joinedWithin * 60 * 1000;

    const members = await guild.members.fetch();
    let success = 0;
    let failed = 0;

    for (const targetMember of members.values()) {
      if (targetMember.user.bot) continue;
      if (!targetMember.joinedTimestamp || targetMember.joinedTimestamp < cutoff) continue;
      if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) continue;

      try {
        if (action === "kick") {
          if (targetMember.kickable) {
            await targetMember.kick(`Raid cleanup by ${author.tag}`);
            success++;
          } else {
            failed++;
          }
        } else {
          if (targetMember.bannable) {
            await targetMember.ban({
              reason: `Raid cleanup by ${author.tag}`,
              deleteMessageSeconds: 24 * 60 * 60,
            });
            success++;
          } else {
            failed++;
          }
        }
      } catch {
        failed++;
      }
    }

    const config = client.getConfig ? client.getConfig(guild) : {};
    if (config.logChannelId) {
      const logChannel = guild.channels.cache.get(config.logChannelId);
      if (logChannel && logChannel.isTextBased()) {
        await logChannel.send(
          `🚨 Raid ${action} by ${author.tag} (${author.id}) | Joined within: ${joinedWithin}m | Success: ${success} | Failed: ${failed}`
        );
      }
    }

    const text = `raid ${action} complete | success: ${success}, failed: ${failed}`;

    if (isInteraction) {
      return interaction.reply({ content: text, flags: 64 });
    }

    const replyMsg = await message.reply(text);
    setTimeout(() => replyMsg.delete().catch(() => {}), 4000);
  },
};
