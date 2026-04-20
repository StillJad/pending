module.exports = {
  name: "serverinfo",
  async execute(message) {
    const guild = message.guild;

    message.reply(
      `server: ${guild.name}\nmembers: ${guild.memberCount}`
    );
  },
};