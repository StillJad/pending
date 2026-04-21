import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

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
