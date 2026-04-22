const { SlashCommandBuilder } = require("discord.js");
const ms = require("ms");

const activeReminders = new Map();

module.exports = {
  name: "remind",
  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a reminder")
    .addStringOption(option =>
      option.setName("duration").setDescription("e.g. 10m, 1h").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("text").setDescription("Reminder text").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const user = isInteraction ? interaction.user : message.author;

    const durationInput = isInteraction
      ? interaction.options.getString("duration")
      : args[0];

    const text = isInteraction
      ? interaction.options.getString("text")
      : args.slice(1).join(" ").trim();

    if (!durationInput || !text) {
      if (isInteraction) {
        return interaction.reply({ content: "use /remind duration:<time> text:<text>", flags: 64 });
      }
      return message.reply("use ,remind <time> <text>");
    }

    const duration = ms(durationInput);
    if (!duration || duration < 1000) {
      if (isInteraction) {
        return interaction.reply({ content: "invalid duration", flags: 64 });
      }
      return message.reply("invalid duration");
    }

    const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const timeout = setTimeout(async () => {
      try {
        await user.send(`⏰ Reminder: ${text}`);
      } catch {}
      activeReminders.delete(id);
    }, duration);

    activeReminders.set(id, {
      userId: user.id,
      text,
      duration,
      createdAt: Date.now(),
      timeout,
    });

    const replyText = `reminder set | id: \`${id}\``;

    if (isInteraction) {
      return interaction.reply({ content: replyText, flags: 64 });
    }

    const replyMsg = await message.reply(replyText);
    setTimeout(() => replyMsg.delete().catch(() => {}), 5000);
  },

  activeReminders,
};
