const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const databasePath = path.join(dataDir, "database.json");
const legacyConfigPath = path.join(dataDir, "config.json");
const legacyGiveawaysPath = path.join(dataDir, "giveaways.json");

const defaultGlobalSettings = {
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
  modLogChannelId: "",
  errorChannelId: "",
  robuxPricePer1000: 8.5,
  usedDeliveryIdentities: [],
  embedColor: 15548997,
  userOrderHistory: {},
  lockdownLockedChannels: [],
};

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeSettings(input = {}) {
  const data = {
    ...clone(defaultGlobalSettings),
    ...(input && typeof input === "object" ? clone(input) : {}),
  };

  if (!Array.isArray(data.ticketBlacklist)) {
    data.ticketBlacklist = [];
  }

  if (!data.payments || typeof data.payments !== "object") {
    data.payments = clone(defaultGlobalSettings.payments);
  } else {
    data.payments = {
      ...clone(defaultGlobalSettings.payments),
      ...data.payments,
    };
  }

  if (!Array.isArray(data.trackedStatusUserIds)) {
    data.trackedStatusUserIds = [];
  }

  if (!Array.isArray(data.usedDeliveryIdentities)) {
    data.usedDeliveryIdentities = [];
  }

  if (!Array.isArray(data.lockdownLockedChannels)) {
    data.lockdownLockedChannels = [];
  }

  if (!data.userOrderHistory || typeof data.userOrderHistory !== "object") {
    data.userOrderHistory = {};
  }

  if (typeof data.saleChannelId !== "string") {
    data.saleChannelId = defaultGlobalSettings.saleChannelId;
  }

  if (typeof data.modLogChannelId !== "string") {
    data.modLogChannelId = defaultGlobalSettings.modLogChannelId;
  }

  if (typeof data.errorChannelId !== "string") {
    data.errorChannelId = defaultGlobalSettings.errorChannelId;
  }

  if (
    typeof data.robuxPricePer1000 !== "number" ||
    !Number.isFinite(data.robuxPricePer1000)
  ) {
    data.robuxPricePer1000 = defaultGlobalSettings.robuxPricePer1000;
  }

  if (typeof data.embedColor !== "number") {
    data.embedColor = defaultGlobalSettings.embedColor;
  }

  if (typeof data.welcomeMessage !== "string") {
    data.welcomeMessage = defaultGlobalSettings.welcomeMessage;
  }

  if (typeof data.welcomeTitle !== "string") {
    data.welcomeTitle = defaultGlobalSettings.welcomeTitle;
  }

  if (typeof data.welcomeThumbnail !== "string") {
    data.welcomeThumbnail = defaultGlobalSettings.welcomeThumbnail;
  }

  return data;
}

function createDefaultState() {
  return {
    version: 1,
    orders: {},
    giveaways: [],
    snipes: {
      messages: {},
      reactions: {},
    },
    settings: {
      global: normalizeSettings(),
      guilds: {},
    },
  };
}

function readJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }

    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Failed to read JSON file ${filePath}:`, error);
    return fallback;
  }
}

function syncLegacyFiles(state) {
  ensureDataDir();

  try {
    fs.writeFileSync(
      legacyConfigPath,
      JSON.stringify(normalizeSettings(state.settings.global), null, 2)
    );
  } catch (error) {
    console.error("Failed to sync legacy config.json:", error);
  }

  try {
    fs.writeFileSync(
      legacyGiveawaysPath,
      JSON.stringify(Array.isArray(state.giveaways) ? state.giveaways : [], null, 2)
    );
  } catch (error) {
    console.error("Failed to sync legacy giveaways.json:", error);
  }
}

function bootstrapDatabase() {
  ensureDataDir();

  if (fs.existsSync(databasePath)) {
    return;
  }

  const state = createDefaultState();
  const legacyConfig = readJsonFile(legacyConfigPath, null);
  const legacyGiveaways = readJsonFile(legacyGiveawaysPath, null);

  if (legacyConfig && typeof legacyConfig === "object") {
    state.settings.global = normalizeSettings(legacyConfig);
  }

  if (Array.isArray(legacyGiveaways)) {
    state.giveaways = legacyGiveaways;
  }

  fs.writeFileSync(databasePath, JSON.stringify(state, null, 2));
  syncLegacyFiles(state);
}

function ensureDatabase() {
  bootstrapDatabase();
}

function readState() {
  ensureDatabase();
  const raw = readJsonFile(databasePath, createDefaultState());
  const state = createDefaultState();

  if (raw && typeof raw === "object") {
    state.version = raw.version || 1;
    state.orders = raw.orders && typeof raw.orders === "object" ? raw.orders : {};
    state.giveaways = Array.isArray(raw.giveaways) ? raw.giveaways : [];
    state.snipes = {
      messages:
        raw.snipes?.messages && typeof raw.snipes.messages === "object"
          ? raw.snipes.messages
          : {},
      reactions:
        raw.snipes?.reactions && typeof raw.snipes.reactions === "object"
          ? raw.snipes.reactions
          : {},
    };
    state.settings.global = normalizeSettings(raw.settings?.global);
    state.settings.guilds =
      raw.settings?.guilds && typeof raw.settings.guilds === "object"
        ? raw.settings.guilds
        : {};
  }

  return state;
}

function writeState(state) {
  ensureDatabase();
  fs.writeFileSync(databasePath, JSON.stringify(state, null, 2));
  syncLegacyFiles(state);
}

function updateState(updater) {
  const state = readState();
  const nextState = updater(state) || state;
  writeState(nextState);
  return nextState;
}

function getGlobalSettings() {
  return normalizeSettings(readState().settings.global);
}

function saveGlobalSettings(settings) {
  updateState((state) => {
    state.settings.global = normalizeSettings(settings);
    return state;
  });
}

function getGuildSettings(guildId) {
  const state = readState();
  const globalSettings = normalizeSettings(state.settings.global);

  if (!guildId) {
    return globalSettings;
  }

  const guildSettings = normalizeSettings(state.settings.guilds[guildId] || {});
  return {
    ...globalSettings,
    ...guildSettings,
    payments: {
      ...globalSettings.payments,
      ...guildSettings.payments,
    },
  };
}

function saveGuildSettings(guildId, settings) {
  if (!guildId) {
    saveGlobalSettings(settings);
    return;
  }

  updateState((state) => {
    state.settings.guilds[guildId] = normalizeSettings(settings);
    return state;
  });
}

function getOrders() {
  return readState().orders;
}

function getOrder(orderId) {
  if (!orderId) return null;
  return readState().orders[String(orderId).trim()] || null;
}

function upsertOrder(order) {
  if (!order?.order_id) return;

  updateState((state) => {
    state.orders[String(order.order_id).trim()] = order;
    return state;
  });
}

function deleteOrder(orderId) {
  if (!orderId) return;

  updateState((state) => {
    delete state.orders[String(orderId).trim()];
    return state;
  });
}

function getGiveaways() {
  return readState().giveaways;
}

function saveGiveaways(giveaways) {
  updateState((state) => {
    state.giveaways = Array.isArray(giveaways) ? giveaways : [];
    return state;
  });
}

function normalizeGiveawayId(id) {
  return String(id || "").replace(/^GW-/i, "").trim();
}

function findGiveawayById(id) {
  const raw = String(id || "").trim();
  const normalized = normalizeGiveawayId(raw);

  return (
    getGiveaways().find(
      (giveaway) =>
        normalizeGiveawayId(giveaway.giveawayId) === normalized ||
        String(giveaway.messageId || "").trim() === raw ||
        String(giveaway.messageId || "").trim() === normalized
    ) || null
  );
}

function setSnipedMessage(channelId, payload) {
  if (!channelId) return;

  updateState((state) => {
    state.snipes.messages[String(channelId)] = payload;
    return state;
  });
}

function getSnipedMessage(channelId) {
  if (!channelId) return null;
  return readState().snipes.messages[String(channelId)] || null;
}

function setSnipedReaction(channelId, payload) {
  if (!channelId) return;

  updateState((state) => {
    state.snipes.reactions[String(channelId)] = payload;
    return state;
  });
}

function getSnipedReaction(channelId) {
  if (!channelId) return null;
  return readState().snipes.reactions[String(channelId)] || null;
}

module.exports = {
  dataDir,
  databasePath,
  defaultGlobalSettings,
  normalizeSettings,
  ensureDatabase,
  readState,
  writeState,
  updateState,
  getGlobalSettings,
  saveGlobalSettings,
  getGuildSettings,
  saveGuildSettings,
  getOrders,
  getOrder,
  upsertOrder,
  deleteOrder,
  getGiveaways,
  saveGiveaways,
  findGiveawayById,
  setSnipedMessage,
  getSnipedMessage,
  setSnipedReaction,
  getSnipedReaction,
};
