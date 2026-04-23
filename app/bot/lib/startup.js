function validateStartupEnv(env = process.env) {
  const critical = ["DISCORD_TOKEN"];
  const recommended = [
    "CLIENT_ID",
    "GUILD_ID",
    "INTERNAL_BOT_API_KEY",
    "PREFIX",
    "ORDER_API_BASE_URL",
    "SUPABASE_URL",
    "SUPABASE_KEY",
  ];

  const missingCritical = critical.filter((key) => !String(env[key] || "").trim());
  const missingRecommended = recommended.filter((key) => !String(env[key] || "").trim());

  if (missingCritical.length) {
    console.warn(`[STARTUP] Missing critical env vars: ${missingCritical.join(", ")}`);
  }

  if (missingRecommended.length) {
    console.warn(`[STARTUP] Missing recommended env vars: ${missingRecommended.join(", ")}`);
  }

  return {
    missingCritical,
    missingRecommended,
  };
}

module.exports = {
  validateStartupEnv,
};
