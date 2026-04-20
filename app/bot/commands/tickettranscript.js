module.exports = {
  name: "tickettranscript",

  async execute(target) {
    const channel = target.channel;

    if (!channel || !channel.name.startsWith("ticket-")) {
      return target.reply("not a ticket");
    }

    const messages = await channel.messages.fetch({ limit: 100 });

    const transcript = [...messages.values()]
      .reverse()
      .map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`)
      .join("\n")
      .slice(0, 1900);

    if (!transcript) return target.reply("no messages");

    await target.reply(`\`\`\`\n${transcript}\n\`\`\``);
  },
};