function parseDiscordMessageLink(link) {
  const match = String(link || "").trim().match(
    /^https?:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/i
  );

  if (!match) {
    return null;
  }

  return {
    guildId: match[1],
    channelId: match[2],
    messageId: match[3],
  };
}

async function getMessageFromLink(client, link) {
  const parsed = parseDiscordMessageLink(link);
  if (!parsed) {
    return null;
  }

  const channel = await client.channels.fetch(parsed.channelId).catch(() => null);
  if (!channel || !channel.isTextBased()) {
    return null;
  }

  return channel.messages.fetch(parsed.messageId).catch(() => null);
}

async function getRepliedMessage(interaction) {
  const repliedMessageId =
    interaction.reference?.messageId ||
    interaction.message?.reference?.messageId ||
    null;

  if (!repliedMessageId || !interaction.channel?.isTextBased()) {
    return null;
  }

  return interaction.channel.messages.fetch(repliedMessageId).catch(() => null);
}

module.exports = {
  parseDiscordMessageLink,
  getMessageFromLink,
  getRepliedMessage,
};
