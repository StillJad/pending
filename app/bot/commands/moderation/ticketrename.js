const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ticketrename",
  description: "Rename a ticket channel.",
  data: new SlashCommandBuilder()
    .setName("ticketrename")
    .setDescription("Rename the current ticket channel")
    .addStringOption((option) =>
      option.setName("name").setDescription("New ticket name").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const channel = target.channel;

    if (!channel || !channel.name.startsWith("ticket-")) {
      if (isInteraction) {
        return target.reply({ content: "not a ticket", flags: 64 });
      }
      return target.reply("not a ticket");
    }

    if (!target.client.isStaff(target.member, target.guild)) {
      if (isInteraction) {
        return target.reply({ content: "staff only", flags: 64 });
      }
      return target.reply("staff only");
    }

    const rawName = (
      isInteraction ? target.options.getString("name") : args.join(" ")
    ).trim();
    if (!rawName) {
      if (isInteraction) {
        return target.reply({ content: "give new name", flags: 64 });
      }
      return target.reply("give new name");
    }

    const sanitizedName = rawName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (!sanitizedName) {
      if (isInteraction) {
        return target.reply({ content: "invalid name", flags: 64 });
      }
      return target.reply("invalid name");
    }

    const finalName = `ticket-${sanitizedName}`.slice(0, 100);

    await channel.setName(finalName);

    if (isInteraction) {
      return target.reply({ content: `renamed to ${finalName}`, flags: 64 });
    }

    return target.reply(`renamed to ${finalName}`);
  },
};
