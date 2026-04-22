const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

async function fetchMeme() {
  const response = await fetch("https://meme-api.com/gimme");
  const data = await response.json();

  if (!response.ok || !data?.url) {
    throw new Error("failed to fetch meme");
  }

  return data;
}

module.exports = {
  name: "meme",
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Fetch a meme"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const client = isInteraction ? interaction.client : message.client;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    try {
      const meme = await fetchMeme();
      const embed = new EmbedBuilder()
        .setColor(client.getConfig().embedColor)
        .setTitle(meme.title || "Meme")
        .setImage(meme.url)
        .setFooter({ text: `r/${meme.subreddit || "memes"} | Pending.cc` })
        .setTimestamp();

      if (meme.postLink) {
        embed.setURL(meme.postLink);
      }

      if (isInteraction) {
        return interaction.editReply({ embeds: [embed] });
      }

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("meme failed:", error);
      if (isInteraction) {
        return interaction.editReply({ content: "failed to fetch meme" });
      }
      return message.reply("failed to fetch meme");
    }
  },
};
