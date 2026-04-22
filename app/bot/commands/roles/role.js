const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "role",
  description: "Add or remove a role for every member.",
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Add or remove a role for every member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("all")
        .setDescription("Add or remove a role for every member")
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Whether to add or remove the role")
            .setRequired(true)
            .addChoices(
              { name: "Add", value: "add" },
              { name: "Remove", value: "remove" }
            )
        )
        .addRoleOption((option) =>
          option.setName("role").setDescription("Role to add or remove").setRequired(true)
        )
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;

    if (isInteraction) {
      await target.deferReply({ flags: 64 });
    }

    const action = isInteraction
      ? target.options.getString("action")
      : String(args[1] || "").trim().toLowerCase();
    const role = isInteraction
      ? target.options.getRole("role")
      : target.mentions.roles.first();
    const hasManageRoles = target.member.permissions.has(PermissionFlagsBits.ManageRoles);

    if (!hasManageRoles) {
      return isInteraction
        ? target.editReply({ content: "no perms" })
        : target.reply("no perms");
    }

    if (!["add", "remove"].includes(action)) {
      return isInteraction
        ? target.editReply({ content: "use ,role all add/remove @role" })
        : target.reply("use ,role all add/remove @role");
    }

    if (!role) {
      return isInteraction
        ? target.editReply({ content: "mention a role" })
        : target.reply("mention a role");
    }

    const members = await target.guild.members.fetch();
    let success = 0;
    let failed = 0;

    for (const member of members.values()) {
      try {
        if (action === "add") {
          if (!member.roles.cache.has(role.id)) {
            await member.roles.add(role);
            success++;
          }
        } else if (member.roles.cache.has(role.id)) {
          await member.roles.remove(role);
          success++;
        }
      } catch {
        failed++;
      }
    }

    const content = `${action} ${role} → success: ${success}, failed: ${failed}`;
    return isInteraction
      ? target.editReply({ content })
      : target.reply(content);
  },
};
