const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function summarizePermissions(role) {
  const perms = role.permissions.toArray();
  if (!perms.length) return "None";
  const summary = perms
    .slice(0, 10)
    .map((perm) => perm.replace(/([A-Z])/g, " $1").trim())
    .join(", ");

  return perms.length > 10 ? `${summary}, +${perms.length - 10} more` : summary;
}

module.exports = {
  name: "roleinfo",
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("View role information")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Role to view")
        .setRequired(true)
    ),

  async execute(target) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const client = isInteraction ? interaction.client : message.client;
    const guild = isInteraction ? interaction.guild : message.guild;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    const role = isInteraction
      ? interaction.options.getRole("role")
      : message.mentions.roles.first();

    if (!role) {
      if (isInteraction) {
        return interaction.editReply({ content: "select a role" });
      }
      return message.reply("mention a role");
    }

    const embed = new EmbedBuilder()
      .setColor(role.color || client.getConfig().embedColor)
      .setTitle(`Role: ${role.name}`)
      .addFields(
        { name: "Role ID", value: role.id, inline: true },
        { name: "Color", value: role.hexColor || "#000000", inline: true },
        { name: "Members", value: String(role.members.size), inline: true },
        {
          name: "Created",
          value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`,
          inline: true,
        },
        { name: "Permissions", value: summarizePermissions(role), inline: false }
      )
      .setFooter({ text: `${guild.name} | Pending.cc` })
      .setTimestamp();

    if (isInteraction) {
      return interaction.editReply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
  },
};
