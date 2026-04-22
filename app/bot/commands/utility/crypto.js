const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

function formatUsd(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$0.00";

  const maximumFractionDigits =
    amount >= 1000 ? 2 : amount >= 1 ? 4 : amount >= 0.01 ? 6 : 8;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(amount);
}

function formatPercent(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not available";
  const sign = amount > 0 ? "+" : "";
  return `${sign}${amount.toFixed(2)}%`;
}

function buildErrorEmbed(config, description) {
  return new EmbedBuilder()
    .setColor(0xed4245)
    .setDescription(description)
    .setFooter({ text: "Pending | pending.cc" })
    .setTimestamp();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data?.status?.error_message || data?.error || `request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

async function resolveCoin(symbol) {
  const query = encodeURIComponent(symbol);
  const searchData = await fetchJson(`${COINGECKO_API_BASE}/search?query=${query}`);
  if (!Array.isArray(searchData?.coins)) {
    return null;
  }

  const normalizedSymbol = symbol.toLowerCase();

  return (
    searchData.coins.find((coin) => String(coin?.symbol || "").toLowerCase() === normalizedSymbol) ||
    null
  );
}

module.exports = {
  name: "crypto",
  description: "Look up a crypto price.",
  data: new SlashCommandBuilder()
    .setName("crypto")
    .setDescription("Look up a crypto price")
    .addStringOption((option) =>
      option.setName("symbol").setDescription("Crypto symbol").setRequired(true)
    )
    .addNumberOption((option) =>
      option.setName("amount").setDescription("Optional amount").setRequired(false)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const message = isInteraction ? null : target;
    const symbol = String(
      isInteraction ? target.options.getString("symbol") : args[0] || ""
    ).trim().toLowerCase();
    const rawAmount = isInteraction ? target.options.getNumber("amount") : args[1];
    const config = (isInteraction ? target.client : message.client).getConfig(
      isInteraction ? target.guild : message.guild
    );

    if (!symbol) {
      const payload = {
        embeds: [buildErrorEmbed(config, "use ,crypto <symbol> [amount]")],
      };
      if (isInteraction) {
        return target.reply({ ...payload, flags: 64 });
      }
      return message.reply(payload);
    }

    let amount = null;
    if (typeof rawAmount !== "undefined") {
      amount = Number(String(rawAmount).replace(/,/g, ""));
      if (!Number.isFinite(amount) || amount <= 0) {
        const payload = {
          embeds: [buildErrorEmbed(config, "invalid amount. use ,crypto <symbol> [amount]")],
        };
        if (isInteraction) {
          return target.reply({ ...payload, flags: 64 });
        }
        return message.reply(payload);
      }
    }

    try {
      const coin = await resolveCoin(symbol);
      if (!coin?.id) {
        const payload = {
          embeds: [buildErrorEmbed(config, "invalid crypto symbol")],
        };
        if (isInteraction) {
          return target.reply({ ...payload, flags: 64 });
        }
        return message.reply(payload);
      }

      const marketData = await fetchJson(
        `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${encodeURIComponent(coin.id)}`
      );
      const market = Array.isArray(marketData) ? marketData[0] || null : null;

      if (!market) {
        const payload = {
          embeds: [buildErrorEmbed(config, "invalid crypto symbol")],
        };
        if (isInteraction) {
          return target.reply({ ...payload, flags: 64 });
        }
        return message.reply(payload);
      }

      const change = Number(market.price_change_percentage_24h);
      const embedColor = Number.isFinite(config.embedColor) ? config.embedColor : 15548997;
      const color = Number.isFinite(change)
        ? change >= 0
          ? 0x57f287
          : 0xed4245
        : embedColor;

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${market.name} Price`)
        .addFields(
          { name: "Coin Name", value: market.name || coin.name || "Unknown", inline: true },
          { name: "Symbol", value: String(market.symbol || symbol).toUpperCase(), inline: true },
          { name: "Current USD Price", value: formatUsd(market.current_price), inline: true },
          { name: "24h Change", value: formatPercent(market.price_change_percentage_24h), inline: true }
        )
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      if (amount !== null) {
        embed.addFields({
          name: "Total USD Value",
          value: formatUsd(Number(market.current_price) * amount),
          inline: true,
        });
      }

      if (market.image) {
        embed.setThumbnail(market.image);
      }

      if (isInteraction) {
        return target.reply({ embeds: [embed], flags: 64 });
      }
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("crypto command failed:", error);
      const payload = {
        embeds: [buildErrorEmbed(config, "failed to fetch crypto price")],
      };
      if (isInteraction) {
        return target.reply({ ...payload, flags: 64 });
      }
      return message.reply(payload);
    }
  },
};
