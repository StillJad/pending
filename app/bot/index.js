require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
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

const fs = require("fs");
const path = require("path");

const token = process.env.DISCORD_TOKEN?.trim();
const prefix = process.env.PREFIX || ",";
const configPath = path.join(__dirname, "data", "config.json");
const sellersRoleId = process.env.DISCORD_SELLERS_ROLE_ID || "";
const ticketCategoryId = process.env.DISCORD_TICKET_CATEGORY_ID || "";
const ticketLogChannelId = process.env.DISCORD_TICKET_LOG_CHANNEL_ID || "";

function ensureConfigFile() {
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          autorole: null,
          welcomeChannelId: "",
          welcomeMessage: "Welcome {user} to {server}!",
          welcomeTitle: "Welcome to {server}",
          welcomeThumbnail: "avatar", // or "none"
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
        },
        null,
        2
      )
    );
  }
}

function getConfig() {
  ensureConfigFile();
  const data = JSON.parse(fs.readFileSync(configPath, "utf8"));

  if (!Array.isArray(data.ticketBlacklist)) {
    data.ticketBlacklist = [];
  }

  if (!data.payments || typeof data.payments !== "object") {
    data.payments = {
      btc: "",
      eth: "",
      ltc: "",
      usdt: "",
      sol: "",
      paypal: "",
    };
  }

  if (typeof data.autorole === "undefined") {
    data.autorole = null;
  }
  
  if (typeof data.welcomeChannelId !== "string") {
  data.welcomeChannelId = "";
}

if (typeof data.welcomeMessage !== "string") {
  data.welcomeMessage = "Welcome {user} to {server}!";
}
  if (typeof data.statusChannelId !== "string") {
    data.statusChannelId = "";
  }

  if (typeof data.statusMessageId !== "string") {
    data.statusMessageId = "";
  }

  if (!Array.isArray(data.trackedStatusUserIds)) {
    data.trackedStatusUserIds = [];
  }

if (typeof data.vouchChannelId !== "string") {
  data.vouchChannelId = "";
}

if (typeof data.welcomeTitle !== "string") {
  data.welcomeTitle = "Welcome to {server}";
}

if (typeof data.welcomeThumbnail !== "string") {
  data.welcomeThumbnail = "avatar";
}
  return data;
}

function saveConfig(data) {
  ensureConfigFile();
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
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
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    (sellersRoleId && member.roles.cache.has(sellersRoleId))
  );
}

async function logTicketEvent(guild, message) {
  if (!ticketLogChannelId) return;

  const channel = guild.channels.cache.get(ticketLogChannelId);
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
  if (!config.statusChannelId || !config.statusMessageId) return;

  const channel = guild.channels.cache.get(config.statusChannelId);
  if (!channel || !channel.isTextBased()) return;

  try {
    const message = await channel.messages.fetch(config.statusMessageId);

    const lines = config.trackedStatusUserIds.map((userId) => {
      const member = guild.members.cache.get(userId);
      const status = member?.presence?.status || "offline";
      const emoji = getPresenceEmoji(status);
      return `<@${userId}> Status: ${emoji}`;
    });

   const embed = new EmbedBuilder()
  .setColor(0x000000)
  .setTitle("📊 Seller Status")
  .addFields(
    config.trackedStatusUserIds.length
      ? config.trackedStatusUserIds.map((userId) => {
          const member = guild.members.cache.get(userId);
          const status = member?.presence?.status || "offline";
          const emoji = getPresenceEmoji(status);

          return {
            name: member?.user?.username || "Unknown",
            value: `<@${userId}>\nStatus: ${emoji} ${status}`,
            inline: false,
};
        })
      : [{ name: "No tracked users", value: "Add users with ,statusadd @user", inline: false }]
  )
  .setFooter({ text: "/Pending | Pending.cc" });

    await message.edit({ embeds: [embed], content: "" });
  } catch (error) {
    console.error("Failed to update status message:", error);
  }
}
ensureConfigFile();
const pendingVouchApprovals = new Map();
const pendingProofUploads = new Map();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

const commands = new Collection();
client.commands = commands;
client.getConfig = getConfig;
client.saveConfig = saveConfig;
client.generateOrderId = generateOrderId;

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command?.name || typeof command.execute !== "function") {
    console.warn(`Skipping invalid command file: ${file}`);
    continue;
  }
  commands.set(command.name, command);
}

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

  await updateStatusMessage(newPresence.guild);
});

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
]);

  if (staffOnlyCommands.has(rawCommandName) && !isStaff(message.member)) {
    return message.reply("<:remake:1495128909132595240> staff only");
  }

  try {

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

if (rawCommandName === "orderinfo") {
  const explicitOrderId = (args[0] || "").trim();
  const orderId = explicitOrderId || getTicketOrderId(channel);

  if (!orderId) {
    return message.reply("no order id linked to this ticket");
  }

  try {
    const order = await fetchOrderById(orderId);

    return message.reply(
      `Order ID: ${order.order_id}\nStatus: ${order.status || "pending"}\nBuyer ID: ${order.discord_user_id || "unknown"}\nBuyer Username: ${order.discord_username || "unknown"}\nPayment Method: ${order.payment_method || "not set"}\nProduct: ${order.product || "not set"}\nNotes: ${order.notes || "none"}`
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

    const newChannelName =
      method === "paid"
        ? `ticket-paid-${orderSuffix}`.slice(0, 100)
        : `ticket-paid-${sanitizeChannelSegment(method)}-${orderSuffix}`.slice(0, 100);

    if (channel.name !== newChannelName) {
      await channel.setName(newChannelName);
    }

    await updateTicketEmbed(channel);

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
      `💰 Payment confirmed in #${channel.name} by ${message.author.tag} using ${method.toUpperCase()}`
    );

setTimeout(() => {
  channel.delete().catch(() => {});
}, 10000);

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
      client.saveConfig(config);
    }

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

    const lines = config.trackedStatusUserIds.map((userId) => {
      const member = message.guild.members.cache.get(userId);
      const status = member?.presence?.status || "offline";
      const emoji = getPresenceEmoji(status);
      return `<@${userId}> Status: ${emoji}`;
    });

  const embed = new EmbedBuilder()
  .setColor(0x000000)
  .setTitle("📊 Seller Status")
  .addFields(
    config.trackedStatusUserIds.map((userId) => {
      const member = message.guild.members.cache.get(userId);
      const status = member?.presence?.status || "offline";
      const emoji = getPresenceEmoji(status);

      return {
         name: member?.user?.username || "Unknown",
          value: `<@${userId}>\nStatus: ${emoji} ${status}`,
           inline: false,
    };
    })
  )
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
      .send(`deleted ${amount} messages`)
      .then((m) => setTimeout(() => m.delete().catch(() => {}), 2000));
  }

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
    ticketclose: "closeticket",
    closeticket: "closeticket",
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

    const noteInput = new TextInputBuilder()
      .setCustomId("vouch_note")
      .setLabel("Your vouch")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
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
    const note = interaction.fields.getTextInputValue("vouch_note");

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("✅ Vouch")
      .setDescription(
        `**User:** ${interaction.user}\n\n**Note:** ${note}`
      )
      .setFooter({ text: "/Pending | pending.cc" });

    await vouchChannel.send({ embeds: [embed] });

    return interaction.reply({
      content: "vouch sent",
      flags: 64,
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

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity(",ping /ping");
});

client.login(token);