const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

const DEFAULT_RATE_PER_1000 = 8.5;
const ROBLOX_PRICE_LOOKUP = new Map([
  [80, 0.99],
  [400, 4.99],
  [800, 9.99],
  [1700, 19.99],
  [4500, 49.99],
  [10000, 99.99],
  [22500, 199.99],
]);

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number.isFinite(value) ? value : 0);
}

function getEstimatedMarketPrice(amount) {
  if (ROBLOX_PRICE_LOOKUP.has(amount)) {
    return {
      price: ROBLOX_PRICE_LOOKUP.get(amount),
      source: "Based on Roblox standard USD bundle pricing.",
    };
  }

  const nearestTier = [...ROBLOX_PRICE_LOOKUP.entries()].reduce((closest, current) => {
    const currentDistance = Math.abs(current[0] - amount);
    const closestDistance = Math.abs(closest[0] - amount);
    return currentDistance < closestDistance ? current : closest;
  });

  const [tierAmount, tierPrice] = nearestTier;
  return {
    price: amount * (tierPrice / tierAmount),
    source: `Estimated from standard Roblox USD bundle pricing using the ${formatNumber(tierAmount)} Robux tier.`,
  };
}

function formatDifference(marketPrice, ourPrice) {
  const diff = marketPrice - ourPrice;
  if (!Number.isFinite(diff)) {
    return "Not available";
  }

  const percent = marketPrice > 0 ? (Math.abs(diff) / marketPrice) * 100 : 0;
  if (diff > 0) {
    return `${formatCurrency(diff)} saved (${percent.toFixed(2)}%)`;
  }

  if (diff < 0) {
    return `${formatCurrency(Math.abs(diff))} above market (${percent.toFixed(2)}%)`;
  }

  return "No difference";
}

function buildErrorEmbed(config, description) {
  return new EmbedBuilder()
    .setColor(0xed4245)
    .setDescription(description)
    .setFooter({ text: "Pending | pending.cc" })
    .setTimestamp();
}

module.exports = {
  name: "robux",
  description: "Calculate robux pricing.",
  data: new SlashCommandBuilder()
    .setName("robux")
    .setDescription("Calculate robux pricing")
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("Robux amount").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const message = isInteraction ? null : target;
    const client = isInteraction ? target.client : message.client;
    const guild = isInteraction ? target.guild : message.guild;
    const amount = isInteraction
      ? target.options.getInteger("amount")
      : Number(String(args[0] || "").replace(/,/g, ""));
    const config = client.getConfig(guild);

    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
      const payload = {
        embeds: [buildErrorEmbed(config, "use ,robux <amount>")],
      };
      if (isInteraction) {
        return target.reply({ ...payload, flags: 64 });
      }
      return message.reply(payload);
    }

    if (typeof config.robuxPricePer1000 !== "number" || !Number.isFinite(config.robuxPricePer1000)) {
      config.robuxPricePer1000 = DEFAULT_RATE_PER_1000;
      client.saveConfig(config, guild);
    }

    const ratePer1000 = config.robuxPricePer1000;
    const marketInfo = getEstimatedMarketPrice(amount);
    const marketPrice = marketInfo.price;
    const ourPrice = amount / 1000 * ratePer1000;
    const embedColor = Number.isFinite(config.embedColor) ? config.embedColor : 15548997;
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle("Robux Price Calculator")
      .addFields(
        { name: "Robux Amount", value: formatNumber(amount), inline: true },
        { name: "Market Price", value: formatCurrency(marketPrice), inline: true },
        { name: "Our Price", value: formatCurrency(ourPrice), inline: true },
        { name: "Difference / Savings", value: formatDifference(marketPrice, ourPrice), inline: false },
        { name: "Pricing Source", value: marketInfo.source, inline: false }
      )
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (isInteraction) {
      return target.reply({ embeds: [embed], flags: 64 });
    }
    return message.reply({ embeds: [embed] });
  },
};
