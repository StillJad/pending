const { PermissionFlagsBits } = require("discord.js");

function isStaff(member, client, guildLike = null) {
  if (!member) return false;

  const config = client?.getConfig ? client.getConfig(guildLike || member.guild) : {};
  const adminRoleId = config.adminRoleId || "";

  return (
    member.permissions?.has(PermissionFlagsBits.Administrator) ||
    (adminRoleId && member.roles?.cache?.has(adminRoleId))
  );
}

module.exports = {
  isStaff,
};
