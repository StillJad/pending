module.exports = {
  name: "clear",
  async execute(message, args) {
    const amount = parseInt(args[0]);

    if (!amount || amount < 1 || amount > 100) {
      return message.reply("give number 1-100");
    }

    await message.channel.bulkDelete(amount, true);
    message.reply(`deleted ${amount}`).then(m => setTimeout(() => m.delete(), 2000));
  },
};