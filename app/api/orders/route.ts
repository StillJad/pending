import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
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

export async function GET(req: Request) {
  try {
    if (!supabase) {
      return Response.json(
        {
          success: false,
          error: "Supabase is not configured",
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);

    const limitParam = searchParams.get("limit");
    const status = searchParams.get("status");

    const limit = Math.min(
      Math.max(parseInt(limitParam || "10", 10) || 10, 1),
      50
    );

    let query = supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch orders:", error);
      return Response.json(
        {
          success: false,
          error: "failed to fetch orders",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      orders: data || [],
    });
  } catch (error) {
    console.error("Orders list route failed:", error);
    return Response.json(
      {
        success: false,
        error: "internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

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
    const discordUserId =
      typeof body.discord_user_id === "string" ? body.discord_user_id : null;
    const discordUsername =
      typeof body.discord_username === "string" ? body.discord_username : null;
    const notes =
      typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "pending";

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

    if (!supabase) {
      return Response.json(
        {
          success: false,
          error: "Supabase is not configured",
        },
        { status: 500 }
      );
    }

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

    if (typeof body.product === "string") {
      updates.product = body.product.trim() || null;
    }

    if (typeof body.vouched_by === "string") {
      updates.vouched_by = body.vouched_by.trim() || null;
    }

    if (typeof body.vouch_note === "string") {
      updates.vouch_note = body.vouch_note.trim() || null;
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
