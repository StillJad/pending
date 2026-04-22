const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const database = require("../../lib/database");
const {
  findGiveawayByLookup,
  fetchGiveawayMessage,
} = require("../../lib/giveaways");

function isStaff(member, client, guild) {
  if (typeof client?.isStaff === "function") {
    return client.isStaff(member, guild);
  }

  return member.permissions?.has(PermissionFlagsBits.Administrator) || false;
}

function parseDuration(input) {
  if (!input) return null;
  const match = String(input).toLowerCase().match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const value = Number(match[1]);
  const unit = match[2];
  const map = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * map[unit];
}

function upsertField(fields, name, value, inline = false) {
  const nextFields = [...fields];
  const existingIndex = nextFields.findIndex((field) => field.name === name);
  const nextField = { name, value, inline };

  if (existingIndex === -1) {
    nextFields.push(nextField);
  } else {
    nextFields[existingIndex] = nextField;
  }

  return nextFields;
}

function buildEditedEmbed(oldEmbed, giveaway) {
  let fields = [...(oldEmbed.fields || [])];
  fields = upsertField(fields, "Prize", giveaway.prize || "Not set", false);
  fields = upsertField(
    fields,
    "Ends",
    giveaway.ended ? "Ended" : `<t:${Math.floor(giveaway.endsAt / 1000)}:R>`,
    true
  );

  return EmbedBuilder.from(oldEmbed).setFields(fields).setTimestamp();
}

module.exports = {
  name: "gwedit",
  description: "Edit a giveaway prize or duration.",
  data: new SlashCommandBuilder()
    .setName("gwedit")
    .setDescription("Edit a giveaway")
    .addStringOption((option) =>
      option
        .setName("giveaway_id")
        .setDescription("Giveaway ID or message ID")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("prize")
        .setDescription("Updated prize")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("New duration like 10m, 2h, 1d")
        .setRequired(false)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;
    const interaction = isInteraction ? target : null;
    const message = isInteraction ? null : target;
    const member = isInteraction ? interaction.member : message.member;
    const guild = isInteraction ? interaction.guild : message.guild;
    const client = isInteraction ? interaction.client : message.client;

    if (isInteraction) {
      await interaction.deferReply({ flags: 64 });
    }

    if (!isStaff(member, client, guild)) {
      if (isInteraction) {
        return interaction.editReply({ content: "staff only" });
      }
      return message.reply("staff only");
    }

    let input;
    let prize = "";
    let durationInput = "";

    if (isInteraction) {
      input = interaction.options.getString("giveaway_id");
      prize = interaction.options.getString("prize") || "";
      durationInput = interaction.options.getString("duration") || "";
    } else {
      input = args[0];
      const joined = args.slice(1).join(" ");
      const prizeMatch = joined.match(/(?:^|\s)prize:(.*?)(?=\s+\w+:|$)/i);
      const durationMatch = joined.match(/(?:^|\s)duration:([^\s]+)/i);
      prize = prizeMatch?.[1]?.trim() || "";
      durationInput = durationMatch?.[1]?.trim() || "";
    }

    if (!input) {
      if (isInteraction) {
        return interaction.editReply({ content: "provide a giveaway id" });
      }
      return message.reply("use `,gwedit <giveawayId> prize:<text> duration:<10m>`");
    }

    if (!prize && !durationInput) {
      if (isInteraction) {
        return interaction.editReply({ content: "provide a new prize or duration" });
      }
      return message.reply("provide a new prize or duration");
    }

    const giveaways = database.getGiveaways();
    const giveaway = findGiveawayByLookup(input);

    if (!giveaway) {
      if (isInteraction) {
        return interaction.editReply({ content: "giveaway not found" });
      }
      return message.reply("giveaway not found");
    }

    if (giveaway.ended) {
      if (isInteraction) {
        return interaction.editReply({ content: "cannot edit an ended giveaway" });
      }
      return message.reply("cannot edit an ended giveaway");
    }

    const durationMs = durationInput ? parseDuration(durationInput) : null;
    if (durationInput && !durationMs) {
      if (isInteraction) {
        return interaction.editReply({ content: "invalid duration" });
      }
      return message.reply("invalid duration");
    }

    const giveawayMessage = await fetchGiveawayMessage(guild, giveaway);
    if (!giveawayMessage || !giveawayMessage.embeds.length) {
      if (isInteraction) {
        return interaction.editReply({ content: "giveaway message not found" });
      }
      return message.reply("giveaway message not found");
    }

    const targetGiveaway = giveaways.find(
      (item) =>
        item.giveawayId === giveaway.giveawayId &&
        String(item.messageId || "") === String(giveaway.messageId || "")
    );

    if (!targetGiveaway) {
      if (isInteraction) {
        return interaction.editReply({ content: "giveaway not found" });
      }
      return message.reply("giveaway not found");
    }

    if (prize) {
      targetGiveaway.prize = prize;
    }

    if (durationMs) {
      targetGiveaway.endsAt = Date.now() + durationMs;
    }

    const updatedEmbed = buildEditedEmbed(giveawayMessage.embeds[0], targetGiveaway);
    await giveawayMessage.edit({ embeds: [updatedEmbed] });
    database.saveGiveaways(giveaways);

    const confirmationEmbed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Giveaway Updated")
      .addFields(
        {
          name: "Giveaway",
          value: targetGiveaway.giveawayId || targetGiveaway.messageId,
          inline: true,
        },
        {
          name: "Prize",
          value: targetGiveaway.prize || "Not set",
          inline: true,
        },
        {
          name: "Ends",
          value: `<t:${Math.floor(targetGiveaway.endsAt / 1000)}:R>`,
          inline: true,
        }
      )
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (isInteraction) {
      return interaction.editReply({ embeds: [confirmationEmbed] });
    }

    return message.reply({ embeds: [confirmationEmbed] });
  },
};
