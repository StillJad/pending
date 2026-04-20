module.exports = {
  name: "ticketunclaim",

  async execute(target) {
    const channel = target.channel;

    if (!channel || !channel.name.startsWith("ticket-")) {
      return target.reply("not a ticket");
    }

    await target.reply("ticket unclaimed");
  },
};