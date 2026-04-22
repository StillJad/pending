const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "deliver",
  description: "Post delivery embeds from pasted account data.",
  data: new SlashCommandBuilder()
    .setName("deliver")
    .setDescription("Post delivery embeds from pasted account data")
    .addStringOption((option) =>
      option.setName("service").setDescription("Service name").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("accounts")
        .setDescription("Account data lines to deliver")
        .setRequired(true)
    ),

  async execute(target, args = []) {
    const isInteraction = !!target.isChatInputCommand;

    if (isInteraction) {
      await target.deferReply({ flags: 64 });
    }

    const config = target.client.getConfig(target.guild);
    const serviceType = (
      isInteraction ? target.options.getString("service") : args[0] || ""
    )
      .trim()
      .toLowerCase();

    if (!serviceType) {
      return isInteraction
        ? target.editReply({ content: "use ,deliver <service> then paste account data" })
        : target.reply("use ,deliver <service> then paste account data");
    }

    const deliveryChannel = target.guild.channels.cache.get(config.deliveryChannelId);
    if (!deliveryChannel || deliveryChannel.type !== ChannelType.GuildText) {
      return isInteraction
        ? target.editReply({ content: "set delivery channel first using ,deliverychannel" })
        : target.reply("set delivery channel first using ,deliverychannel");
    }

    const accountText = String(
      isInteraction
        ? target.options.getString("accounts")
        : target.content
            .slice(
              (process.env.PREFIX || ",").length +
                "deliver".length +
                1 +
                serviceType.length
            )
            .trim()
    ).trim();

    if (!accountText) {
      return isInteraction
        ? target.editReply({ content: "paste account data" })
        : target.reply("paste account data");
    }

    const lines = accountText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return isInteraction
        ? target.editReply({ content: "no valid lines found" })
        : target.reply("no valid lines found");
    }

    const existingIdentities = await target.client.getExistingDeliveryIdentities(deliveryChannel);
    const storedIdentities = target.client.getUsedDeliveryIdentities();
    const runtimeFingerprints =
      target.client.runtimeDeliveryFingerprints || new Set();
    target.client.runtimeDeliveryFingerprints = runtimeFingerprints;
    const seenInBatch = new Set();
    const skipped = [];
    const embeds = [];

    for (const line of lines) {
      try {
        const parsed = target.client.parseAccountLine(line);
        const identity = target.client.getDeliveryIdentity
          ? target.client.getDeliveryIdentity(parsed)
          : String(parsed.email || "").trim().toLowerCase();

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

        const runtimeFingerprint = `${serviceType}:${identity}`;
        if (runtimeFingerprints.has(runtimeFingerprint)) {
          skipped.push(`${identity} (already delivered in this runtime)`);
          continue;
        }

        seenInBatch.add(identity);
        embeds.push({
          embed: target.client.buildDeliveryEmbed(parsed, serviceType),
          identity,
          runtimeFingerprint,
        });
      } catch (error) {
        console.error("failed to parse line:", line, error);
        skipped.push(`${line} (parse failed)`);
      }
    }

    if (!embeds.length) {
      const reason = skipped.length
        ? `failed to parse any accounts. skipped:\n- ${skipped.join("\n- ")}`
        : "failed to parse any accounts";

      return isInteraction
        ? target.editReply({ content: reason })
        : target.reply(reason);
    }

    for (const { embed, identity, runtimeFingerprint } of embeds) {
      const message = await deliveryChannel.send({ embeds: [embed] });
      await message.react("📦").catch(() => {});
      if (identity) {
        target.client.addUsedDeliveryIdentity(identity);
      }
      if (runtimeFingerprint) {
        runtimeFingerprints.add(runtimeFingerprint);
      }
    }

    let replyText = `delivered ${embeds.length} ${serviceType} item(s)`;
    if (skipped.length) {
      replyText += `\nskipped ${skipped.length} item(s):\n- ${skipped.join("\n- ")}`;
    }

    return isInteraction
      ? target.editReply({ content: replyText })
      : target.reply(replyText);
  },
};
