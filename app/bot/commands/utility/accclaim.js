const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const database = require("../../lib/database");
const configStore = require("../../lib/config");
const { isStaff } = require("../../lib/utils/permissions");
const {
  findGiveawayByLookup,
  normalizeGiveawayId,
} = require("../../lib/giveaways");
const { getMessageFromLink } = require("../../lib/utils/messages");

async function fetchOrderById(orderId) {
  const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";
  const response = await fetch(
    `${baseUrl}/api/order/${encodeURIComponent(String(orderId || "").trim())}`
  );

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || !data.success || !data.order) {
    throw new Error(data.error || "order not found");
  }

  database.upsertOrder(data.order);
  return data.order;
}

function getField(embed, name) {
  return embed?.fields?.find((field) => field.name === name) || null;
}

function isDeliveryEmbed(embed) {
  return !!(getField(embed, "Email") && getField(embed, "Password"));
}

function getDeliveryClaimInfoFromEmbed(embed) {
  if (!isDeliveryEmbed(embed)) return null;

  const serviceField = getField(embed, "Service");
  const emailField = getField(embed, "Email");
  const passwordField = getField(embed, "Password");
  const claimedByField = getField(embed, "Claimed by");
  const deliveredByField = getField(embed, "Delivered by");

  return {
    service: serviceField?.value || "Unknown",
    email: emailField?.value ? String(emailField.value).replace(/`/g, "") : "Unknown",
    password: passwordField?.value
      ? String(passwordField.value).replace(/`/g, "")
      : "Unknown",
    claimedBy: claimedByField?.value || "Unclaimed",
    deliveredBy: deliveredByField?.value || "Not delivered",
  };
}

function addUserOrderHistoryEntry(userId, entry) {
  const config = configStore.getConfig();

  if (!config.userOrderHistory || typeof config.userOrderHistory !== "object") {
    config.userOrderHistory = {};
  }

  if (!Array.isArray(config.userOrderHistory[userId])) {
    config.userOrderHistory[userId] = [];
  }

  const targetId = String(entry.targetId || "").trim();
  const email = String(entry.email || "").trim().toLowerCase();
  const exists = config.userOrderHistory[userId].some(
    (item) =>
      String(item.targetId || "").trim() === targetId &&
      String(item.email || "").trim().toLowerCase() === email
  );

  if (exists) {
    return false;
  }

  config.userOrderHistory[userId].push({
    ...entry,
    targetId,
    linkedAt: Date.now(),
  });

  configStore.saveConfig(config);
  return true;
}

async function fetchTargetMessage(target, messageInput) {
  const messageLink = String(messageInput || "").trim();

  if (messageLink) {
    const message = await getMessageFromLink(target.client, messageLink);
    if (!message) {
      throw new Error("message not found");
    }

    return message;
  }

  if (target.isChatInputCommand && target.isChatInputCommand()) {
    const message = await target.client.getRepliedMessage(target);
    if (!message) {
      throw new Error("provide a message link or reply to a delivery embed");
    }

    return message;
  }

  if (!target.reference?.messageId || !target.channel?.isTextBased()) {
    throw new Error("reply to a delivery embed first");
  }

  const message = await target.channel.messages.fetch(target.reference.messageId).catch(() => null);
  if (!message) {
    throw new Error("could not read the replied message");
  }

  return message;
}

module.exports = {
  name: "accclaim",
  description: "Link a delivered account to an order or giveaway.",
  data: new SlashCommandBuilder()
    .setName("accclaim")
    .setDescription("Link a delivered account to an order or giveaway")
    .addStringOption((option) =>
      option
        .setName("target_id")
        .setDescription("Order ID or giveaway ID")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Delivery embed message link, or leave blank if replying")
        .setRequired(false)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;

    if (isInteraction) {
      await target.deferReply({ flags: 64 });
    }

    if (!isStaff(target.member, target.client, target.guild)) {
      if (isInteraction) {
        return target.editReply({ content: "staff only" });
      }
      return target.reply("staff only");
    }

    const rawTargetId = isInteraction
      ? target.options.getString("target_id")
      : args[0];
    const messageInput = isInteraction
      ? target.options.getString("message") || ""
      : args.slice(1).join(" ").trim();
    const normalizedTargetId = String(rawTargetId || "").trim();

    if (!normalizedTargetId) {
      if (isInteraction) {
        return target.editReply({ content: "invalid order or giveaway id" });
      }
      return target.reply("use ,accclaim <orderId|giveawayId> [message link] while replying to a delivery embed");
    }

    let targetMessage;
    try {
      targetMessage = await fetchTargetMessage(target, messageInput);
    } catch (error) {
      if (isInteraction) {
        return target.editReply({ content: error.message });
      }
      return target.reply(error.message);
    }

    if (!targetMessage.embeds?.length) {
      if (isInteraction) {
        return target.editReply({ content: "that message has no embed" });
      }
      return target.reply("that message has no embed");
    }

    const embed = targetMessage.embeds[0];
    if (!isDeliveryEmbed(embed)) {
      if (isInteraction) {
        return target.editReply({ content: "that is not a delivery embed" });
      }
      return target.reply("that is not a delivery embed");
    }

    const claimInfo = getDeliveryClaimInfoFromEmbed(embed);
    if (!claimInfo) {
      if (isInteraction) {
        return target.editReply({
          content: "failed to read account info from that embed",
        });
      }
      return target.reply("failed to read account info from that embed");
    }

    let order = null;
    let giveaway = null;
    let targetType = "order";

    try {
      order = await fetchOrderById(normalizedTargetId);
    } catch {
      giveaway = findGiveawayByLookup(normalizedTargetId);
      targetType = "giveaway";
    }

    if (!order && !giveaway) {
      if (isInteraction) {
        return target.editReply({ content: "invalid order or giveaway id" });
      }
      return target.reply("invalid order or giveaway id");
    }

    const targetId = order
      ? order.order_id
      : giveaway.giveawayId || giveaway.messageId || normalizeGiveawayId(normalizedTargetId);

    const ownerId = order?.discord_user_id || giveaway?.winner || giveaway?.winnerId || null;
    if (!ownerId) {
      if (isInteraction) {
        return target.editReply({
          content: "that order or giveaway has no linked user yet",
        });
      }
      return target.reply("that order or giveaway has no linked user yet");
    }

    const saved = addUserOrderHistoryEntry(ownerId, {
      targetId,
      type: targetType,
      service: claimInfo.service,
      email: claimInfo.email,
      password: claimInfo.password,
      claimedBy: claimInfo.claimedBy,
      deliveredBy: claimInfo.deliveredBy,
      messageId: targetMessage.id,
      channelId: targetMessage.channel.id,
    });

    if (!saved) {
      if (isInteraction) {
        return target.editReply({ content: "that account is already linked" });
      }
      return target.reply("that account is already linked");
    }

    const config = configStore.getConfig(target.guild);
    const successEmbed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle("Account Linked")
      .addFields(
        {
          name: "Target",
          value: order
            ? `Order ${order.order_id}`
            : `Giveaway ${giveaway.giveawayId || giveaway.messageId}`,
          inline: true,
        },
        { name: "User", value: `<@${ownerId}>`, inline: true },
        { name: "Service", value: claimInfo.service, inline: true },
        { name: "Email", value: claimInfo.email, inline: false },
        { name: "Claimed by", value: claimInfo.claimedBy, inline: true },
        { name: "Delivered by", value: claimInfo.deliveredBy, inline: true }
      )
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    if (isInteraction) {
      return target.editReply({
        content: "linked account to user",
        embeds: [successEmbed],
      });
    }

    return target.reply({
      content: "linked account to user",
      embeds: [successEmbed],
    });
  },
};
