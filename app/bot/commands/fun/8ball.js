const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const responses = [
  "Yes",
  "No",
  "Maybe",
  "Definitely",
  "Ask again later",
  "Without a doubt",
  "Very unlikely",
  "Signs point to yes",
];

module.exports = {
  name: "8ball",
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Your question")
        .setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const client = isInteraction ? interaction.client : message.client;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    const question = isInteraction
      ? interaction.options.getString("question")
      : args.join(" ").trim();

    if (!question) {
      if (isInteraction) {
        return interaction.editReply({ content: "ask a question" });
      }
      return message.reply("ask a question");
    }

    const answer = responses[Math.floor(Math.random() * responses.length)];
    const embed = new EmbedBuilder()
      .setColor(client.getConfig().embedColor)
      .setTitle("Magic 8-Ball")
      .addFields(
        { name: "Question", value: question, inline: false },
        { name: "Answer", value: answer, inline: false }
      )
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (isInteraction) {
      return interaction.editReply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
  },
};
