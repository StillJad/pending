module.exports = {
  name: "ticketclaim",

  async execute(target) {
    const channel = target.channel;

    if (!channel || !channel.name.startsWith("ticket-")) {
      return target.reply("not a ticket");
    }

    await target.reply(`claimed by ${target.author || target.user}`);
  },
};