const { AttachmentBuilder, SlashCommandBuilder } = require("discord.js");
module.exports = {
  name: "tickettranscript",
  description: "Generate a simple ticket transcript.",
  data: new SlashCommandBuilder()
    .setName("tickettranscript")
    .setDescription("Generate a simple ticket transcript"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const channel = target.channel;

    if (!channel || !channel.name.startsWith("ticket-")) {
      if (isInteraction) {
        return target.reply({ content: "not a ticket", flags: 64 });
      }
      return target.reply("not a ticket");
    }

    try {
      const transcriptText = await target.client.buildTranscriptText(channel);
      const attachment = new AttachmentBuilder(
        Buffer.from(transcriptText, "utf8"),
        { name: target.client.getSafeTranscriptFileName(channel.name) }
      );

      if (isInteraction) {
        return target.reply({
          content: `transcript for ${channel.name}`,
          files: [attachment],
          flags: 64,
        });
      }

      return target.reply({
        content: `transcript for ${channel.name}`,
        files: [attachment],
      });
    } catch (error) {
      console.error("tickettranscript failed:", error);
      if (isInteraction) {
        return target.reply({ content: "failed to generate transcript", flags: 64 });
      }
      return target.reply("failed to generate transcript");
    }
  },
};
