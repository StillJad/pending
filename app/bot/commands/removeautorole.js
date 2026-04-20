module.exports = {
  name: "removeautorole",

  async execute(target) {
    const config = target.client.getConfig();
    config.autorole = null;
    target.client.saveConfig(config);

    if (target.reply) {
      return target.reply("autorole removed");
    }

    target.channel.send("autorole removed");
  },
};