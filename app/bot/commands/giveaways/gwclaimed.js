const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const giveawaysPath = path.join(__dirname, "../../data/giveaways.json");

function getGiveaways() {
  if (!fs.existsSync(giveawaysPath)) return [];
  return JSON.parse(fs.readFileSync(giveawaysPath, "utf8"));
}

function saveGiveaways(data) {
  fs.writeFileSync(giveawaysPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "gwclaimed",
  description: "Mark a giveaway as claimed.",
  data: new SlashCommandBuilder()
    .setName("gwclaimed")
    .setDescription("Mark a giveaway as claimed")
    .addStringOption((option) =>
      option.setName("id").setDescription("Giveaway ID or message ID").setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("Claiming user").setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const message = isInteraction ? null : target;
    const guild = isInteraction ? target.guild : message.guild;

    try {
      const id = isInteraction ? target.options.getString("id") : args[0];
      const user = isInteraction ? target.options.getUser("user") : message.mentions.users.first();

      if (!id || !user) {
        if (isInteraction) {
          return target.reply({ content: "provide a giveaway id and user", flags: 64 });
        }
        return message.reply("usage: ,gwclaimed <giveawayId|messageId> @user");
      }

      const giveaways = getGiveaways();

      const giveaway = giveaways.find(
        (g) => g.giveawayId === id || g.messageId === id
      );

      if (!giveaway) {
        if (isInteraction) {
          return target.reply({ content: "invalid giveaway id", flags: 64 });
        }
        return message.reply("invalid giveaway id");
      }

      if (giveaway.claimed) {
        if (isInteraction) {
          return target.reply({ content: "already claimed", flags: 64 });
        }
        return message.reply("already claimed");
      }

      giveaway.claimed = true;
      giveaway.winner = user.id;
      giveaway.claimedAt = Date.now();

      saveGiveaways(giveaways);

      try {
        const channel = await guild.channels.fetch(giveaway.channelId).catch(() => null);

        if (channel && channel.isTextBased()) {
          const giveawayMessage = await channel.messages.fetch(giveaway.messageId).catch(() => null);

          if (giveawayMessage && giveawayMessage.embeds.length > 0) {
            const oldEmbed = giveawayMessage.embeds[0];
            const EmbedBuilder = require("discord.js").EmbedBuilder;

            const updatedEmbed = EmbedBuilder.from(oldEmbed)
              .setTitle("🎉 Giveaway Claimed")
              .setFields(
                ...oldEmbed.fields.filter((field) => field.name !== "Winner" && field.name !== "Claimed by"),
                {
                  name: "Claimed by",
                  value: `<@${user.id}>`,
                  inline: false,
                }
              )
              .setFooter({ text: "Giveaway claimed | Pending.cc" })
              .setTimestamp();

            await giveawayMessage.edit({ embeds: [updatedEmbed] });
          }
        }
      } catch (editErr) {
        console.error("gwclaimed message update failed:", editErr);
      }

      const text = `giveaway \`${giveaway.giveawayId || giveaway.messageId}\` claimed by ${user}`;
      if (isInteraction) {
        return target.reply({ content: text, flags: 64 });
      }
      return message.reply(text);
    } catch (err) {
      console.error("gwclaimed failed:", err);
      if (isInteraction) {
        return target.reply({ content: "failed to mark giveaway", flags: 64 });
      }
      return message.reply("failed to mark giveaway");
    }
  },
};
