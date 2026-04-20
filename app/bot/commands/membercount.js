module.exports = {
  name: "membercount",

  async execute(target) {
    const count = target.guild.memberCount;

    if (target.reply) {
      return target.reply(`Members: ${count}`);
    }

    target.channel.send(`Members: ${count}`);
  },
};