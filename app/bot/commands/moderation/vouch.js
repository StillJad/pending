const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "vouch",
  description: "Submit a vouch",

  slashData: new SlashCommandBuilder()
    .setName("vouch")
    .setDescription("Submit a vouch"),

  async execute(target, args = []) {
    if (target.isChatInputCommand && target.isChatInputCommand()) {
      return;
    }

    const firstArg = String(args[0] || "").trim();
    const looksLikeOrderId = /^PND-\d+$/i.test(firstArg);
    const orderId = looksLikeOrderId ? firstArg : "";
    const note = (looksLikeOrderId ? args.slice(1) : args).join(" ").trim();

    if (!note) {
      return target.reply("use ,vouch [order_id] <note>");
    }

    const config = target.client.getConfig(target.guild);
    const vouchChannel = target.guild.channels.cache.get(config.vouchChannelId);

    if (!vouchChannel || !vouchChannel.isTextBased()) {
      return target.reply("set vouch channel first");
    }

    let order = null;

    if (orderId) {
      try {
        order = await target.client.fetchOrderById(orderId);
      } catch {
        return target.reply(`invalid order id: ${orderId}`);
      }

      if (order.discord_user_id && order.discord_user_id !== target.author.id) {
        return target.reply("that order does not belong to you");
      }

      if (order.status === "vouched") {
        return target.reply("this order has already been vouched");
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("✅ Vouch")
      .setDescription(`**${note}**`)
      .addFields(
        orderId
          ? [
              { name: "Order ID", value: order?.order_id || orderId, inline: true },
              {
                name: "Buyer",
                value: order?.discord_user_id ? `<@${order.discord_user_id}>` : `${target.author}`,
                inline: true,
              },
              {
                name: "Product",
                value: order?.product || "Not linked",
                inline: true,
              },
              {
                name: "Payment",
                value: order?.payment_method || "Not linked",
                inline: true,
              },
            ]
          : [
              {
                name: "Submitted by",
                value: `${target.author}`,
                inline: true,
              },
            ]
      )
      .setFooter({ text: "/Pending | pending.cc" });

    await vouchChannel.send({ embeds: [embed] });

    if (orderId) {
      try {
        await target.client.updateOrderById(orderId, {
          status: "vouched",
          vouched_by: target.author.id,
          vouch_note: note,
        });
      } catch (error) {
        console.error("failed to mark order as vouched:", error);
      }

      try {
        const ticketChannel = target.guild.channels.cache.find(
          (channel) =>
            channel.type === ChannelType.GuildText &&
            (channel.topic || "").includes(`order:${orderId}`)
        );

        if (ticketChannel) {
          await ticketChannel.setTopic(
            target.client.buildTicketTopic(ticketChannel, { status: "vouched" })
          );
          await target.client.updateTicketEmbed(ticketChannel);
          await ticketChannel.send(`✅ this order has been vouched by ${target.author}`);

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
      } catch (error) {
        console.error("failed to sync ticket status after vouch:", error);
      }
    }

    await target.client.logTicketEvent(
      target.guild,
      `✅ ${orderId ? `Order ${orderId}` : "Unlinked vouch"} submitted by ${target.author.tag}`
    );

    return target.reply("vouch submitted successfully");
  },
};
