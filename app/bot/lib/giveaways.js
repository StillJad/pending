const database = require("./database");

function normalizeGiveawayId(id) {
  return String(id || "").replace(/^GW-/i, "").trim();
}

function findGiveawayByLookup(value) {
  const raw = String(value || "").trim();
  const normalized = normalizeGiveawayId(raw);

  return (
    database.getGiveaways().find(
      (giveaway) =>
        normalizeGiveawayId(giveaway.giveawayId) === normalized ||
        String(giveaway.messageId || "").trim() === raw ||
        String(giveaway.messageId || "").trim() === normalized
    ) || null
  );
}

function saveGiveaways(giveaways) {
  database.saveGiveaways(giveaways);
}

async function fetchGiveawayMessage(guild, giveaway) {
  try {
    const channelId = String(giveaway?.channelId || "").trim();
    const messageId = String(giveaway?.messageId || "").trim();
    const channel = await guild.channels.fetch(channelId).catch(() => null);

    if (!channel || !channel.isTextBased()) {
      return null;
    }

    return channel.messages.fetch(messageId).catch(() => null);
  } catch {
    return null;
  }
}

async function pickRandomEntrant(giveawayMessage, excludedIds = []) {
  const reaction =
    giveawayMessage.reactions.cache.get("🎉") ||
    (await giveawayMessage.reactions
      .fetch()
      .then((reactions) => reactions.get("🎉"))
      .catch(() => null));

  if (!reaction) {
    return null;
  }

  const fetchedUsers = await reaction.users.fetch();
  const eligible = [...fetchedUsers.values()].filter(
    (user) => !user.bot && !excludedIds.includes(user.id)
  );

  if (!eligible.length) {
    return null;
  }

  return eligible[Math.floor(Math.random() * eligible.length)];
}

function getGiveawayWinnerId(giveaway) {
  return giveaway?.winnerId || giveaway?.winner || giveaway?.winnerIds?.[0] || null;
}

function buildGiveawayMessageLink(giveaway) {
  if (!giveaway?.guildId || !giveaway?.channelId || !giveaway?.messageId) {
    return "Unavailable";
  }

  return `https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}`;
}

module.exports = {
  normalizeGiveawayId,
  findGiveawayByLookup,
  saveGiveaways,
  fetchGiveawayMessage,
  pickRandomEntrant,
  getGiveawayWinnerId,
  buildGiveawayMessageLink,
};
