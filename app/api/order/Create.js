import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export async function POST(req) {
  try {
    const body = await req.json();

    const items = Array.isArray(body.items) ? body.items : [];
    const total = typeof body.total === "number" ? body.total : 0;
    const paymentMethod =
      typeof body.payment_method === "string" ? body.payment_method : null;
    const discordUserId =
      typeof body.discord_user_id === "string" ? body.discord_user_id : null;
    const discordUsername =
      typeof body.discord_username === "string" ? body.discord_username : null;
    const notes = typeof body.notes === "string" ? body.notes : null;

    const lines = items.map(
      (item) =>
        `- ${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`
    );

    if (!supabase) {
      return Response.json(
        {
          success: false,
          error: "Supabase is not configured",
        },
        { status: 500 }
      );
    }

    const { data: lastOrder, error: lastOrderError } = await supabase
      .from("orders")
      .select("order_id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastOrderError) {
      console.error("Failed to fetch last order:", lastOrderError);
      return Response.json(
        {
          success: false,
          error: "failed to generate order id",
        },
        { status: 500 }
      );
    }

    let nextNumber = 10000;

    if (lastOrder?.order_id) {
      const current = parseInt(
        String(lastOrder.order_id).replace("PND-", ""),
        10
      );

      if (!Number.isNaN(current)) {
        nextNumber = current + 1;
      }
    }

    const orderId = `PND-${nextNumber}`;
    const productSummary = lines.join(" | ") || null;
    const fullNotes = [notes, `Total: $${total.toFixed(2)}`]
      .filter(Boolean)
      .join(" | ") || null;

    const { error: insertError } = await supabase.from("orders").insert([
      {
        order_id: orderId,
        discord_user_id: discordUserId,
        discord_username: discordUsername,
        product: productSummary,
        payment_method: paymentMethod,
        status: "pending",
        notes: fullNotes,
      },
    ]);

    if (insertError) {
      console.error("Failed to insert order:", insertError);
      return Response.json(
        {
          success: false,
          error: "failed to create order",
        },
        { status: 500 }
      );
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    const sellersRoleId = process.env.DISCORD_SELLERS_ROLE_ID;

    if (webhookUrl) {
      const sellersMention = sellersRoleId ? `<@&${sellersRoleId}>` : "";

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content:
            `${sellersMention}\n` +
            `## New Pending Order\n` +
            `**Order ID:** ${orderId}\n` +
            `**Total:** $${total.toFixed(2)}\n` +
            (paymentMethod
              ? `**Payment Method:** ${paymentMethod}\n\n`
              : "\n") +
            `**Items:**\n${lines.join("\n") || "- No items"}`,
          allowed_mentions: {
            roles: sellersRoleId ? [sellersRoleId] : [],
          },
        }),
      });
    }

    return Response.json({
      success: true,
      orderId,
    });
  } catch (error) {
    console.error("Order route failed:", error);
    return Response.json(
      {
        success: false,
        error: "internal server error",
      },
      { status: 500 }
    );
  }
}
