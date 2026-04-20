module.exports = {
  name: "ticketrename",

  async execute(target, args = []) {
    const channel = target.channel;

    if (!channel || !channel.name.startsWith("ticket-")) {
      return target.reply("not a ticket");
    }

    const newName = args.join("-").toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!newName) return target.reply("give new name");

    await channel.setName(`ticket-${newName}`).catch(() => {});
    await target.reply(`renamed to ${channel.name}`);
  },
};