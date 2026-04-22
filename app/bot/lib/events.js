const { createEmbed } = require("./utils/embed");

function registerCoreEvents(client) {
  client.on("messageDelete", async (message) => {
    try {
      const deletedMessage = message.partial
        ? await message.fetch().catch(() => message)
        : message;

      if (!deletedMessage || !deletedMessage.guild || deletedMessage.author?.bot) {
        return;
      }

      client.db.setSnipedMessage(deletedMessage.channel.id, {
        content: deletedMessage.content || "No text content",
        authorTag: deletedMessage.author?.tag || "Unknown",
        authorId: deletedMessage.author?.id || "Unknown",
        attachments: [...(deletedMessage.attachments?.values() || [])].map(
          (attachment) => attachment.url
        ),
        createdTimestamp: deletedMessage.createdTimestamp || Date.now(),
        deletedAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to capture deleted message for snipe:", error);
    }
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    try {
      if (user.bot) return;

      const safeReaction = reaction.partial
        ? await reaction.fetch().catch(() => null)
        : reaction;

      if (!safeReaction?.message?.guild) {
        return;
      }

      const sourceMessage = safeReaction.message.partial
        ? await safeReaction.message.fetch().catch(() => safeReaction.message)
        : safeReaction.message;

      client.db.setSnipedReaction(sourceMessage.channel.id, {
        emoji: safeReaction.emoji.toString(),
        userTag: user.tag,
        userId: user.id,
        authorTag: sourceMessage.author?.tag || "Unknown",
        authorId: sourceMessage.author?.id || "Unknown",
        messageContent: sourceMessage.content || "No text content",
        messageId: sourceMessage.id,
        removedAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to capture removed reaction for snipe:", error);
    }
  });

  client.on("guildMemberAdd", async (member) => {
    const config = client.getConfig(member.guild);

    if (config.autorole) {
      const role = member.guild.roles.cache.get(config.autorole);
      if (role) {
        try {
          await member.roles.add(role);
        } catch (error) {
          console.error("Failed to add autorole:", error);
        }
      }
    }

    if (config.welcomeChannelId) {
      const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
      if (welcomeChannel && welcomeChannel.isTextBased()) {
        const welcomeText = config.welcomeMessage
          .replaceAll("{user}", `${member}`)
          .replaceAll("{username}", member.user.username)
          .replaceAll("{server}", member.guild.name)
          .replaceAll("{membercount}", member.guild.memberCount);

        try {
          const welcomeEmbed = createEmbed(client, member.guild, {
            title: config.welcomeTitle
              .replaceAll("{user}", `${member}`)
              .replaceAll("{username}", member.user.username)
              .replaceAll("{server}", member.guild.name),
            description: welcomeText,
          });

          if (config.welcomeThumbnail === "avatar") {
            welcomeEmbed.setThumbnail(
              member.user.displayAvatarURL({ dynamic: true })
            );
          }

          await welcomeChannel.send({ embeds: [welcomeEmbed] });
        } catch (error) {
          console.error("Failed to send welcome message:", error);
        }
      }
    }
  });
}

module.exports = {
  registerCoreEvents,
};
