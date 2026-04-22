const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { isStaff } = require("../../lib/utils/permissions");

const DEFAULT_RATE_PER_1000 = 8.5;

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

module.exports = {
  name: "robuxsetprice",
  description: "Update the robux rate per 1,000.",
  data: new SlashCommandBuilder()
    .setName("robuxsetprice")
    .setDescription("Update the robux rate per 1,000")
    .addNumberOption((option) =>
      option.setName("price").setDescription("Price per 1,000").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const message = isInteraction ? null : target;
    const client = isInteraction ? target.client : message.client;
    const guild = isInteraction ? target.guild : message.guild;
    const member = isInteraction ? target.member : message.member;
    const config = client.getConfig(guild);
    if (!isStaff(member, client, guild)) {
      if (isInteraction) {
        return target.reply({ content: "<:remake:1495128909132595240> staff only", flags: 64 });
      }
      return message.reply("<:remake:1495128909132595240> staff only");
    }

    const price = isInteraction
      ? target.options.getNumber("price")
      : Number(String(args[0] || "").replace(/,/g, ""));
    if (!Number.isFinite(price) || price <= 0) {
      if (isInteraction) {
        return target.reply({ content: "use /robuxsetprice price:<number>", flags: 64 });
      }
      return message.reply("use ,robuxsetprice <price_per_1000>");
    }

    config.robuxPricePer1000 = price;
    client.saveConfig(config, guild);
    const embedColor = Number.isFinite(config.embedColor) ? config.embedColor : 15548997;

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle("Robux Rate Updated")
      .addFields({
        name: "Price Per 1,000",
        value: formatCurrency(config.robuxPricePer1000 || DEFAULT_RATE_PER_1000),
        inline: true,
      })
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (isInteraction) {
      return target.reply({ embeds: [embed], flags: 64 });
    }
    return message.reply({ embeds: [embed] });
  },
};
