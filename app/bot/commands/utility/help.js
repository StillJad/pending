const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function buildCommandMap(client) {
  const grouped = new Map();

  for (const command of client.commands.values()) {
    if (!command.data && !command.slashData) {
      continue;
    }

    const category = command.__category || "other";
    const list = grouped.get(category) || [];
    list.push(command.name);
    grouped.set(category, list);
  }

  return grouped;
}

module.exports = {
  name: "help",
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show command help"),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const client = isInteraction ? interaction.client : message.client;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    const grouped = buildCommandMap(client);
    const embed = new EmbedBuilder()
      .setColor(client.getConfig().embedColor)
      .setTitle("Help")
      .setDescription(`Prefix: \`${process.env.PREFIX || ","}\``)
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    for (const [category, names] of [...grouped.entries()].sort()) {
      const uniqueNames = [...new Set(names)].sort();
      embed.addFields({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: uniqueNames.map((name) => `/${name}`).join(", ").slice(0, 1024),
        inline: false,
      });
    }

    embed.addFields({
      name: "Prefix Extras",
      value: "`,snipe`, `,snipereactions`, `,fm`, `,setmodlog`, `,seterror`",
      inline: false,
    });

    if (isInteraction) {
      return interaction.editReply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
  },
};
