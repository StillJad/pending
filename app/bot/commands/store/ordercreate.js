const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

const sellersRoleId = process.env.DISCORD_SELLERS_ROLE_ID || "";
const ticketCategoryId = process.env.DISCORD_TICKET_CATEGORY_ID || "";

function isStaff(member, client) {
  const config = client.getConfig ? client.getConfig() : {};
  const adminRoleId = config.adminRoleId || "";

  return (
    member.permissions?.has(PermissionFlagsBits.Administrator) ||
    (adminRoleId && member.roles?.cache?.has(adminRoleId))
  );
}

function normalizeTicketChannelName(username) {
  return `ticket-${username}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function buildTicketTopic({ opener, order, status = "pending", claimed = null }) {
  const parts = [];
  if (opener) parts.push(`opener:${opener}`);
  if (order) parts.push(`order:${order}`);
  if (claimed) parts.push(`claimed:${claimed}`);
  if (status) parts.push(`status:${status}`);
  return parts.join(" | ").slice(0, 1024);
}

async function createManualOrderTicket(guild, user, orderId, product, total, paymentMethod) {
  const permissionOverwrites = [
    {
      id: guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  if (sellersRoleId) {
    permissionOverwrites.push({
      id: sellersRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    });
  }

  const channel = await guild.channels.create({
    name: normalizeTicketChannelName(`${user.username}-${orderId}`),
    type: ChannelType.GuildText,
    parent: ticketCategoryId || null,
    permissionOverwrites,
    topic: `opener:${user.id} | order:${orderId} | status:pending`,
  });

  const sellersMention = sellersRoleId ? `<@&${sellersRoleId}>\n` : "";
  const paymentText = paymentMethod || "not set";

  await channel.send(
    `${sellersMention}manual order ticket created for ${user}\norder id: \`${orderId}\`\nproduct: **${product}**\ntotal: **${total}**\npayment: **${paymentText}**`
  );

  return channel;
}

async function createOrder(client, user, product, total, paymentMethod, createdBy) {
  const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.INTERNAL_BOT_API_KEY
        ? { "x-internal-bot-key": process.env.INTERNAL_BOT_API_KEY }
        : {}),
    },
   body: JSON.stringify({
  discord_user_id: user.id,
  discord_username: user.username,
  product,
  total,
  payment_method,
}),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("invalid API response");
  }

  if (!response.ok || !data.success || !data.orderId) {
    throw new Error(data.error || "failed to create order");
  }

  return data.orderId;
}

module.exports = {
  name: "ordercreate",
  description: "Create an order manually.",
  data: new SlashCommandBuilder()
    .setName("ordercreate")
    .setDescription("Create an order manually")
    .addUserOption((option) =>
      option
        .setName("customer")
        .setDescription("Customer")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("product")
        .setDescription("Product name")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("total")
        .setDescription("Total amount")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("payment_method")
        .setDescription("Payment method")
        .setRequired(false)
        .addChoices(
          { name: "BTC", value: "btc" },
          { name: "ETH", value: "eth" },
          { name: "LTC", value: "ltc" },
          { name: "USDT", value: "usdt" },
          { name: "SOL", value: "sol" },
          { name: "PayPal", value: "paypal" }
        )
    ),

  async execute(ctx, args = []) {
    const isInteraction = !!ctx.isChatInputCommand;
    const message = isInteraction ? null : ctx;
    const interaction = isInteraction ? ctx : null;
    const member = isInteraction ? interaction.member : message.member;
    const client = isInteraction ? interaction.client : message.client;
    const guild = isInteraction ? interaction.guild : message.guild;
    const channel = isInteraction ? interaction.channel : message.channel;
    const author = isInteraction ? interaction.user : message.author;

    if (!isStaff(member, client)) {
      if (isInteraction) {
        return interaction.reply({ content: "staff only", flags: 64 });
      }
      return message.reply("<:remake:1495128909132595240> staff only");
    }

    let targetUser;
    let product;
    let total;
    let paymentMethod = "";

    if (isInteraction) {
      targetUser = interaction.options.getUser("customer");
      product = interaction.options.getString("product")?.trim();
      total = interaction.options.getNumber("total");
      paymentMethod = interaction.options.getString("payment_method") || "";
    } else {
      const mentionedUser = message.mentions.users.first();
      if (!mentionedUser) {
        return message.reply("use `,ordercreate @user product price [payment_method]`");
      }

      targetUser = mentionedUser;

      const filteredArgs = args.filter(
        (arg) => !/^<@!?\d+>$/.test(arg)
      );

      if (filteredArgs.length < 2 || (filteredArgs.length < 3 && ["btc", "eth", "ltc", "usdt", "sol", "paypal"].includes(filteredArgs[filteredArgs.length - 1]?.toLowerCase()))) {
        return message.reply("use `,ordercreate @user product price [payment_method]`");
      }

      const allowedPaymentMethods = ["btc", "eth", "ltc", "usdt", "sol", "paypal"];

      const lastArg = filteredArgs[filteredArgs.length - 1]?.toLowerCase();
      const secondLastArg = filteredArgs[filteredArgs.length - 2];

      if (allowedPaymentMethods.includes(lastArg)) {
        paymentMethod = lastArg;
        total = Number(secondLastArg);
        product = filteredArgs.slice(0, -2).join(" ").trim();
      } else {
        total = Number(lastArg);
        product = filteredArgs.slice(0, -1).join(" ").trim();
      }
    }

    if (!targetUser || !product || !Number.isFinite(total)) {
      const text = "use `,ordercreate @user product price [payment_method]`";
      if (isInteraction) {
        return interaction.reply({ content: text, flags: 64 });
      }
      return message.reply(text);
    }

    if (total < 0) {
      const text = "price cannot be negative";
      if (isInteraction) {
        return interaction.reply({ content: text, flags: 64 });
      }
      return message.reply(text);
    }

    try {
      if (isInteraction) {
        await interaction.deferReply({ flags: 64 });
      }
      const orderId = await createOrder(client, targetUser, product, total, paymentMethod, author);

      let ticketChannel = null;

      try {
        ticketChannel = await createManualOrderTicket(
          guild,
          targetUser,
          orderId,
          product,
          total,
          paymentMethod
        );
      } catch (ticketError) {
        console.error("failed to create linked ticket:", ticketError);
      }

      try {
        await targetUser.send(
          `Your order has been created.\nOrder ID: **${orderId}**\nProduct: **${product}**\nTotal: **${total}**\nPayment: **${paymentMethod || "not set"}**`
        );
      } catch {}

      const config = client.getConfig ? client.getConfig() : {};
      if (config.logChannelId) {
        const logChannel = guild.channels.cache.get(config.logChannelId);
        if (logChannel && logChannel.isTextBased()) {
          await logChannel.send(
            `🧾 Order created by ${author.tag} for ${targetUser.tag} | Order ID: ${orderId} | Product: ${product} | Total: ${total} | Payment: ${paymentMethod || "not set"} | Ticket: ${ticketChannel ? `<#${ticketChannel.id}>` : "failed"}`
          );
        }
      }

      const replyText = `order created for ${targetUser}\norder id: \`${orderId}\`\nproduct: ${product}\ntotal: ${total}\npayment: ${paymentMethod || "not set"}\nticket: ${ticketChannel ? `<#${ticketChannel.id}>` : "failed to create"}`;

      if (isInteraction) {
        return interaction.editReply({ content: replyText });
      }

      return channel.send(replyText);
    } catch (error) {
  console.error("ordercreate failed:", error);
  const text = `failed to create order: ${error.message || "unknown error"}`;
      if (isInteraction) {
        return interaction.editReply({ content: text });
      }
      return message.reply(text);
    }
  },
};
