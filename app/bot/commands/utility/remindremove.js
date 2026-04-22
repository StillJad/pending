const { SlashCommandBuilder } = require("discord.js");
const remindCommand = require("./remind");

module.exports = {
  name: "remindremove",
  data: new SlashCommandBuilder()
    .setName("remindremove")
    .setDescription("Remove a reminder")
    .addStringOption(option =>
      option.setName("id").setDescription("Reminder ID").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const user = isInteraction ? interaction.user : message.author;

    const id = isInteraction
      ? interaction.options.getString("id")
      : args[0];

    if (!id) {
      if (isInteraction) {
        return interaction.reply({ content: "provide a reminder id", flags: 64 });
      }
      return message.reply("use ,remindremove <id>");
    }

    const reminder = remindCommand.activeReminders.get(id);
    if (!reminder) {
      if (isInteraction) {
        return interaction.reply({ content: "reminder not found", flags: 64 });
      }
      return message.reply("reminder not found");
    }

    if (reminder.userId !== user.id) {
      if (isInteraction) {
        return interaction.reply({ content: "that reminder is not yours", flags: 64 });
      }
      return message.reply("that reminder is not yours");
    }

    clearTimeout(reminder.timeout);
    remindCommand.activeReminders.delete(id);

    if (isInteraction) {
      return interaction.reply({ content: `removed reminder ${id}`, flags: 64 });
    }

    const replyMsg = await message.reply(`removed reminder ${id}`);
    setTimeout(() => replyMsg.delete().catch(() => {}), 4000);
  },
};
