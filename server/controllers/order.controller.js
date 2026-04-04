const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");
const { createTracking, pushTrackingEvent } = require("./tracking.controller");

/* ─────────────────────────────────────────────
   STATUS MACHINE
   Defines who can move an order to what state.
   This is the single source of truth.
─────────────────────────────────────────────
   pending    → seller: confirmed | cancelled
                buyer:  cancelled
   confirmed  → seller: shipped
   shipped    → seller: delivered
   delivered  → nobody (terminal + COD paid)
   cancelled  → nobody (terminal)
───────────────────────────────────────────── */
const TRANSITIONS = {
  seller: {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  },
  customer: {
    pending: ["cancelled"],
    confirmed: [],
    shipped: [],
    delivered: [],
    cancelled: [],
  },
};

const TERMINAL = ["delivered", "cancelled"];

/* ─────────────────────────────────────────────
   CREATE ORDER
───────────────────────────────────────────── */
const createOrder = asyncHandler(
  async (req, res, plantsCollection, ordersCollection, trackingCollection) => {
    const { plantId, quantity, customer, delivery, payment } = req.body;

    if (!plantId || !quantity || !customer?.phone || !delivery?.address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: phone and address are required",
      });
    }
    if (!ObjectId.isValid(plantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid plant ID" });
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least 1" });
    }

    /* Atomic: check stock AND decrement in one operation — race-condition safe */
    const plant = await plantsCollection.findOneAndUpdate(
      {
        _id: new ObjectId(plantId),
        status: { $ne: "flagged" },
        quantity: { $gte: qty },
      },
      { $inc: { quantity: -qty }, $set: { updatedAt: new Date() } },
      { returnDocument: "before" },
    );

    if (!plant) {
      return res.status(409).json({
        success: false,
        message: "Insufficient stock or plant unavailable",
      });
    }

    const order = {
      plantId: new ObjectId(plantId),
      plantName: plant.name,
      plantImage: plant.image,
      plantCategory: plant.category,
      quantity: qty,
      pricePerUnit: plant.price,
      totalPrice: plant.price * qty,
      customer: {
        name: customer.name || req.user.displayName || "",
        email: req.user.email,
        phone: customer.phone,
        photo: customer.photo || "",
      },
      seller: {
        name: plant.seller?.name || "",
        email: plant.seller?.email || "",
      },
      delivery: {
        address: delivery.address,
        area: delivery.area || "",
        note: delivery.note || "",
      },
      payment: {
        method: payment?.method || "cod",
        status: "pending",
      },
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);
    await createTracking(trackingCollection, order, result.insertedId);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: result.insertedId,
      orderData: { ...order, _id: result.insertedId },
    });
  },
);

/* ─────────────────────────────────────────────
   GET ORDERS
───────────────────────────────────────────── */
const getOrders = asyncHandler(async (req, res, ordersCollection) => {
  const {
    role: perspective = "customer",
    status,
    page = "1",
    limit = "20",
  } = req.query;

  const email = req.user?.email;
  if (!email)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const isAdmin = req.userRole === "admin";

  const query = {};
  if (!isAdmin) {
    query[perspective === "seller" ? "seller.email" : "customer.email"] = email;
  }
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(parseInt(limit, 10), 100));
  const skip = (pageNum - 1) * limitNum;

  const [orders, totalCount] = await Promise.all([
    ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray(),
    ordersCollection.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
    data: orders,
  });
});

/* ─────────────────────────────────────────────
   GET SINGLE ORDER
───────────────────────────────────────────── */
const getSingleOrder = asyncHandler(async (req, res, ordersCollection) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order ID" });
  }

  const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  const email = req.user.email;
  if (
    req.userRole !== "admin" &&
    order.customer.email !== email &&
    order.seller.email !== email
  ) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  res.status(200).json({ success: true, data: order });
});

/* ─────────────────────────────────────────────
   UPDATE ORDER STATUS
   Rules:
   - Terminal orders (delivered/cancelled) → immutable
   - COD orders marked delivered → payment.status = "paid"
   - Cancelled orders → stock restored
───────────────────────────────────────────── */
const updateOrderStatus = asyncHandler(
  async (req, res, ordersCollection, plantsCollection, trackingCollection) => {
    const { id } = req.params;
    const { status } = req.body;
    const email = req.user.email;

    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }

    const VALID = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!VALID.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID.join(", ")}`,
      });
    }

    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    /* Block all changes on terminal states */
    if (TERMINAL.includes(order.status)) {
      return res.status(409).json({
        success: false,
        message: `Order is already ${order.status} and cannot be modified`,
      });
    }

    const isBuyer = order.customer.email === email;
    const isSeller = order.seller.email === email;
    const isAdmin = req.userRole === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    /* Check transition is valid for this actor */
    if (!isAdmin) {
      const actorRole = isSeller ? "seller" : "customer";
      const allowed = TRANSITIONS[actorRole][order.status] || [];
      if (!allowed.includes(status)) {
        return res.status(403).json({
          success: false,
          message: `As a ${actorRole}, you cannot move an order from "${order.status}" to "${status}"`,
        });
      }
    }

    /* Build the update payload */
    const setPayload = { status, updatedAt: new Date() };

    /* COD: mark payment as paid when seller confirms delivery */
    if (status === "delivered" && order.payment.method === "cod") {
      setPayload["payment.status"] = "paid";
    }

    /* Restore stock if cancelling */
    if (status === "cancelled") {
      await plantsCollection.updateOne(
        { _id: order.plantId },
        { $inc: { quantity: order.quantity }, $set: { updatedAt: new Date() } },
      );
    }

    await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: setPayload },
    );
    await pushTrackingEvent(trackingCollection, id, status, email);

    res
      .status(200)
      .json({ success: true, message: `Order updated to "${status}"` });
  },
);

/* ─────────────────────────────────────────────
   DELETE ORDER  (admin only)
   - Cannot delete delivered orders (permanent record)
   - Restores stock if not already cancelled
───────────────────────────────────────────── */
const deleteOrder = asyncHandler(
  async (req, res, ordersCollection, plantsCollection, trackingCollection) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }

    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    /* Delivered orders are permanent records — cannot delete */
    if (order.status === "delivered") {
      return res.status(409).json({
        success: false,
        message:
          "Delivered orders cannot be deleted — they are permanent records",
      });
    }

    /* Restore stock if order was active (not already cancelled) */
    if (order.status !== "cancelled") {
      await plantsCollection.updateOne(
        { _id: order.plantId },
        { $inc: { quantity: order.quantity }, $set: { updatedAt: new Date() } },
      );
    }

    await ordersCollection.deleteOne({ _id: new ObjectId(id) });
    await trackingCollection.deleteOne({ orderId: new ObjectId(id) });

    res
      .status(200)
      .json({ success: true, message: "Order deleted and stock restored" });
  },
);

module.exports = {
  createOrder,
  getOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
};
