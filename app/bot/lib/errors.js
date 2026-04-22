const { EmbedBuilder } = require("discord.js");

async function logErrorToChannel(client, guild, title, error, context = "") {
  if (!client || !guild || !client.getConfig) {
    return;
  }

  const config = client.getConfig(guild);
  if (!config.logChannelId) {
    return;
  }

  const logChannel =
    guild.channels.cache.get(config.logChannelId) ||
    (await guild.channels.fetch(config.logChannelId).catch(() => null));

  if (!logChannel || !logChannel.isTextBased()) {
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle(title)
    .setDescription("An error occurred while handling a bot action.")
    .addFields(
      {
        name: "Context",
        value: String(context || "None").slice(0, 1024),
        inline: false,
      },
      {
        name: "Error",
        value: String(error?.stack || error?.message || error || "Unknown").slice(0, 1024),
        inline: false,
      }
    )
    .setFooter({ text: "Pending | pending.cc" })
    .setTimestamp();

  await logChannel.send({ embeds: [embed] }).catch(() => {});
}

function registerProcessErrorHandlers() {
  process.on("unhandledRejection", (error) => {
    console.error("UNHANDLED REJECTION:", error);
  });

  process.on("uncaughtException", (error) => {
    console.error("UNCAUGHT EXCEPTION:", error);
  });
}

module.exports = {
  logErrorToChannel,
  registerProcessErrorHandlers,
};
