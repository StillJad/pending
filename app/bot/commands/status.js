module.exports = {
  name: "status",
  async execute(message, args) {
    const status = args[0];
    if (!status) return message.reply("give status");

    message.reply(`status set to ${status}`);
  },
};