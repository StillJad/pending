const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "ticketpanel",
  description: "Create ticket panel",

  slashData: new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Send ticket panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(target) {
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("Purchase Ticket")
      .setDescription(
        'Click **"Purchase"** Down Below to Purchase or if You have Any Questions about our Stock.'
      )
      .setFooter({
        text: "/Pending | Pending.cc",
      });

    const button = new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("💵 Purchase")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(button);

    return target.reply({
      embeds: [embed],
      components: [row],
    });
  },
};