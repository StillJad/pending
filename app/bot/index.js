require("dotenv").config();
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  AttachmentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const fs = require("fs");
const path = require("path");
const database = require("./lib/database");
const {
  getMessageFromLink,
  getRepliedMessage,
} = require("./lib/utils/messages");

const token = process.env.DISCORD_TOKEN?.trim();
const prefix = process.env.PREFIX || ",";
const configPath = path.join(__dirname, "data", "config.json");
const configBackupPath = path.join(__dirname, "data", "config.backup.json");

const DEFAULT_CONFIG = {
  autorole: null,
  adminRoleId: "",
  logChannelId: "",
  welcomeChannelId: "",
  welcomeMessage: "Welcome {user} to {server}!",
  welcomeTitle: "Welcome to {server}",
  welcomeThumbnail: "avatar",
  ticketBlacklist: [],
  payments: {
    btc: "",
    eth: "",
    ltc: "",
    usdt: "",
    sol: "",
    paypal: "",
  },
  statusChannelId: "",
  statusMessageId: "",
  trackedStatusUserIds: [],
  vouchChannelId: "",
  deliveryChannelId: "",
  saleChannelId: "",
  robuxPricePer1000: 8.5,
  usedDeliveryIdentities: [],
  embedColor: 15548997,
  userOrderHistory: {},
};
const sellersRoleId = process.env.DISCORD_SELLERS_ROLE_ID || "";
const ticketCategoryId = process.env.DISCORD_TICKET_CATEGORY_ID || "";
const ticketLogChannelId = process.env.DISCORD_TICKET_LOG_CHANNEL_ID || "";

function ensureConfigFile() {
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }

  if (!fs.existsSync(configBackupPath)) {
    try {
      fs.copyFileSync(configPath, configBackupPath);
    } catch {}
  }
}

function sanitizeConfig(data = {}) {
  const sanitized = {
    ...DEFAULT_CONFIG,
    ...(data && typeof data === "object" ? data : {}),
    payments: {
      ...DEFAULT_CONFIG.payments,
      ...((data && data.payments) || {}),
    },
  };

  if (!Array.isArray(sanitized.ticketBlacklist)) sanitized.ticketBlacklist = [];
  if (!Array.isArray(sanitized.trackedStatusUserIds)) sanitized.trackedStatusUserIds = [];
  if (!Array.isArray(sanitized.usedDeliveryIdentities)) sanitized.usedDeliveryIdentities = [];
  if (!sanitized.userOrderHistory || typeof sanitized.userOrderHistory !== "object") {
    sanitized.userOrderHistory = {};
  }

  if (typeof sanitized.autorole === "undefined") sanitized.autorole = null;
  if (typeof sanitized.adminRoleId !== "string") sanitized.adminRoleId = "";
  if (typeof sanitized.logChannelId !== "string") sanitized.logChannelId = "";
  if (typeof sanitized.welcomeChannelId !== "string") sanitized.welcomeChannelId = "";
  if (typeof sanitized.welcomeMessage !== "string") sanitized.welcomeMessage = DEFAULT_CONFIG.welcomeMessage;
  if (typeof sanitized.welcomeTitle !== "string") sanitized.welcomeTitle = DEFAULT_CONFIG.welcomeTitle;
  if (typeof sanitized.welcomeThumbnail !== "string") sanitized.welcomeThumbnail = DEFAULT_CONFIG.welcomeThumbnail;
  if (typeof sanitized.statusChannelId !== "string") sanitized.statusChannelId = "";
  if (typeof sanitized.statusMessageId !== "string") sanitized.statusMessageId = "";
  if (typeof sanitized.vouchChannelId !== "string") sanitized.vouchChannelId = "";
  if (typeof sanitized.deliveryChannelId !== "string") sanitized.deliveryChannelId = "";
  if (typeof sanitized.saleChannelId !== "string") sanitized.saleChannelId = "";
  if (typeof sanitized.robuxPricePer1000 !== "number" || !Number.isFinite(sanitized.robuxPricePer1000)) {
    sanitized.robuxPricePer1000 = DEFAULT_CONFIG.robuxPricePer1000;
  }
  if (typeof sanitized.embedColor !== "number") sanitized.embedColor = DEFAULT_CONFIG.embedColor;

  ensureUserOrderHistory(sanitized);
  return sanitized;
}

function readConfigFile(targetPath) {
  const raw = fs.readFileSync(targetPath, "utf8");
  return sanitizeConfig(JSON.parse(raw));
}

function getConfig() {
  ensureConfigFile();

  try {
    return readConfigFile(configPath);
  } catch (error) {
    console.error("Failed to read config.json, attempting backup:", error);

    try {
      const backup = readConfigFile(configBackupPath);
      fs.writeFileSync(configPath, JSON.stringify(backup, null, 2));
      return backup;
    } catch (backupError) {
      console.error("Failed to read config backup, rebuilding defaults:", backupError);
      fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
      fs.writeFileSync(configBackupPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return sanitizeConfig(DEFAULT_CONFIG);
    }
  }
}

function saveConfig(data) {
  ensureConfigFile();

  const current = getConfig();
  const incoming = sanitizeConfig(data || {});

  const merged = sanitizeConfig({
    ...current,
    ...incoming,
    payments: {
      ...current.payments,
      ...incoming.payments,
    },
    userOrderHistory: {
      ...(current.userOrderHistory || {}),
      ...(incoming.userOrderHistory || {}),
    },
    ticketBlacklist: Array.isArray(incoming.ticketBlacklist)
      ? incoming.ticketBlacklist
      : current.ticketBlacklist,
    trackedStatusUserIds: Array.isArray(incoming.trackedStatusUserIds)
      ? incoming.trackedStatusUserIds
      : current.trackedStatusUserIds,
    usedDeliveryIdentities: Array.isArray(incoming.usedDeliveryIdentities)
      ? incoming.usedDeliveryIdentities
      : current.usedDeliveryIdentities,
  });

  const tempPath = `${configPath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(merged, null, 2));
  fs.renameSync(tempPath, configPath);
  fs.writeFileSync(configBackupPath, JSON.stringify(merged, null, 2));
}

function normalizeLinkedTargetId(value) {
  return String(value || "").trim();
}

function getDeliveryClaimInfoFromEmbed(embed) {
  if (!embed?.fields?.length) return null;

  const emailField = embed.fields.find((f) => f.name === "Email");
  const passwordField = embed.fields.find((f) => f.name === "Password");
  const serviceField = embed.fields.find((f) => f.name === "Service");
  const claimedByField = embed.fields.find((f) => f.name === "Claimed by");
  const deliveredByField = embed.fields.find((f) => f.name === "Delivered by");

  return {
    service: serviceField?.value || "Unknown",
    email: emailField?.value ? String(emailField.value).replace(/`/g, "") : "Unknown",
    password: passwordField?.value ? String(passwordField.value).replace(/`/g, "") : "Unknown",
    claimedBy: claimedByField?.value || "Unclaimed",
    deliveredBy: deliveredByField?.value || "Not delivered",
    title: embed.title || "Account Delivery",
  };
}

function ensureUserOrderHistory(config) {
  if (!config.userOrderHistory || typeof config.userOrderHistory !== "object") {
    config.userOrderHistory = {};
  }
}

function addUserOrderHistoryEntry(userId, entry) {
  const config = getConfig();
  ensureUserOrderHistory(config);

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

  if (!exists) {
    config.userOrderHistory[userId].push({
      ...entry,
      linkedAt: Date.now(),
    });
    saveConfig(config);
  }
}

function getUserOrderHistory(userId) {
  const config = getConfig();
  ensureUserOrderHistory(config);
  return Array.isArray(config.userOrderHistory[userId])
    ? config.userOrderHistory[userId]
    : [];
}

function getUsedDeliveryIdentities() {
  const config = getConfig();
  if (!Array.isArray(config.usedDeliveryIdentities)) {
    config.usedDeliveryIdentities = [];
  }
  return new Set(config.usedDeliveryIdentities.map((x) => String(x).trim().toLowerCase()));
}

function addUsedDeliveryIdentity(identity) {
  const normalized = String(identity || "").trim().toLowerCase();
  if (!normalized) return;

  const config = getConfig();
  if (!Array.isArray(config.usedDeliveryIdentities)) {
    config.usedDeliveryIdentities = [];
  }

  if (!config.usedDeliveryIdentities.includes(normalized)) {
    config.usedDeliveryIdentities.push(normalized);
    saveConfig(config);
  }
}

function getGiveaways() {
  const giveawaysPath = path.join(__dirname, "data", "giveaways.json");
  const dir = path.dirname(giveawaysPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(giveawaysPath)) {
    fs.writeFileSync(giveawaysPath, JSON.stringify([], null, 2));
    return [];
  }

  return JSON.parse(fs.readFileSync(giveawaysPath, "utf8"));
}

function findGiveawayById(id) {
  const normalizedId = normalizeLinkedTargetId(id);
  if (!normalizedId) return null;

  const giveaways = getGiveaways();
  return giveaways.find(
    (g) =>
      g.giveawayId === normalizedId ||
      g.messageId === normalizedId ||
      g.messageId === normalizedId.replace("GW-", "")
  ) || null;
}

async function generateOrderId() {
  const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/order/latest`);
  const data = await res.json();

  if (!data.success) {
    throw new Error("failed to get latest order id");
  }

  const lastId = data.order_id || "PND-9999";
  const number = parseInt(lastId.split("-")[1], 10) + 1;

  return `PND-${number}`;
}

function normalizeTicketChannelName(username) {
  return `ticket-${username}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

function sanitizeChannelSegment(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function buildTicketButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Danger)
  );
}

function buildVouchApprovalButtons(requestId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`approve_vouch:${requestId}`)
      .setLabel("Approve")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`deny_vouch:${requestId}`)
      .setLabel("Deny")
      .setStyle(ButtonStyle.Danger)
  );
}

function isStaff(member) {
  const config = getConfig();
  const effectiveAdminRoleId = config.adminRoleId || sellersRoleId;

  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    (effectiveAdminRoleId && member.roles.cache.has(effectiveAdminRoleId))
  );
}

async function createManualOrderTicket(guild, user, orderId, product, total, paymentMethod) {
  const existingChannel = guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildText &&
      channel.name.startsWith("ticket-") &&
      (channel.topic || "").includes(`opener:${user.id}`)
  );

  if (existingChannel) {
    return existingChannel;
  }

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
    name: normalizeTicketChannelName(user.username),
    type: ChannelType.GuildText,
    parent: ticketCategoryId || null,
    permissionOverwrites,
    topic: `opener:${user.id} | order:${orderId} | status:pending`,
  });

  const sellersMention = sellersRoleId ? `<@&${sellersRoleId}>` : "";
  const paymentText = paymentMethod || "not set";

  await channel.send(
    `${sellersMention ? `${sellersMention}\n` : ""}manual order ticket created for ${user}\norder id: \`${orderId}\`\nproduct: **${product}**\ntotal: **${total}**\npayment: **${paymentText}**`
  );

  return channel;
}

async function logTicketEvent(guild, message) {
  const config = getConfig();
  const effectiveLogChannelId = config.logChannelId || ticketLogChannelId;
  if (!effectiveLogChannelId) return;

  const channel = guild.channels.cache.get(effectiveLogChannelId);
  if (!channel || !channel.isTextBased()) return;

  try {
    await channel.send(message);
  } catch (error) {
    console.error("Failed to write ticket log:", error);
  }
}
function getTicketOpenerId(channel) {
  const topic = channel.topic || "";
  const match = topic.match(/(?:^|\s*\|\s*)opener:(\d+)/i);
  return match ? match[1] : null;
}

function getTicketOrderId(channel) {
  const topic = channel.topic || "";
  const match = topic.match(/(?:^|\s*\|\s*)order:([^|]+)/i);
  return match ? match[1].trim() : null;
}

// Helper to fetch order info by orderId
async function fetchOrderById(orderId) {
  const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/order/${encodeURIComponent(orderId)}`);
  const data = await response.json();

  if (!response.ok || !data.success || !data.order) {
    throw new Error(data.error || "failed to fetch order");
  }

  return data.order;
}

// Helper to update order info by orderId
async function updateOrderById(orderId, updates) {
  const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/order`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.INTERNAL_BOT_API_KEY
        ? { "x-internal-bot-key": process.env.INTERNAL_BOT_API_KEY }
        : {}),
    },
    body: JSON.stringify({
      order_id: orderId,
      ...updates,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success || !data.order) {
    throw new Error(data.error || "failed to update order");
  }

  return data.order;
}
function getTicketClaimedId(channel) {
  const topic = channel.topic || "";
  const match = topic.match(/(?:^|\s*\|\s*)claimed:(\d+)/i);
  return match ? match[1] : null;
}

function getTicketPriority(channel) {
  const topic = channel.topic || "";
  const match = topic.match(/(?:^|\s*\|\s*)priority:([a-z-]+)/i);
  return match ? match[1] : null;
}

function getTicketStatus(channel) {
  const topic = channel.topic || "";
  const match = topic.match(/(?:^|\s*\|\s*)status:([a-z-]+)/i);
  return match ? match[1] : null;
}

function getTicketNotes(channel) {
  const topic = channel.topic || "";
  const match = topic.match(/(?:^|\s*\|\s*)notes:(.*)$/i);
  return match ? match[1].trim() : null;
}

function buildTicketTopic(channel, updates = {}) {
  const opener = updates.opener !== undefined ? updates.opener : getTicketOpenerId(channel);
  const order = updates.order !== undefined ? updates.order : getTicketOrderId(channel);
  const claimed = updates.claimed !== undefined ? updates.claimed : getTicketClaimedId(channel);
  const priority = updates.priority !== undefined ? updates.priority : getTicketPriority(channel);
  const notes = updates.notes !== undefined ? updates.notes : getTicketNotes(channel);
  const status = updates.status !== undefined ? updates.status : getTicketStatus(channel);

  const parts = [];

  if (opener) parts.push(`opener:${opener}`);
  if (order) parts.push(`order:${order}`);
  if (claimed) parts.push(`claimed:${claimed}`);
  if (priority) parts.push(`priority:${priority}`);
  if (status) parts.push(`status:${status}`);
  if (notes) parts.push(`notes:${notes}`);

  return parts.join(" | ").slice(0, 1024);
}

function getSafeTranscriptFileName(channelName) {
  return `transcript-${channelName}`.replace(/[^a-z0-9-_]/gi, "-") + ".txt";
}

async function buildTranscriptText(channel) {
  const fetched = await channel.messages.fetch({ limit: 100 });

  const lines = [...fetched.values()]
    .reverse()
    .map((msg) => {
      const timestamp = new Date(msg.createdTimestamp).toISOString().replace("T", " ").replace("Z", " UTC");

      let content = msg.content?.trim() || "";

      if (msg.embeds?.length) {
        const embedText = msg.embeds
          .map((embed) => {
            const parts = [];
            if (embed.title) parts.push(`Title: ${embed.title}`);
            if (embed.description) parts.push(`Description: ${embed.description}`);
            if (embed.fields?.length) {
              parts.push(
                "Fields: " +
                  embed.fields.map((f) => `${f.name}: ${f.value}`).join(" | ")
              );
            }
            return `[Embed] ${parts.join(" ")}`.trim();
          })
          .join(" ");
        content = content ? `${content}\n${embedText}` : embedText;
      }

      if (msg.attachments?.size) {
        const attachmentText = [...msg.attachments.values()]
          .map((a) => `[Attachment] ${a.name} ${a.url}`)
          .join(" ");
        content = content ? `${content}\n${attachmentText}` : attachmentText;
      }

      if (!content) content = "[No text content]";

      return `[${timestamp}] ${msg.author.tag}: ${content}`;
    });

  return `Ticket Transcript for ${channel.name}\n\n${lines.join("\n\n")}`;
}

async function getPrimaryTicketMessage(channel) {
  const fetched = await channel.messages.fetch({ limit: 100 });

  return (
    fetched.find(
      (msg) =>
        msg.author?.id === client.user?.id &&
        msg.embeds?.length &&
        msg.embeds[0]?.title === "Purchase Ticket"
    ) || null
  );
}

async function updateTicketEmbed(channel) {
  const primaryMessage = await getPrimaryTicketMessage(channel);
  if (!primaryMessage) return;

  const openerId = getTicketOpenerId(channel);
  const status = getTicketStatus(channel) || "pending";
  const claimedId = getTicketClaimedId(channel);

 const orderId = getTicketOrderId(channel) || "Unknown";

  const updatedEmbed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle("Purchase Ticket")
    .setDescription(
      `Welcome ${openerId ? `<@${openerId}>` : "customer"}\n\n**Please Send:**\n• What You'd like to Purchase\n• Payment Method\n\n**Available payments:**\n<:crypto:1492253544789704905> BTC / ETH / LTC / USDT / SOL /<:paypal:1492253294276513993> PayPal`
    )
    .addFields(
      { name: "User", value: openerId ? `<@${openerId}>` : "Unknown", inline: true },
      { name: "Order ID", value: orderId, inline: true },
{
  name: "Status",
  value: status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" "),
  inline: true,
},
      {
        name: "Claimed by",
        value: claimedId ? `<@${claimedId}>` : "Unclaimed",
        inline: true,
      }
    )
    .setFooter({ text: "Pending | pending.cc" });

  await primaryMessage.edit({
    embeds: [updatedEmbed],
    components: [buildTicketButtons()],
  });
}

function getPresenceEmoji(status) {
  const map = {
    online: "<:verified_mlm:1495216740286599178>",
    idle: "<:verified_mlm:1495216740286599178>",
    dnd: "<:verified_mlm:1495216740286599178>",
    offline: "<:stop_mlm:1495216816371531869>",
    invisible: "<:stop_mlm:1495216816371531869>",
  };

  return map[status] || "<:stop_mlm:1495216816371531869>";
}

async function updateStatusMessage(guild) {
  const config = client.getConfig();
  if (!config.statusChannelId || !config.statusMessageId || !guild) return;

  const channel =
    guild.channels.cache.get(config.statusChannelId) ||
    (await guild.channels.fetch(config.statusChannelId).catch(() => null));

  if (!channel || !channel.isTextBased()) return;

  let message;
  try {
    message = await channel.messages.fetch(config.statusMessageId);
  } catch (error) {
    if (error?.code === 10008) {
      config.statusMessageId = "";
      client.saveConfig(config);
      console.error("Status message no longer exists. Cleared stored statusMessageId.");
      return;
    }

    console.error("Failed to fetch status message:", error);
    return;
  }

  const fields = [];

  for (const userId of config.trackedStatusUserIds) {
    const member =
      guild.members.cache.get(userId) ||
      (await guild.members.fetch(userId).catch(() => null));

    const status = member?.presence?.status || "offline";
    const emoji = getPresenceEmoji(status);

    fields.push({
      name: member?.user?.username || "Unknown",
      value: `<@${userId}>\nStatus: ${emoji} ${status}`,
      inline: false,
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle("📊 Seller Status")
    .addFields(
      fields.length
        ? fields
        : [{ name: "No tracked users", value: "Add users with ,statusadd @user", inline: false }]
    )
    .setFooter({ text: "/Pending | Pending.cc" });

  try {
    await message.edit({ embeds: [embed], content: "" });
  } catch (error) {
    if (error?.code === 10008) {
      config.statusMessageId = "";
      client.saveConfig(config);
      console.error("Status message disappeared during edit. Cleared stored statusMessageId.");
      return;
    }

    console.error("Failed to update status message:", error);
  }
}
ensureConfigFile();
const pendingVouchApprovals = new Map();
const pendingProofUploads = new Map();
const handledPrefixMessageIds = new Set();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const commands = new Collection();
client.commands = commands;
client.getConfig = getConfig;
client.saveConfig = saveConfig;
client.generateOrderId = generateOrderId;
client.isStaff = (member, guildLike = null) => isStaff(member, guildLike || member?.guild);
client.normalizeLinkedTargetId = normalizeLinkedTargetId;
client.findGiveawayById = findGiveawayById;
client.fetchOrderById = fetchOrderById;
client.updateOrderById = updateOrderById;
client.logTicketEvent = logTicketEvent;
client.getTicketOpenerId = getTicketOpenerId;
client.getTicketOrderId = getTicketOrderId;
client.getTicketClaimedId = getTicketClaimedId;
client.getTicketPriority = getTicketPriority;
client.getTicketStatus = getTicketStatus;
client.getTicketNotes = getTicketNotes;
client.buildTicketTopic = buildTicketTopic;
client.buildTicketButtons = buildTicketButtons;
client.updateTicketEmbed = updateTicketEmbed;
client.buildTranscriptText = buildTranscriptText;
client.getSafeTranscriptFileName = getSafeTranscriptFileName;
client.sanitizeChannelSegment = sanitizeChannelSegment;
client.parseAccountLine = parseAccountLine;
client.buildDeliveryEmbed = buildDeliveryEmbed;
client.isDeliveryEmbed = isDeliveryEmbed;
client.getExistingDeliveryIdentities = getExistingDeliveryIdentities;
client.getUsedDeliveryIdentities = getUsedDeliveryIdentities;
client.addUsedDeliveryIdentity = addUsedDeliveryIdentity;
client.getUserOrderHistory = getUserOrderHistory;
client.addUserOrderHistoryEntry = addUserOrderHistoryEntry;
client.updateStatusMessage = updateStatusMessage;
client.getPresenceEmoji = getPresenceEmoji;
client.pendingProofUploads = pendingProofUploads;
client.getMessageFromLink = (link) => getMessageFromLink(client, link);
client.getRepliedMessage = getRepliedMessage;

const commandsPath = path.join(__dirname, "commands");

function loadCommands(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (fs.lstatSync(fullPath).isDirectory()) {
      loadCommands(fullPath);
      continue;
    }

    if (!file.endsWith(".js")) continue;

    const command = require(fullPath);
    if (!command?.name || typeof command.execute !== "function") {
      console.warn(`Skipping invalid command file: ${fullPath}`);
      continue;
    }

    const relative = path.relative(commandsPath, fullPath);
    command.__filePath = fullPath;
    command.__category = relative.split(path.sep)[0] || "other";
    commands.set(command.name, command);
  }
}

loadCommands(commandsPath);

client.on("guildMemberAdd", async (member) => {
  const config = client.getConfig();

  if (config.autorole) {
    const role = member.guild.roles.cache.get(config.autorole);
    if (role) {
      try {
        await member.roles.add(role);
      } catch (error) {
        console.error("Failed to add autorole:", error);
      }
    }
  }

  if (config.welcomeChannelId) {
    const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (welcomeChannel && welcomeChannel.isTextBased()) {
     const welcomeText = config.welcomeMessage
  .replaceAll("{user}", `${member}`)
  .replaceAll("{username}", member.user.username)
  .replaceAll("{server}", member.guild.name)
  .replaceAll("{membercount}", member.guild.memberCount);

      try {
        const welcomeEmbed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle(
           config.welcomeTitle
          .replaceAll("{user}", `${member}`)
         .replaceAll("{username}", member.user.username)
          .replaceAll("{server}", member.guild.name)
  )
       .setDescription(welcomeText)
        .setFooter({ text: "Pending | pending.cc" });

if (config.welcomeThumbnail === "avatar") {
  welcomeEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
}

await welcomeChannel.send({ embeds: [welcomeEmbed] });

      } catch (error) {
        console.error("Failed to send welcome message:", error);
      }
    }
  }
});
client.on("presenceUpdate", async (_, newPresence) => {
  if (!newPresence?.guild || !newPresence.userId) return;

  const config = client.getConfig();
  if (!config.trackedStatusUserIds.includes(newPresence.userId)) return;

  try {
    await updateStatusMessage(newPresence.guild);
  } catch (error) {
    console.error("presenceUpdate status refresh failed:", error);
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  try {
    if (user.bot) return;

    if (reaction.partial) {
      await reaction.fetch().catch(() => null);
    }

    const msg = reaction.message;
    if (!msg || !msg.guild) return;

    const emoji = reaction.emoji.name;
    if (!["📦", "✅"].includes(emoji)) return;
    if (!msg.embeds?.length) return;

    const embed = msg.embeds[0];
    if (!isDeliveryEmbed(embed)) return;

    const member = await msg.guild.members.fetch(user.id).catch(() => null);
    if (!member || !isStaff(member)) return;

    if (emoji === "📦") {
      const alreadyClaimed =
        embed.title.endsWith(" (CLAIMED)") ||
        embed.title.endsWith(" (DELIVERED)") ||
        embed.fields?.some((f) => f.name === "Claimed by");

      if (alreadyClaimed) return;

      const baseTitle = embed.title.replace(" (CLAIMED)", "").replace(" (DELIVERED)", "");
      const updatedEmbed = EmbedBuilder.from(embed)
        .setTitle(`${baseTitle} (CLAIMED)`)
        .setFields(
          ...embed.fields.filter((f) => f.name !== "Status" && f.name !== "Claimed by"),
          { name: "Status", value: "Claimed", inline: true },
          { name: "Claimed by", value: `<@${user.id}>`, inline: true }
        )
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      await msg.edit({ embeds: [updatedEmbed] });
      await msg.react("✅").catch(() => {});
      return;
    }

    if (emoji === "✅") {
      const alreadyDelivered = embed.title.endsWith(" (DELIVERED)");
      if (alreadyDelivered) return;

      const claimedField = embed.fields?.find((f) => f.name === "Claimed by");
      if (!claimedField) return;

      const baseTitle = embed.title.replace(" (CLAIMED)", "").replace(" (DELIVERED)", "");
      const updatedEmbed = EmbedBuilder.from(embed)
        .setTitle(`${baseTitle} (DELIVERED)`)
        .setFields(
          ...embed.fields.filter((f) => f.name !== "Status" && f.name !== "Delivered by" && f.name !== "Claimed by"),
          { name: "Status", value: "Delivered", inline: true },
          claimedField,
          { name: "Delivered by", value: `<@${user.id}>`, inline: true }
        )
        .setFooter({ text: "Pending | pending.cc" })
        .setTimestamp();

      await msg.edit({ embeds: [updatedEmbed] });
    }
  } catch (error) {
    console.error("delivery reaction failed:", error);
  }
});

client.on("messageDelete", async (message) => {
  try {
    if (!message.guild || message.author?.bot) return;

    const payload = {
      authorId: message.author?.id || "Unknown",
      content: message.content || "[No content]",
      attachments: message.attachments.map((att) => att.url) || [],
      deletedAt: Date.now(),
    };

    database.setSnipedMessage(message.channel.id, payload);
  } catch (error) {
    console.error("messageDelete handler failed:", error);
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  try {
    if (!reaction.message.guild || user.bot) return;

    const emoji = reaction.emoji.name || reaction.emoji.id || reaction.emoji.toString();
    const payload = {
      emoji,
      userId: user.id,
      authorId: reaction.message.author?.id || "Unknown",
      messageContent: reaction.message.content || "[No content]",
      removedAt: Date.now(),
    };

    database.setSnipedReaction(reaction.message.channel.id, payload);
  } catch (error) {
    console.error("messageReactionRemove handler failed:", error);
  }
});

function parseAccountLine(line) {
  const parts = line.split("|").map((p) => p.trim()).filter(Boolean);

  const main = parts.shift() || "";
  const colonIndex = main.indexOf(":");

  let email = "Unknown";
  let password = "Unknown";

  if (colonIndex !== -1) {
    email = main.slice(0, colonIndex).trim() || "Unknown";
    password = main.slice(colonIndex + 1).trim() || "Unknown";
  } else {
    email = main.trim() || "Unknown";
  }

  const fields = {};
  const cookieParts = [];

  for (const part of parts) {
    const segments = part
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const segment of segments) {
      const eqIndex = segment.indexOf("=");

      if (eqIndex === -1) {
        continue;
      }

      const key = segment.slice(0, eqIndex).trim();
      const value = segment.slice(eqIndex + 1).trim();

      if (!key || !value) continue;

      if (
        ["NetflixId", "SecureNetflixId", "nfvdid", "sp_dc", "sp_key", "cookie", "cookies"].includes(key)
      ) {
        cookieParts.push(`${key}=${value}`);
      } else {
        fields[key] = value;
      }
    }
  }

  if (cookieParts.length) {
    fields["Cookies"] = cookieParts.join(";\n");
  }

  return {
    email,
    password,
    fields,
  };
}

function buildDeliveryEmbed(data, serviceType = "account") {
  const niceService =
    String(serviceType || "account")
      .trim()
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Account";

  const embed = new EmbedBuilder()
    .setColor(client.getConfig().embedColor)
    .setTitle(`${niceService} Delivery`)
    .addFields(
      { name: "Service", value: niceService, inline: true },
      { name: "Email", value: `\`${data.email}\``, inline: false },
      { name: "Password", value: `\`${data.password}\``, inline: false },
      { name: "Status", value: "Unclaimed", inline: true }
    )
    .setFooter({ text: "Pending | pending.cc" })
    .setTimestamp();

  for (const [key, value] of Object.entries(data.fields)) {
    embed.addFields({
      name: key,
      value: String(value).length > 1024 ? String(value).slice(0, 1021) + "..." : String(value),
      inline: key !== "Cookies",
    });
  }

  return embed;
}

function isDeliveryEmbed(embed) {
  if (!embed?.title) return false;

  return (
    embed.title.endsWith("Delivery") ||
    embed.title.endsWith("Delivery (CLAIMED)") ||
    embed.title.endsWith("Delivery (DELIVERED)")
  );
}

function getDeliveryIdentity(data) {
  return String(data.email || "").trim().toLowerCase();
}

async function getExistingDeliveryIdentities(channel) {
  const identities = new Set();

  try {
    const messages = await channel.messages.fetch({ limit: 100 });

    for (const msg of messages.values()) {
      if (!msg.embeds?.length) continue;

      const embed = msg.embeds[0];
      if (!isDeliveryEmbed(embed)) continue;

      const emailField = embed.fields?.find((f) => f.name === "Email");
      if (!emailField?.value) continue;

      const identity = String(emailField.value)
        .replace(/`/g, "")
        .trim()
        .toLowerCase();

      if (identity) {
        identities.add(identity);
      }
    }
  } catch (error) {
    console.error("failed to fetch existing delivery identities:", error);
  }

  return identities;
}

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

let pendingProof = pendingProofUploads.get(message.author.id);
if (pendingProof && Date.now() - pendingProof.createdAt > 10 * 60 * 1000) {
  pendingProofUploads.delete(message.author.id);
  pendingProof = null;
}
if (
  pendingProof &&
  message.attachments.size &&
  message.guild &&
  pendingProof.guildId === message.guild.id &&
  pendingProof.channelId === message.channel.id
) {
  const config = client.getConfig();
  const vouchChannel = message.guild.channels.cache.get(config.vouchChannelId);

  if (!vouchChannel || !vouchChannel.isTextBased()) {
    pendingProofUploads.delete(message.author.id);
    return message.reply("invalid vouch channel");
  }


  
    let order;
    try {
      order = await fetchOrderById(pendingProof.orderId);
      await updateOrderById(pendingProof.orderId, {
        status: "proof-submitted",
      });
    } catch (error) {
      console.error("proof fetch/update failed:", error);
      pendingProofUploads.delete(message.author.id);
      return message.reply("failed to link proof to order");
    }
    const attachment = message.attachments.first();
    if (!attachment) {
      pendingProofUploads.delete(message.author.id);
      return message.reply("no attachment found");
    }
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Proof Submitted")
      .addFields(
        { name: "Order ID", value: order.order_id || pendingProof.orderId, inline: true },
        { name: "Buyer", value: order.discord_user_id ? `<@${order.discord_user_id}>` : "Unknown", inline: true },
        { name: "Seller", value: `${message.author}`, inline: true },
        { name: "Payment", value: order.payment_method || "Not set", inline: true },
        { name: "Product", value: order.product || "Not set", inline: false },
        { name: "Channel", value: `${message.channel}`, inline: false }
      )
      .setImage(attachment.url)
      .setFooter({ text: "Pending | pending.cc" })
      .setTimestamp();

    await vouchChannel.send({ embeds: [embed] });
    try {
      const ticketChannel = message.guild.channels.cache.find(
        (c) =>
          c.type === ChannelType.GuildText &&
          (c.topic || "").includes(`order:${pendingProof.orderId}`)
      );

    if (ticketChannel) {
  await ticketChannel.setTopic(
    buildTicketTopic(ticketChannel, { status: "proof-submitted" })
  );
  await updateTicketEmbed(ticketChannel);
  await ticketChannel.send(`✅ proof was submitted by ${message.author}`);

  try {
    const newName = `ticket-proof-${pendingProof.orderId}`.toLowerCase().slice(0, 100);
    if (ticketChannel.name !== newName) {
      await ticketChannel.setName(newName);
    }
  } catch (renameErr) {
    console.error("failed to rename ticket after proof:", renameErr);
  }
  const completedCategoryId = process.env.DISCORD_COMPLETED_CATEGORY_ID;

if (completedCategoryId) {
  try {
    await ticketChannel.setParent(completedCategoryId);
  } catch (moveErr) {
    console.error("failed to move ticket after proof:", moveErr);
  }
}
    }
    } catch (err) {
      console.error("failed to sync ticket status after proof:", err);
    }
    await logTicketEvent(
  message.guild,
  `🧾 Proof submitted for order ${pendingProof.orderId} by ${message.author.tag} (${message.author.id})`
);
    pendingProofUploads.delete(message.author.id);
    await message.reply("proof sent").then((m) =>
      setTimeout(() => m.delete().catch(() => {}), 3000)
    );
    return;
  }


if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const rawCommandName = args.shift()?.toLowerCase();
  if (!rawCommandName) return;

  if (handledPrefixMessageIds.has(message.id)) return;
  handledPrefixMessageIds.add(message.id);
  try {

  console.log(`[PREFIX] ${rawCommandName} in #${message.channel.name}`);

  const channel = message.channel;

  const staffOnlyCommands = new Set([
  "ticketclose",
  "ticketrename",
  "ticketclaim",
  "ticketunclaim",
  "ticketadd",
  "ticketremove",
  "ticketmove",
  "ticketpriority",
  "tickettransfer",
  "ticketnotes",
  "ticketblacklist",
  "ticketunblacklist",
  "purge",
  "statuschannel",
  "statusadd",
  "statusremove",
  "statusmessagecreate",
  "ticketstatus",
  "paid",
  "welcomeset",
  "welcomemessage",
  "vouchchannel",
  "orderinfo",
  "adminrole",
  "logchannel",
  "ordercreate",
  "robuxsetprice",
]);

  if (staffOnlyCommands.has(rawCommandName) && !isStaff(message.member)) {
    return message.reply("<:remake:1495128909132595240> staff only");
  }

  if (rawCommandName === "welcomeset") {
    const channelMention = message.mentions.channels.first();
    if (!channelMention) return message.reply("mention a channel");

    const config = client.getConfig();
    config.welcomeChannelId = channelMention.id;
    client.saveConfig(config);

    return message.reply(`welcome channel set to ${channelMention}`);
  }

if (rawCommandName === "vouchchannel") {
  const channelMention = message.mentions.channels.first();
  if (!channelMention) return message.reply("mention a channel");

  const config = client.getConfig();
  config.vouchChannelId = channelMention.id;
  client.saveConfig(config);

  return message.reply(`vouch channel set to ${channelMention}`);
}

if (rawCommandName === "adminrole") {
  const role = message.mentions.roles.first();
  if (!role) return message.reply("mention a role");

  const config = client.getConfig();
  config.adminRoleId = role.id;
  client.saveConfig(config);

  return message.reply(`admin role set to ${role}`);
}

if (rawCommandName === "autorole") {
  const role = message.mentions.roles.first();
  if (!role) return message.reply("mention a role");

  const config = client.getConfig();
  config.autorole = role.id;
  client.saveConfig(config);

  return message.reply(`autorole set to ${role}`);
}

if (rawCommandName === "role" && args[0] === "all") {
  const action = args[1];
  const role = message.mentions.roles.first();

  if (!["add", "remove"].includes(action)) {
    return message.reply("use ,role all add/remove @role");
  }

  if (!role) {
    return message.reply("mention a role");
  }

  const members = await message.guild.members.fetch();

  let success = 0;
  let failed = 0;

  for (const member of members.values()) {
    try {
      if (action === "add") {
        if (!member.roles.cache.has(role.id)) {
          await member.roles.add(role);
          success++;
        }
      } else {
        if (member.roles.cache.has(role.id)) {
          await member.roles.remove(role);
          success++;
        }
      }
    } catch {
      failed++;
    }
  }

  return message.reply(
    `${action} ${role} → success: ${success}, failed: ${failed}`
  );
}

if (rawCommandName === "logchannel") {
  const channelMention = message.mentions.channels.first();
  if (!channelMention) return message.reply("mention a channel");

  const config = client.getConfig();
  config.logChannelId = channelMention.id;
  client.saveConfig(config);

  return message.reply(`log channel set to ${channelMention}`);
}

if (
  rawCommandName === "deliverychannel" ||
  (rawCommandName === "delivery" && (args[0] || "").toLowerCase() === "channel")
) {
  if (!isStaff(message.member)) {
    return message.reply("<:remake:1495128909132595240> staff only");
  }

  const channelMention = message.mentions.channels.first();
  if (!channelMention) return message.reply("mention a channel");

  const config = client.getConfig();
  config.deliveryChannelId = channelMention.id;
  client.saveConfig(config);

  return message.reply(`delivery channel set to ${channelMention}`);
}

  

if (rawCommandName === "forgetaccount") {
  const identity = String(args[0] || "").trim().toLowerCase();
  if (!identity) {
    return message.reply("use ,forgetaccount <email>");
  }

  const config = client.getConfig();
  if (!Array.isArray(config.usedDeliveryIdentities)) {
    config.usedDeliveryIdentities = [];
  }

  const before = config.usedDeliveryIdentities.length;
  config.usedDeliveryIdentities = config.usedDeliveryIdentities.filter((x) => x !== identity);
  saveConfig(config);

  if (config.usedDeliveryIdentities.length === before) {
    return message.reply("that account was not stored");
  }

  return message.reply(`forgot ${identity}`);
}

if (rawCommandName === "accclaim") {
  const rawTargetId = String(args[0] || "").trim();
  const targetId = normalizeLinkedTargetId(rawTargetId);
  if (!targetId) {
    return message.reply("use ,accclaim <orderId|giveawayId> while replying to a delivery embed");
  }

  // allow either a message link passed as a second arg, or a reply to the delivery embed
  const messageInput = args.slice(1).join(" ").trim();
  let targetMessage = null;

  if (messageInput) {
    targetMessage = await getMessageFromLink(client, messageInput).catch(() => null);
    if (!targetMessage) {
      return message.reply("could not find message from the provided link");
    }
  } else {
    if (!message.reference?.messageId) {
      return message.reply("reply to a delivery embed first");
    }

    targetMessage = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
    if (!targetMessage || !targetMessage.embeds?.length) {
      return message.reply("could not read the replied message");
    }
  }

  const embed = targetMessage.embeds[0];
  if (!isDeliveryEmbed(embed)) {
    return message.reply("that is not a delivery embed");
  }

  const order = await fetchOrderById(targetId).catch(() => null);
  const giveaway = order ? null : findGiveawayById(targetId);

  if (!order && !giveaway) {
    return message.reply("invalid order or giveaway id");
  }

  const claimInfo = getDeliveryClaimInfoFromEmbed(embed);
  if (!claimInfo) {
    return message.reply("failed to read account info from that embed");
  }

  const ownerId = order?.discord_user_id || giveaway?.winner || null;
  if (!ownerId) {
    return message.reply("that order or giveaway has no linked user yet");
  }

  addUserOrderHistoryEntry(ownerId, {
    targetId: order ? order.order_id : (giveaway.giveawayId || giveaway.messageId),
    type: order ? "order" : "giveaway",
    service: claimInfo.service,
    email: claimInfo.email,
    password: claimInfo.password,
    claimedBy: claimInfo.claimedBy,
    deliveredBy: claimInfo.deliveredBy,
    embedTitle: claimInfo.title,
    messageId: targetMessage.id,
    channelId: targetMessage.channel.id,
  });

  const replyMsg = await message.reply(
    `linked ${claimInfo.email} to ${order ? `order ${order.order_id}` : `giveaway ${giveaway.giveawayId || giveaway.messageId}`}`
  );
  setTimeout(() => replyMsg.delete().catch(() => {}), 5000);
  return;
}

if (rawCommandName === "userorders") {
  const targetUser = message.mentions.users.first() || message.author;
  const entries = getUserOrderHistory(targetUser.id);

  if (!entries.length) {
    return message.reply(`no order history for ${targetUser}`);
  }

  const lines = entries
    .slice(-15)
    .reverse()
    .map((entry, index) => {
      return `${index + 1}. [${entry.type || "order"}] ${entry.targetId} | Service: ${entry.service || "Unknown"} | Email: ${entry.email || "Unknown"} | Claimed by: ${entry.claimedBy || "Unclaimed"} | Delivered by: ${entry.deliveredBy || "Not delivered"}`;
    });

  return message.reply(`history for ${targetUser}:\n${lines.join("\n")}`);
}

if (rawCommandName === "deliver") {
  const config = client.getConfig();
  const serviceType = (args[0] || "").trim().toLowerCase();

  if (!serviceType) {
    return message.reply("use ,deliver <service> then paste account data");
  }

  const deliveryChannel = message.guild.channels.cache.get(config.deliveryChannelId);

  if (!deliveryChannel || !deliveryChannel.isTextBased()) {
    return message.reply("set delivery channel first using ,deliverychannel");
  }

  const rawText = message.content
    .slice(prefix.length + rawCommandName.length + 1 + serviceType.length)
    .trim();

  if (!rawText) {
    return message.reply("paste account data");
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) {
    return message.reply("no valid lines found");
  }

  const existingIdentities = await getExistingDeliveryIdentities(deliveryChannel);
  const storedIdentities = getUsedDeliveryIdentities();
  const seenInBatch = new Set();
  const skipped = [];
  const embeds = [];

  console.log("[DELIVER] raw lines:", lines.length);

  for (const line of lines) {
    try {
      const parsed = parseAccountLine(line);
      const identity = getDeliveryIdentity(parsed);

      if (!identity || identity === "unknown") {
        skipped.push(`${line} (missing identity)`);
        continue;
      }

      if (seenInBatch.has(identity)) {
        skipped.push(`${identity} (duplicate in this paste)`);
        continue;
      }

      if (existingIdentities.has(identity) || storedIdentities.has(identity)) {
        skipped.push(`${identity} (already delivered before)`);
        continue;
      }

      seenInBatch.add(identity);

      const embed = buildDeliveryEmbed(parsed, serviceType);
      embeds.push({ embed, identity });
    } catch (err) {
      console.error("failed to parse line:", line, err);
      skipped.push(`${line} (parse failed)`);
    }
  }

  if (!embeds.length) {
    const reason = skipped.length
      ? `failed to parse any accounts. skipped:\n- ${skipped.join("\n- ")}`
      : "failed to parse any accounts";
    return message.reply(reason);
  }

  for (const { embed, identity } of embeds) {
    const msg = await deliveryChannel.send({ embeds: [embed] });
    await msg.react("📦").catch(() => {});

    if (identity) {
      addUsedDeliveryIdentity(identity);
    }
  }

  let replyText = `delivered ${embeds.length} ${serviceType} item(s)`;

  if (skipped.length) {
    replyText += `\nskipped ${skipped.length} item(s):\n- ${skipped.join("\n- ")}`;
  }

  const replyMsg = await message.reply(replyText);
  setTimeout(() => replyMsg.delete().catch(() => {}), 8000);

  return;
}


  if (rawCommandName === "welcomemessage") {
  const text = args.join(" ").trim();
  if (!text) {
    return message.reply("send a message. placeholders: {user} {username} {server} {membercount}. use \\n for line breaks");
  }

  const parsedText = text
    .replaceAll("\\n", "\n")
    .replaceAll("\\t", "\t");

  const config = client.getConfig();
  config.welcomeMessage = parsedText;
  client.saveConfig(config);

  return message.reply("welcome message updated. use \\n to create new lines");
}

 if (rawCommandName === "ticketclose") {
  if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");
  const linkedOrderId = getTicketOrderId(channel);

  try {
    await message.reply("closing ticket...");

    if (linkedOrderId) {
      try {
        await updateOrderById(linkedOrderId, {
  status: "closed",
});
      } catch (error) {
        console.error("ticketclose order update failed:", error);
      }
    }

    setTimeout(() => {
      channel.delete().catch((error) => {
        console.error("ticketclose failed:", error);
      });
    }, 1500);
  } catch (error) {
    console.error("ticketclose reply failed:", error);
  }

  return;
}

if (rawCommandName === "gwinfo") {
  const id = normalizeLinkedTargetId(args[0]);
  if (!id) return message.reply("usage: ,gwinfo <giveawayId|messageId>");

  const giveaway = findGiveawayById(id);
  if (!giveaway) {
    return message.reply("invalid giveaway id");
  }

  const config = client.getConfig();
  const linkedEntries = Object.values(config.userOrderHistory || {})
    .flat()
    .filter(
      (entry) => entry.targetId === id || entry.targetId === (giveaway.giveawayId || giveaway.messageId)
    );

  const linkedAccountText = linkedEntries.length
    ? linkedEntries
        .map(
          (entry) =>
            `Service: ${entry.service || "Unknown"} | Email: ${entry.email || "Unknown"} | Claimed by: ${entry.claimedBy || "Unclaimed"} | Delivered by: ${entry.deliveredBy || "Not delivered"}`
        )
        .join("\n")
    : "none";

  return message.reply(
    `🎁 Giveaway: \`${giveaway.giveawayId || giveaway.messageId}\`\nCreated by: <@${giveaway.hostId}>\nStatus: ${giveaway.ended ? "Ended" : "Active"}\nWinner: ${giveaway.winner ? `<@${giveaway.winner}>` : "Not set"}\nLinked Account: ${linkedAccountText}`
  );
}

if (rawCommandName === "orderinfo") {
  const explicitOrderId = (args[0] || "").trim();
  const orderId = explicitOrderId || getTicketOrderId(channel);

  if (!orderId) {
    return message.reply("no order id linked to this ticket");
  }

  try {
    const order = await fetchOrderById(orderId);
    const config = client.getConfig();
    const linkedEntries = Object.values(config.userOrderHistory || {})
      .flat()
      .filter((entry) => entry.targetId === orderId);

    const linkedAccountText = linkedEntries.length
      ? linkedEntries
          .map(
            (entry) =>
              `Service: ${entry.service || "Unknown"} | Email: ${entry.email || "Unknown"} | Claimed by: ${entry.claimedBy || "Unclaimed"} | Delivered by: ${entry.deliveredBy || "Not delivered"}`
          )
          .join("\n")
      : "none";

    return message.reply(
      `Order ID: ${order.order_id}\nStatus: ${order.status || "pending"}\nBuyer ID: ${order.discord_user_id || "unknown"}\nBuyer Username: ${order.discord_username || "unknown"}\nPayment Method: ${order.payment_method || "not set"}\nProduct: ${order.product || "not set"}\nNotes: ${order.notes || "none"}\nLinked Account: ${linkedAccountText}`
    );
  } catch (error) {
    console.error("orderinfo failed:", error);
    return message.reply(`failed to fetch order: ${orderId}`);
  }
}

 if (rawCommandName === "ticketinfo") {
  if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");

  const topic = channel.topic || "";
  const claimedMatch = topic.match(/(?:^|\s*\|\s*)claimed:(\d+)/i);
  const claimedText = claimedMatch ? `<@${claimedMatch[1]}>` : "none";
  const status = getTicketStatus(channel) || "pending";
  const orderId = getTicketOrderId(channel) || "none";

  return message.reply(
    `ticket: ${channel.name}\nid: ${channel.id}\norder: ${orderId}\nclaimed: ${claimedText}\nstatus: ${status}\ncreated: <t:${Math.floor(channel.createdTimestamp / 1000)}:F>`
  );
}

if (rawCommandName === "paid") {
  if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");

  const methodInput = args.join(" ").trim().toLowerCase();
  const method = methodInput || "paid";
  const allowedMethods = ["paid", "btc", "eth", "ltc", "usdt", "sol", "paypal"];

  if (!allowedMethods.includes(method)) {
    return message.reply("use ,paid or ,paid btc/eth/ltc/usdt/sol/paypal");
  }

  try {
    const linkedOrderId = getTicketOrderId(channel);
    const orderSuffix = sanitizeChannelSegment(linkedOrderId || "order");
    const statusValue = method === "paid" ? "paid" : `paid-${method}`;
    await channel.setTopic(buildTicketTopic(channel, { status: statusValue }));
   if (linkedOrderId) {
  const orderUpdates = {
    status: statusValue,
  };

  if (method !== "paid") {
    orderUpdates.payment_method = method;
  }

  await updateOrderById(linkedOrderId, orderUpdates);
}

    const paymentSegment = method === "paid" ? "confirmed" : sanitizeChannelSegment(method);
const newChannelName = `ticket-paid-${paymentSegment}-${orderSuffix}`.slice(0, 100);

    if (channel.name !== newChannelName) {
      await channel.setName(newChannelName);
    }

    await updateTicketEmbed(channel);

    const inProgressCategoryId = process.env.DISCORD_IN_PROGRESS_CATEGORY_ID;

    if (inProgressCategoryId) {
      try {
        await channel.setParent(inProgressCategoryId);
      } catch (moveErr) {
        console.error("paid command move failed:", moveErr);
      }
    }

    const methodLabel =
      method === "paid" ? "Payment Confirmed" : `Payment Confirmed (${method.toUpperCase()})`;

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(methodLabel)
      .setDescription(`Payment has been confirmed by staff.\n\nThank you for your purchase.`)
      .setFooter({ text: "/Pending | Pending.cc" });

    await channel.send({ embeds: [embed] });

    await logTicketEvent(
  message.guild,
  `💰 Payment confirmed for order ${linkedOrderId || "unknown"} in #${channel.name} by ${message.author.tag} using ${method.toUpperCase()}`
);

    return message.reply(`marked as ${method}`);
  } catch (err) {
    console.error("paid command failed:", err);
    return message.reply("failed");
  }
}

if (rawCommandName === "ticketrename") {
  if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");

  const rawName = args.join(" ").trim();
  if (!rawName) return message.reply("give new name");

  const sanitizedName = rawName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  if (!sanitizedName) return message.reply("invalid name");

  const finalName = `ticket-${sanitizedName}`.slice(0, 100);

  try {
    await channel.setName(finalName);
    return message.reply(`renamed to ${finalName}`);
  } catch (error) {
    console.error("ticketrename failed:", error);
    return message.reply("failed to rename ticket");
  }
}

    if (rawCommandName === "ticketunclaim") {
  if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");

  try {
    const existingClaim = getTicketClaimedId(channel);

    if (!existingClaim) {
      return message.reply("ticket is not claimed");
    }

    await channel.setTopic(buildTicketTopic(channel, { claimed: null }));
    await updateTicketEmbed(channel);

    return message.reply("ticket unclaimed");
  } catch (error) {
    console.error("ticketunclaim failed:", error);
    return message.reply("failed to unclaim ticket");
  }
}

    if (rawCommandName === "tickettranscript") {
    if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");

    try {
      const transcriptText = await buildTranscriptText(channel);
      const attachment = new AttachmentBuilder(
        Buffer.from(transcriptText, "utf8"),
        { name: getSafeTranscriptFileName(channel.name) }
      );

      return message.reply({
        content: `transcript for ${channel.name}`,
        files: [attachment],
      });
    } catch (error) {
      console.error("tickettranscript failed:", error);
      return message.reply("failed to generate transcript");
    }
  }

  if (rawCommandName === "ticketadd") {
    if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");
    const member = message.mentions.members.first();
    if (!member) return message.reply("mention a user");

    try {
      await channel.permissionOverwrites.edit(member.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
      return message.reply(`${member} added to ticket`);
    } catch (error) {
      console.error("ticketadd failed:", error);
      return message.reply("failed to add user to ticket");
    }
  }

  if (rawCommandName === "ticketremove") {
    if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");
    const member = message.mentions.members.first();
    if (!member) return message.reply("mention a user");

    try {
      await channel.permissionOverwrites.delete(member.id);
      return message.reply(`${member} removed from ticket`);
    } catch (error) {
      console.error("ticketremove failed:", error);
      return message.reply("failed to remove user from ticket");
    }
  }

  if (rawCommandName === "ticketmove") {
    if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");
    const categoryId = args[0]?.replace(/[<#>]/g, "");
    if (!categoryId) return message.reply("give category id");

    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      return message.reply("invalid category id");
    }

    try {
      await channel.setParent(category.id);
      return message.reply(`ticket moved to ${category.name}`);
    } catch (error) {
      console.error("ticketmove failed:", error);
      return message.reply("failed to move ticket");
    }
  }

  if (rawCommandName === "ticketpriority") {
    if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");
    const level = (args[0] || "").toLowerCase();
    if (!["low", "medium", "high"].includes(level)) {
      return message.reply("use low, medium, or high");
    }

    try {
      await channel.setTopic(buildTicketTopic(channel, { priority: level }));
      return message.reply(`priority set to ${level}`);
    } catch (error) {
      console.error("ticketpriority failed:", error);
      return message.reply("failed to update priority");
    }
  }

 if (rawCommandName === "ticketstatus") {
  if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");

  const value = (args[0] || "").toLowerCase();
  const allowed = ["pending", "paid", "in-progress", "completed"];

  if (!allowed.includes(value)) {
    return message.reply("use pending, paid, in-progress, or completed");
  }

  try {
    const linkedOrderId = getTicketOrderId(channel);
    await channel.setTopic(buildTicketTopic(channel, { status: value }));
    if (linkedOrderId) {
      await updateOrderById(linkedOrderId, {
        status: value,
      });
    }
    await updateTicketEmbed(channel);
    if (value === "completed" && linkedOrderId) {
      try {
        const newName = `ticket-completed-${linkedOrderId}`.toLowerCase().slice(0, 100);
        if (channel.name !== newName) {
          await channel.setName(newName);
        }
      } catch (renameErr) {
        console.error("ticketstatus rename failed:", renameErr);
      }
    }
    if (value === "completed") {
  const completedCategoryId = process.env.DISCORD_COMPLETED_CATEGORY_ID;

  if (completedCategoryId) {
    try {
      await channel.setParent(completedCategoryId);
    } catch (moveErr) {
      console.error("ticketstatus move failed:", moveErr);
    }
  }
}
    return message.reply(`status set to ${value}`);
  } catch (error) {
    console.error("ticketstatus failed:", error);
    return message.reply("failed to update status");
  }
}

  if (rawCommandName === "tickettransfer") {
    if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");
    const member = message.mentions.members.first();
    if (!member) return message.reply("mention a user");

    try {
      await channel.permissionOverwrites.edit(member.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
      return message.reply(`ticket transferred to ${member}`);
    } catch (error) {
      console.error("tickettransfer failed:", error);
      return message.reply("failed to transfer ticket");
    }
  }

  if (rawCommandName === "ticketrequestclose") {
    if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");
    const sellersMention = sellersRoleId ? `<@&${sellersRoleId}> ` : "";

    try {
      await channel.send(`${sellersMention}${message.author} requested this ticket to be closed.`);
      return message.reply("close request sent");
    } catch (error) {
      console.error("ticketrequestclose failed:", error);
      return message.reply("failed to request close");
    }
  }

  if (rawCommandName === "ticketnotes") {
    if (!channel.name.startsWith("ticket-")) return message.reply("not a ticket");
    const note = args.join(" ").trim();
    if (!note) return message.reply("write a note");

    try {
      await channel.setTopic(buildTicketTopic(channel, { notes: note }));
      return message.reply("ticket note saved");
    } catch (error) {
      console.error("ticketnotes failed:", error);
      return message.reply("failed to save ticket note");
    }
  }
  if (rawCommandName === "ticketblacklist") {
    const member = message.mentions.members.first();
    if (!member) return message.reply("mention a user");

    const config = client.getConfig();
    if (!config.ticketBlacklist.includes(member.id)) {
      config.ticketBlacklist.push(member.id);
      client.saveConfig(config);
    }

    return message.reply(`${member} blacklisted from creating tickets`);
  }

  if (rawCommandName === "ticketunblacklist") {
    const member = message.mentions.members.first();
    if (!member) return message.reply("mention a user");

    const config = client.getConfig();
    config.ticketBlacklist = config.ticketBlacklist.filter((id) => id !== member.id);
    client.saveConfig(config);

    return message.reply(`${member} removed from ticket blacklist`);
  }
    if (rawCommandName === "statuschannel") {
    const channelMention = message.mentions.channels.first();
    if (!channelMention) return message.reply("mention a channel");

    const config = client.getConfig();
    config.statusChannelId = channelMention.id;
    client.saveConfig(config);

    return message.reply(`status channel set to ${channelMention}`);
  }

  if (rawCommandName === "statusadd") {
    const member = message.mentions.members.first();
    if (!member) return message.reply("mention a user");

    const config = client.getConfig();
    if (!config.trackedStatusUserIds.includes(member.id)) {
      config.trackedStatusUserIds.push(member.id);
    }

    client.saveConfig(config);
    await updateStatusMessage(message.guild);
    return message.reply(`${member} added to status tracking`);
  }

  if (rawCommandName === "statusremove") {
    const member = message.mentions.members.first();
    if (!member) return message.reply("mention a user");

    const config = client.getConfig();
    config.trackedStatusUserIds = config.trackedStatusUserIds.filter((id) => id !== member.id);
    client.saveConfig(config);
    await updateStatusMessage(message.guild);
    return message.reply(`${member} removed from status tracking`);
  }

  if (rawCommandName === "statusmessagecreate") {
    const config = client.getConfig();
    if (!config.statusChannelId) return message.reply("set a status channel first");

    const statusChannel = message.guild.channels.cache.get(config.statusChannelId);
    if (!statusChannel || !statusChannel.isTextBased()) {
      return message.reply("invalid status channel");
    }

    const statusFields = config.trackedStatusUserIds.length
      ? config.trackedStatusUserIds.map((userId) => {
          const member = message.guild.members.cache.get(userId);
          const status = member?.presence?.status || "offline";
          const emoji = getPresenceEmoji(status);

          return {
            name: member?.user?.username || "Unknown",
            value: `<@${userId}>\nStatus: ${emoji} ${status}`,
            inline: false,
          };
        })
      : [{ name: "No tracked users", value: "Add users with ,statusadd @user", inline: false }];

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("📊 Seller Status")
      .addFields(statusFields)
      .setFooter({ text: "/Pending | Pending.cc" });

    const statusMessage = await statusChannel.send({
      embeds: [embed],
    });

    config.statusMessageId = statusMessage.id;
    client.saveConfig(config);

    return message.reply(`status message created in ${statusChannel}`);
  }

  if (rawCommandName === "purge") {
    const amount = parseInt(args[0], 10);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply("give number 1-100");
    }

    await message.channel.bulkDelete(amount, true).catch(() => {});
    return message.channel
      .send({
        content: `deleted ${amount} messages`,
        reply: { messageReference: null },
      })
      .then((m) => setTimeout(() => m.delete().catch(() => {}), 2000));
  }

  // Move this block here (after all prefix command if blocks)
  const aliasMap = {
    btcset: "payments",
    ethset: "payments",
    ltcset: "payments",
    usdtset: "payments",
    solset: "payments",
    paypalset: "payments",
    btc: "payments",
    eth: "payments",
    ltc: "payments",
    usdt: "payments",
    sol: "payments",
    paypal: "payments",
    ticketclose: "ticketclose",
    closeticket: "ticketclose",
    ticketpanel: "ticketpanel",
    ticketadd: "ticketadd",
    ticketremove: "ticketremove",
    ticketrename: "ticketrename",
    ticketinfo: "ticketinfo",
    ticketmove: "ticketmove",
    ticketpriority: "ticketpriority",
    tickettransfer: "tickettransfer",
    ticketrequestclose: "ticketrequestclose",
    tickettranscript: "tickettranscript",
    ticketnotes: "ticketnotes",
    ticketclaim: "ticketclaim",
    ticketunclaim: "ticketunclaim",
    giveawaycreate: "gwstart",
    giveawayend: "gwend",
    giveawayreroll: "gwreroll",
    hardban: "hardban",
    lock: "lock",
    nuke: "nuke",
    lockdown: "lockdown",
    unlockall: "unlockall",
    raid: "raid",
    unlock: "unlock",
    unban: "unban",
    accclaim: "accclaim",
    userorders: "userorders",
    gwinfo: "gwinfo",
    usedaccounts: "usedaccounts",
    forgetaccount: "forgetaccount",
    salechannel: "salechannel",
    purge: "clear",
    adminrole: "adminrole",
    logchannel: "logchannel",
  };

  const resolvedCommandName = aliasMap[rawCommandName] || rawCommandName;
  const command = client.commands.get(resolvedCommandName);
  if (!command) return;

  try {
    await command.execute(message, args, rawCommandName);
  } catch (error) {
    console.error(`Error running command ${rawCommandName}:`, error);
    await message.reply("something broke while running that command.");
  }
} catch (error) {
  console.error(`Unhandled prefix command error for ${rawCommandName}:`, error);
  try {
    await message.reply(`command failed: ${rawCommandName}`);
  } catch {}
} finally {
  handledPrefixMessageIds.delete(message.id);
}
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("approve_vouch:")) {
  if (!isStaff(interaction.member)) {
    await interaction.reply({ content: "<:remake:1495128909132595240> staff only", flags: 64 });
    return;
  }

  const requestId = interaction.customId.split(":")[1];
  const pending = pendingVouchApprovals.get(requestId);

  if (!pending) {
    await interaction.reply({ content: "that vouch request expired or was already handled", flags: 64 });
    return;
  }

  const config = client.getConfig();
  const vouchChannel = interaction.guild.channels.cache.get(config.vouchChannelId);
  if (!vouchChannel || !vouchChannel.isTextBased()) {
    await interaction.reply({ content: "invalid vouch channel", flags: 64 });
    return;
  }

  const approvedEmbed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("✅ Vouch")
    .setDescription(
      `**User:** <@${pending.targetUserId}>\n**Vouched by:** <@${interaction.user.id}>\n**Requested by:** <@${pending.requestedById}>\n\n**Note:** ${pending.note}`
    )
    .setImage(pending.attachmentUrl)
    .setFooter({ text: "/Pending | pending.cc" });

  await vouchChannel.send({ embeds: [approvedEmbed] });
  pendingVouchApprovals.delete(requestId);

  await interaction.update({
    content: interaction.message.content || undefined,
    embeds: [
      EmbedBuilder.from(interaction.message.embeds[0]).setColor(0x57f287).setTitle("Vouch Approved"),
    ],
    components: [],
  });
  return;
}

if (interaction.customId.startsWith("deny_vouch:")) {
  if (!isStaff(interaction.member)) {
    await interaction.reply({ content: "<:remake:1495128909132595240> staff only", flags: 64 });
    return;
  }

  const requestId = interaction.customId.split(":")[1];
  const pending = pendingVouchApprovals.get(requestId);

  if (!pending) {
    await interaction.reply({ content: "that vouch request expired or was already handled", flags: 64 });
    return;
  }

  pendingVouchApprovals.delete(requestId);

  await interaction.update({
    content: interaction.message.content || undefined,
    embeds: [
      EmbedBuilder.from(interaction.message.embeds[0]).setColor(0xed4245).setTitle("Vouch Denied"),
    ],
    components: [],
  });
  return;
}
    if (interaction.customId === "create_ticket") {
      await interaction.deferReply({ flags: 64 });
            const config = client.getConfig();
      if (config.ticketBlacklist.includes(interaction.user.id)) {
        await interaction.editReply({
        content: "you are blacklisted from creating tickets.",
        });
        return;
      }
      const existingChannel = interaction.guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildText &&
          channel.name.startsWith("ticket-") &&
          getTicketOpenerId(channel) === interaction.user.id
      );

      if (existingChannel) {
        await interaction.editReply({
  content: `you already have an open ticket: ${existingChannel}`,
});
        return;
      }

      const permissionOverwrites = [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
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

      const channel = await interaction.guild.channels.create({
        name: normalizeTicketChannelName(interaction.user.username),
        type: ChannelType.GuildText,
        parent: ticketCategoryId || null,
        permissionOverwrites,
      });
      let orderId;
      try {
        const baseUrl = process.env.ORDER_API_BASE_URL || "http://localhost:3000";
        const orderRes = await fetch(`${baseUrl}/api/order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.INTERNAL_BOT_API_KEY
              ? { "x-internal-bot-key": process.env.INTERNAL_BOT_API_KEY }
              : {}),
          },
          body: JSON.stringify({
            discord_user_id: interaction.user.id,
            discord_username: interaction.user.username,
            notes: `ticket opened from discord by ${interaction.user.tag}`,
          }),
        });

        const orderData = await orderRes.json();

        if (!orderData.success || !orderData.orderId) {
          throw new Error("failed to create order");
        }

        orderId = orderData.orderId;
      } catch (error) {
        console.error("create_ticket order creation failed:", error);
        await channel.delete().catch(() => {});
        await interaction.editReply({
          content: "failed to create linked order",
        });
        return;
      }
     await channel.setTopic(
  buildTicketTopic(channel, {
    opener: interaction.user.id,
    status: "pending",
    order: orderId,
  })
);
      const sellersMention = sellersRoleId ? `<@&${sellersRoleId}>` : "";


const embed = new EmbedBuilder()
  .setColor(0xed4245)
  .setTitle("Purchase Ticket")
 .setDescription(
`Welcome ${interaction.user}

**Please Send:**
• What You'd like to Purchase
• Payment Method

**Available payments:**
<:crypto:1492253544789704905> BTC / ETH / LTC / USDT / SOL /<:paypal:1492253294276513993> PayPal`
)
  .addFields(
    { name: "User", value: `${interaction.user}`, inline: true },
    { name: "Order ID", value: orderId, inline: true },
    { name: "Status", value: "Pending", inline: true }
  )
  .setFooter({ text: "Pending | pending.cc" });

await channel.send({
  content: sellersMention || undefined,
  embeds: [embed],
  components: [buildTicketButtons()],
});

await updateTicketEmbed(channel);

      await logTicketEvent(
        interaction.guild,
        `🎟️ Ticket created by ${interaction.user.tag} (${interaction.user.id}) in ${channel} with order ID ${orderId}`
      );

      await interaction.editReply({
        content: `ticket created: ${channel}`,
      });
      return;
    }

    if (interaction.customId === "close_ticket") {
      const member = interaction.member;
      if (!member || !isStaff(member)) {
        await interaction.reply({
          content: "<:remake:1495128909132595240> staff only",
          flags: 64,
        });
        return;
      }

      if (!interaction.channel || !interaction.channel.name.startsWith("ticket-")) {
        await interaction.reply({
          content: "this is not a ticket channel.",
          flags: 64,
        });
        return;
      }

      await interaction.reply({
        content: "closing ticket...",
        flags: 64,
      });

      const transcriptText = await buildTranscriptText(interaction.channel);
      const transcriptFileName = getSafeTranscriptFileName(interaction.channel.name);
      const openerId = getTicketOpenerId(interaction.channel);
      const linkedOrderId = getTicketOrderId(interaction.channel);
      const claimedId = getTicketClaimedId(interaction.channel);

      const transcriptAttachmentForLogs = new AttachmentBuilder(
        Buffer.from(transcriptText, "utf8"),
        { name: transcriptFileName }
      );

      const transcriptAttachmentForDm = new AttachmentBuilder(
        Buffer.from(transcriptText, "utf8"),
        { name: transcriptFileName }
      );

      if (ticketLogChannelId) {
        const logChannel = interaction.guild.channels.cache.get(ticketLogChannelId);
        if (logChannel && logChannel.isTextBased()) {
          const closeEmbed = new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle("Your Ticket Has Been Closed")
            .setDescription(
              `Your ticket **${interaction.channel.name}** has been closed by staff.\n\n**Closed by:** ${interaction.user}\n**Time:** ${new Date().toISOString().replace("T", " ").replace("Z", " UTC")}\n\nA transcript of your conversation has been attached for your records. Thank you for contacting support!`
            )
            .setFooter({ text: "/Pending | Pending.cc" })
            .setTimestamp();

          await logChannel.send({
            embeds: [closeEmbed],
            files: [transcriptAttachmentForLogs],
          }).catch((error) => {
            console.error("Failed to send transcript to logs:", error);
          });
        }
      }

      if (openerId) {
        try {
          const openerUser = await client.users.fetch(openerId);

          const dmEmbed = new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle("Your Ticket Has Been Closed")
            .setDescription(
              `Your ticket **${interaction.channel.name}** has been closed by staff.\n\n**Closed by:** ${interaction.user}\n**Time:** ${new Date().toISOString().replace("T", " ").replace("Z", " UTC")}\n\nA transcript of your conversation has been attached for your records. Thank you for contacting support!`
            )
            .setFooter({ text: "/Pending | Pending.cc" })
            .setTimestamp();

          await openerUser.send({
            embeds: [dmEmbed],
            files: [transcriptAttachmentForDm],
          });
          try {
            await openerUser.send(
              "If you were satisfied with your order, please leave a vouch using /vouch. It helps a lot!"
            );
          } catch {}
        } catch (error) {
          console.error("Failed to DM transcript to opener:", error);
        }
      }

if (claimedId && claimedId !== openerId) {
  try {
    const claimedUser = await client.users.fetch(claimedId);

    const claimedDmEmbed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("Ticket You Claimed Has Been Closed")
      .setDescription(
        `The ticket **${interaction.channel.name}** that you claimed has been closed by staff.\n\n**Closed by:** ${interaction.user}\n**Time:** ${new Date().toISOString().replace("T", " ").replace("Z", " UTC")}\n\nA transcript of the conversation has been attached.`
      )
      .setFooter({ text: "/Pending | Pending.cc" })
      .setTimestamp();

    const transcriptAttachmentForClaimedDm = new AttachmentBuilder(
      Buffer.from(transcriptText, "utf8"),
      { name: transcriptFileName }
    );

    await claimedUser.send({
      embeds: [claimedDmEmbed],
      files: [transcriptAttachmentForClaimedDm],
    });
  } catch (error) {
    console.error("Failed to DM transcript to claimed staff:", error);
  }
}

      if (linkedOrderId) {
        try {
         await updateOrderById(linkedOrderId, {
  status: "closed",
});
        } catch (error) {
          console.error("Failed to update linked order on close:", error);
        }
      }
      await logTicketEvent(
        interaction.guild,
        `🔒 Ticket closed by ${interaction.user.tag} (${interaction.user.id}) in #${interaction.channel.name}`
      );

      setTimeout(() => {
        interaction.channel.delete().catch((error) => {
          console.error("Failed to delete ticket channel:", error);
        });
      }, 2000);

      return;
    }

    return;
  }

 if (interaction.isChatInputCommand()) {
  if (interaction.commandName === "vouch") {
  const modal = new ModalBuilder()
    .setCustomId("vouch_modal")
    .setTitle("Submit Vouch");

  const orderInput = new TextInputBuilder()
    .setCustomId("vouch_order_id")
    .setLabel("Order ID")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("PND-1000")
    .setRequired(true);

  const noteInput = new TextInputBuilder()
    .setCustomId("vouch_note")
    .setLabel("Your vouch")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(orderInput),
    new ActionRowBuilder().addComponents(noteInput)
  );

  await interaction.showModal(modal);
  return;
}

  if (interaction.commandName === "proof") {
    if (!isStaff(interaction.member)) {
      await interaction.reply({ content: "staff only", flags: 64 });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId("proof_modal")
      .setTitle("Submit Proof");

    const buyerInput = new TextInputBuilder()
      .setCustomId("proof_user")
      .setLabel("Order ID")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(buyerInput)
    );

    await interaction.showModal(modal);
    return;
  }
}
 // ===== MODAL SUBMIT HANDLER =====
if (interaction.isModalSubmit()) {
  const config = client.getConfig();
  const vouchChannel = interaction.guild.channels.cache.get(config.vouchChannelId);

  if (!vouchChannel || !vouchChannel.isTextBased()) {
    return interaction.reply({ content: "set vouch channel first", flags: 64 });
  }

  // ===== VOUCH =====
  if (interaction.customId === "vouch_modal") {
    await interaction.deferReply({ flags: 64 });
  const orderId = interaction.fields.getTextInputValue("vouch_order_id").trim();
  const note = interaction.fields.getTextInputValue("vouch_note");

  let order;
  try {
    order = await fetchOrderById(orderId);
  } catch (error) {
    return interaction.editReply({
  content: `invalid order id: ${orderId}`,
});
  }
  if (order.discord_user_id && order.discord_user_id !== interaction.user.id) {
    return interaction.editReply({
  content: "that order does not belong to you",
});
  }
  if (order.status === "vouched") {
 return interaction.editReply({
  content: "this order has already been vouched",
});
}

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("✅ Vouch")
    .addFields(
      { name: "Order ID", value: order.order_id || orderId, inline: true },
      {
        name: "Buyer",
        value: order.discord_user_id ? `<@${order.discord_user_id}>` : "Unknown",
        inline: true,
      },
      {
        name: "Vouched by",
        value: `${interaction.user}`,
        inline: true,
      },
      {
        name: "Product",
        value: order.product || "Not set",
        inline: true,
      },
      {
        name: "Payment",
        value: order.payment_method || "Not set",
        inline: true,
      },
      {
        name: "Note",
        value: note,
        inline: false,
      }
    )
    .setFooter({ text: "/Pending | pending.cc" });

  await vouchChannel.send({ embeds: [embed] });

  try {
    await updateOrderById(orderId, {
      status: "vouched",
      vouched_by: interaction.user.id,
      vouch_note: note,
    });
  } catch (error) {
    console.error("failed to mark order as vouched:", error);
  }

  try {
    const ticketChannel = interaction.guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        (c.topic || "").includes(`order:${orderId}`)
    );

    if (ticketChannel) {
      await ticketChannel.setTopic(
        buildTicketTopic(ticketChannel, { status: "vouched" })
      );
      await updateTicketEmbed(ticketChannel);

      await ticketChannel.send(`✅ this order has been vouched by ${interaction.user}`);
      try {
        const newName = `ticket-vouched-${orderId}`.toLowerCase().slice(0, 100);
        if (ticketChannel.name !== newName) {
          await ticketChannel.setName(newName);
        }
      } catch (renameErr) {
        console.error("failed to rename ticket after vouch:", renameErr);
      }
      const completedCategoryId = process.env.DISCORD_COMPLETED_CATEGORY_ID;

if (completedCategoryId) {
  try {
    await ticketChannel.setParent(completedCategoryId);
  } catch (moveErr) {
    console.error("failed to move ticket to completed category:", moveErr);
  }
}
    }
 } catch (err) {
  console.error("failed to sync ticket status after vouch:", err);
}

await logTicketEvent(
  interaction.guild,
  `✅ Order ${orderId} vouched by ${interaction.user.tag} (${interaction.user.id})`
);

return interaction.editReply({
  content: "vouch submitted successfully",
});

}

  // ===== PROOF =====
  if (interaction.customId === "proof_modal") {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ content: "staff only", flags: 64 });
    }

    const orderId = interaction.fields.getTextInputValue("proof_user").trim();
    try {
      await fetchOrderById(orderId);
    } catch (error) {
      return interaction.reply({
        content: `invalid order id: ${orderId}`,
        flags: 64,
      });
    }

    pendingProofUploads.set(interaction.user.id, {
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
      orderId,
      createdAt: Date.now(),
    });

    return interaction.reply({
      content: "now send the screenshot in this channel",
      flags: 64,
    });
  }

  return;
}

const command = client.commands.get(interaction.commandName);
if (!command) {
  console.warn(`No slash command found for: ${interaction.commandName}`);
  return;
}

try {
  await command.execute(interaction);
} catch (error) {
  console.error(`Error running slash command ${interaction.commandName}:`, error);

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "something broke while running that command.",
        flags: 64,
      });
    } else {
      await interaction.reply({
        content: "something broke while running that command.",
        flags: 64,
      });
    }
  } catch (replyError) {
    console.error("Failed to send interaction error reply:", replyError);
  }
}
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity("/pending | https://pending.cc");
});

client.login(token);
