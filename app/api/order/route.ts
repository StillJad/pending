import { getSessionFromRequest } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyTurnstileToken } from "@/lib/turnstile";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderIdRow = {
  order_id: string | null;
};

function buildProductSummary(items: OrderItem[]) {
  if (!items.length) return null;

  return items
    .map(
      (item) =>
        `- ${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`
    )
    .join(" | ");
}

export async function POST(req: Request) {
  try {
    const internalKey = req.headers.get("x-internal-bot-key");
    const isTrustedBot = Boolean(
      internalKey &&
        process.env.INTERNAL_BOT_API_KEY &&
        internalKey === process.env.INTERNAL_BOT_API_KEY
    );
    const session = isTrustedBot ? null : await getSessionFromRequest(req);
    let discordUserId: string | null = null;
    let discordUsername: string | null = null;

    if (!isTrustedBot) {
      if (!session) {
        return Response.json(
          {
            success: false,
            error: "Unauthorized",
          },
          { status: 401 }
        );
      }

      if (!session.isInServer) {
        return Response.json(
          {
            success: false,
            error: "Join the Discord server to continue",
          },
          { status: 403 }
        );
      }

      if (!session.roleCheckPassed) {
        return Response.json(
          {
            success: false,
            error: "Required Discord role missing",
          },
          { status: 403 }
        );
      }

      discordUserId = session.discordId;
      discordUsername = session.username;
    }

    const body = await req.json();
    const turnstileToken =
      typeof body.turnstileToken === "string" ? body.turnstileToken : "";

    if (!isTrustedBot) {
      const verified = await verifyTurnstileToken(turnstileToken, req);

      if (!verified) {
        return Response.json(
          {
            success: false,
            error: "Bot detected",
          },
          { status: 403 }
        );
      }
    }

    const items: OrderItem[] = Array.isArray(body.items) ? body.items : [];
    const directProduct =
      typeof body.product === "string" && body.product.trim()
        ? body.product.trim()
        : null;
    const total = typeof body.total === "number" ? body.total : null;
    const paymentMethod =
      typeof body.payment_method === "string" && body.payment_method.trim()
        ? body.payment_method.trim()
        : null;
    const bodyDiscordUserId =
      typeof body.discord_user_id === "string" && body.discord_user_id.trim()
        ? body.discord_user_id.trim()
        : null;
    const bodyDiscordUsername =
      typeof body.discord_username === "string" && body.discord_username.trim()
        ? body.discord_username.trim()
        : null;

    if (isTrustedBot) {
      discordUserId = bodyDiscordUserId;
      discordUsername = bodyDiscordUsername;
    }
    const notes =
      typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "pending";

    const supabase = getSupabaseAdmin();

    const { data: lastOrderData, error: lastOrderError } = await supabase
      .from("orders")
      .select("order_id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastOrder = (lastOrderData ?? null) as OrderIdRow | null;

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
      const current = parseInt(String(lastOrder.order_id).replace("PND-", ""), 10);
      if (!Number.isNaN(current)) {
        nextNumber = current + 1;
      }
    }

    const orderId = `PND-${nextNumber}`;
    const productSummary = buildProductSummary(items) || directProduct;
    const fullNotes = [notes, total !== null ? `Total: $${total.toFixed(2)}` : null]
      .filter(Boolean)
      .join(" | ") || null;

    const { error: insertError } = await supabase.from("orders").insert([
      {
        order_id: orderId,
        discord_user_id: discordUserId,
        discord_username: discordUsername,
        product: productSummary,
        payment_method: paymentMethod,
        status,
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

    return Response.json({
      success: true,
      orderId,
      status,
    });
  } catch (error) {
    console.error("Order create route failed:", error);
    return Response.json(
      {
        success: false,
        error: "internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const orderId = typeof body.order_id === "string" ? body.order_id.trim() : "";

    if (!orderId) {
      return Response.json(
        {
          success: false,
          error: "order_id is required",
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const updates: Record<string, string | null> = {};

    if (typeof body.discord_user_id === "string") {
      updates.discord_user_id = body.discord_user_id;
    }

    if (typeof body.discord_username === "string") {
      updates.discord_username = body.discord_username;
    }

    if (typeof body.payment_method === "string") {
      updates.payment_method = body.payment_method.trim() || null;
    }

    if (typeof body.status === "string") {
      updates.status = body.status.trim() || "pending";
    }

    if (typeof body.notes === "string") {
      updates.notes = body.notes.trim() || null;
    }

    if (Array.isArray(body.items)) {
      updates.product = buildProductSummary(body.items as OrderItem[]);
    }

    if (typeof body.total === "number") {
      const currentNotes = updates.notes ?? null;
      updates.notes = [currentNotes, `Total: $${body.total.toFixed(2)}`]
        .filter(Boolean)
        .join(" | ") || null;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("order_id", orderId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Failed to update order:", error);
      return Response.json(
        {
          success: false,
          error: "failed to update order",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return Response.json(
        {
          success: false,
          error: "order not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error("Order update route failed:", error);
    return Response.json(
      {
        success: false,
        error: "internal server error",
      },
      { status: 500 }
    );
  }
}
