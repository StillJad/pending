const express = require("express");

const app = express();
const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const HOST = "0.0.0.0";

const orders = new Map();
let latestOrderNumber = 9999;

function nextOrderId() {
  latestOrderNumber += 1;
  return `PND-${latestOrderNumber}`;
}

function getLatestOrder() {
  let latest = null;

  for (const order of orders.values()) {
    if (!latest || order.createdAt > latest.createdAt) {
      latest = order;
    }
  }

  return latest;
}

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
  });
});

app.post("/api/order", (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const orderId = nextOrderId();
    const order = {
      order_id: orderId,
      createdAt: Date.now(),
      discord_user_id:
        typeof body.discord_user_id === "string" ? body.discord_user_id : null,
      discord_username:
        typeof body.discord_username === "string" ? body.discord_username : null,
      notes: typeof body.notes === "string" ? body.notes : null,
      payment_method:
        typeof body.payment_method === "string" ? body.payment_method : null,
      product: typeof body.product === "string" ? body.product : null,
      source: typeof body.source === "string" ? body.source : "api",
      status: typeof body.status === "string" ? body.status : "pending",
      total: typeof body.total === "number" ? body.total : null,
      updatedAt: Date.now(),
    };

    orders.set(orderId, order);

    console.log(`Created order ${orderId}`);

    return res.status(200).json({
      success: true,
      orderId,
    });
  } catch (error) {
    console.error("POST /api/order failed:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
});

app.get("/api/order/latest", (_req, res) => {
  try {
    const latestOrder = getLatestOrder();

    return res.status(200).json({
      success: true,
      order_id: latestOrder ? latestOrder.order_id : null,
    });
  } catch (error) {
    console.error("GET /api/order/latest failed:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch latest order",
    });
  }
});

app.get("/api/order/:id", (req, res) => {
  try {
    const orderId = String(req.params.id || "").trim();
    const order = orders.get(orderId) || null;

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET /api/order/:id failed:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch order",
    });
  }
});

app.patch("/api/order", (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const orderId =
      typeof body.order_id === "string" ? body.order_id.trim() : "";

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "order_id is required",
      });
    }

    const existingOrder = orders.get(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const updatedOrder = {
      ...existingOrder,
      discord_user_id:
        typeof body.discord_user_id === "string"
          ? body.discord_user_id
          : existingOrder.discord_user_id,
      discord_username:
        typeof body.discord_username === "string"
          ? body.discord_username
          : existingOrder.discord_username,
      notes:
        typeof body.notes === "string" ? body.notes : existingOrder.notes,
      payment_method:
        typeof body.payment_method === "string"
          ? body.payment_method
          : existingOrder.payment_method,
      product:
        typeof body.product === "string" ? body.product : existingOrder.product,
      source:
        typeof body.source === "string" ? body.source : existingOrder.source,
      status:
        typeof body.status === "string" ? body.status : existingOrder.status,
      total:
        typeof body.total === "number" ? body.total : existingOrder.total,
      updatedAt: Date.now(),
    };

    orders.set(orderId, updatedOrder);

    console.log(`Updated order ${orderId}`);

    return res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("PATCH /api/order failed:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update order",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

process.on("unhandledRejection", (error) => {
  console.error("UNHANDLED REJECTION:", error);
});

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
});

const server = app.listen(PORT, HOST, () => {
  console.log(`API server listening on http://${HOST}:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});
