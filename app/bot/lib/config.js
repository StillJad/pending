const database = require("./database");

function resolveGuildId(guildLike) {
  if (!guildLike) return null;

  if (typeof guildLike === "string") {
    return guildLike;
  }

  if (typeof guildLike === "object") {
    return guildLike.id || guildLike.guildId || guildLike.guild?.id || null;
  }

  return null;
}

function getConfig(guildLike) {
  return database.getGuildSettings(resolveGuildId(guildLike));
}

function saveConfig(settings, guildLike) {
  const guildId = resolveGuildId(guildLike);

  if (guildId) {
    database.saveGuildSettings(guildId, settings);
    return;
  }

  database.saveGlobalSettings(settings);
}

module.exports = {
  getConfig,
  saveConfig,
  resolveGuildId,
};
