const fs = require("fs");
const path = require("path");

function getCommandDescription(command) {
  if (typeof command.description === "string" && command.description.trim()) {
    return command.description.trim();
  }

  const slash = command.data || command.slashData;
  if (!slash) {
    return "";
  }

  const json = typeof slash.toJSON === "function" ? slash.toJSON() : slash;
  return typeof json.description === "string" ? json.description.trim() : "";
}

function validateCommand(command, filePath) {
  const problems = [];

  if (!command?.name || typeof command.name !== "string") {
    problems.push("missing name");
  }

  if (typeof command?.execute !== "function") {
    problems.push("missing execute()");
  }

  if (!getCommandDescription(command)) {
    problems.push("missing description");
  }

  if (problems.length) {
    console.warn(`Skipping invalid command file ${filePath}: ${problems.join(", ")}`);
    return false;
  }

  return true;
}

function loadCommands(commands, rootDir, dir = rootDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      loadCommands(commands, rootDir, fullPath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".js")) {
      continue;
    }

    const command = require(fullPath);
    if (!validateCommand(command, fullPath)) {
      continue;
    }

    const relative = path.relative(rootDir, fullPath);
    command.__filePath = fullPath;
    command.__category = relative.split(path.sep)[0] || "other";
    command.__description = getCommandDescription(command);
    commands.set(command.name, command);
  }

  return commands;
}

module.exports = {
  loadCommands,
  validateCommand,
  getCommandDescription,
};
