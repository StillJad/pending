module.exports = {
  name: "payments",

  async execute(message, args = [], cmd = "") {
    const config = message.client.getConfig();

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

    if (setMap[cmd]) {
      if (!message.member.permissions.has("Administrator"))
        return message.reply("no perms");

      const value = args.join(" ");
      if (!value) return message.reply("provide value");

      config.payments[setMap[cmd]] = value;
      message.client.saveConfig(config);

      return message.reply(`${setMap[cmd]} set`);
    }

    if (showMap[cmd]) {
      const val = config.payments[showMap[cmd]];
      return message.reply(val || "not set");
    }
  },
};