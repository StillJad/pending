require("dotenv").config();

const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of files) {
  const cmd = require(`./commands/${file}`);
  if (!cmd.slashData) continue;

  if (typeof cmd.slashData.toJSON === "function") {
    commands.push(cmd.slashData.toJSON());
  } else {
    commands.push(cmd.slashData);
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  console.log("deploying...");

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("done");
})();