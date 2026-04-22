const { SlashCommandBuilder } = require("discord.js");
const { isStaff } = require("../../lib/utils/permissions");

function parseHexColor(input) {
  const raw = String(input || "").trim();
  if (!/^#?[0-9a-fA-F]{6}$/.test(raw)) {
    return null;
  }

  const hex = raw.replace(/^#/, "").toLowerCase();
  return {
    hex,
    value: parseInt(hex, 16),
  };
}

module.exports = {
  name: "embedcolor",
  description: "Set the default embed color.",
  data: new SlashCommandBuilder()
    .setName("embedcolor")
    .setDescription("Set the default embed color")
    .addStringOption((option) =>
      option
        .setName("hex")
        .setDescription("Hex color like #ff0000 or ff0000")
        .setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const message = isInteraction ? null : target;
    const client = isInteraction ? target.client : message.client;
    const guild = isInteraction ? target.guild : message.guild;
    const member = isInteraction ? target.member : message.member;

    if (isInteraction) {
      await target.deferReply({ flags: 64 });
    }

    if (!isStaff(member, client, guild)) {
      if (isInteraction) {
        return target.editReply({ content: "staff only" });
      }
      return message.reply("staff only");
    }

    const parsed = parseHexColor(
      isInteraction ? target.options.getString("hex") : args[0]
    );

    if (!parsed) {
      if (isInteraction) {
        return target.editReply({ content: "invalid hex color" });
      }
      return message.reply("invalid hex color");
    }

    const config = client.getConfig(guild);
    config.embedColor = parsed.value;
    client.saveConfig(config, guild);

    const content = `embed color set to #${parsed.hex}`;
    if (isInteraction) {
      return target.editReply({ content });
    }
    return message.reply(content);
  },
};
