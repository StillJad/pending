module.exports = {
  name: "ticketinfo",

  async execute(target) {
    const channel = target.channel;

    if (!channel || !channel.name.startsWith("ticket-")) {
      return target.reply("not a ticket");
    }

    await target.reply(
      `ticket: ${channel.name}\nid: ${channel.id}\ncreated: <t:${Math.floor(channel.createdTimestamp / 1000)}:F>`
    );
  },
};