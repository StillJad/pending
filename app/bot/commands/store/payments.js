const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const PAYMENT_METHODS = [
  { name: "BTC", value: "btc" },
  { name: "ETH", value: "eth" },
  { name: "LTC", value: "ltc" },
  { name: "USDT", value: "usdt" },
  { name: "SOL", value: "sol" },
  { name: "PayPal", value: "paypal" },
];

module.exports = {
  name: "payments",
  description: "Show or update configured payment methods.",
  data: new SlashCommandBuilder()
    .setName("payments")
    .setDescription("Show or update configured payment methods")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("show")
        .setDescription("Show a configured payment value")
        .addStringOption((option) =>
          option
            .setName("method")
            .setDescription("Payment method")
            .setRequired(true)
            .addChoices(...PAYMENT_METHODS)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set a configured payment value")
        .addStringOption((option) =>
          option
            .setName("method")
            .setDescription("Payment method")
            .setRequired(true)
            .addChoices(...PAYMENT_METHODS)
        )
        .addStringOption((option) =>
          option
            .setName("value")
            .setDescription("Wallet or account value")
            .setRequired(true)
        )
    ),

  async execute(target, args = [], cmd = "") {
    const isInteraction = !!target.isChatInputCommand;
    const message = isInteraction ? null : target;
    const config = (isInteraction ? target.client : message.client).getConfig(
      isInteraction ? target.guild : message.guild
    );

    const setMap = {
      btcset: "btc",
      ethset: "eth",
      ltcset: "ltc",
      usdtset: "usdt",
      solset: "sol",
      paypalset: "paypal",
    };

    const showMap = {
      btc: "btc",
      eth: "eth",
      ltc: "ltc",
      usdt: "usdt",
      sol: "sol",
      paypal: "paypal",
    };

    if (isInteraction) {
      const subcommand = target.options.getSubcommand();
      const method = target.options.getString("method");

      if (subcommand === "show") {
        return target.reply({
          content: config.payments[method] || "not set",
          flags: 64,
        });
      }

      if (!target.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return target.reply({ content: "no perms", flags: 64 });
      }

      const value = target.options.getString("value");
      config.payments[method] = value;
      target.client.saveConfig(config, target.guild);
      return target.reply({ content: `${method} set`, flags: 64 });
    }

    if (setMap[cmd]) {
      if (!message.member.permissions.has("Administrator"))
        return message.reply("no perms");

      const value = args.join(" ");
      if (!value) return message.reply("provide value");

      config.payments[setMap[cmd]] = value;
      message.client.saveConfig(config, message.guild);

      return message.reply(`${setMap[cmd]} set`);
    }

    if (showMap[cmd]) {
      const val = config.payments[showMap[cmd]];
      return message.reply(val || "not set");
    }
  },
};
