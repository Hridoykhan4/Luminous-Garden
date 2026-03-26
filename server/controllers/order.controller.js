const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");
const { createTracking, pushTrackingEvent } = require("./tracking.controller");

/* ─────────────────────────────────────────────
   CREATE ORDER
───────────────────────────────────────────── */
const createOrder = asyncHandler(
  async (req, res, plantsCollection, ordersCollection, trackingCollection) => {
    const { plantId, quantity, customer, delivery, payment } = req.body;

    if (!plantId || !quantity || !customer?.phone || !delivery?.address) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required order fields" });
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
        .json({ success: false, message: "Invalid quantity" });
    }

    /* Atomic stock decrement */
    const updatedPlant = await plantsCollection.findOneAndUpdate(
      {
        _id: new ObjectId(plantId),
        status: { $ne: "flagged" },
        quantity: { $gte: qty },
      },
      { $inc: { quantity: -qty }, $set: { updatedAt: new Date() } },
      { returnDocument: "before" },
    );

    if (!updatedPlant) {
      return res.status(409).json({
        success: false,
        message: "Insufficient stock or plant unavailable. Please refresh.",
      });
    }

    const plant = updatedPlant;

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
        photo: customer?.photo || "",
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

    /* Create tracking document for this order */
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
const getOrders = asyncHandler(
  async (req, res, ordersCollection, usersCollection) => {
    const { role = "customer", status, page = "1", limit = "20" } = req.query;
    const email = req.user.email;

    const isAdmin = await usersCollection.findOne({ email, role: "admin" });

    const query = {};
    if (!isAdmin) {
      query[role === "seller" ? "seller.email" : "customer.email"] = email;
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
  },
);

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
   UPDATE ORDER STATUS  +  push tracking event
───────────────────────────────────────────── */
const updateOrderStatus = asyncHandler(
  async (req, res, ordersCollection, plantsCollection, trackingCollection) => {
    const { id } = req.params;
    const { status } = req.body;
    const email = req.user.email;

    const VALID = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!VALID.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }
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

    const isBuyer = order.customer.email === email;
    const isSeller = order.seller.email === email;
    const isAdmin = req.userRole === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    /* Buyer can only cancel pending */
    if (
      isBuyer &&
      !isAdmin &&
      !(status === "cancelled" && order.status === "pending")
    ) {
      return res.status(403).json({
        success: false,
        message: "Buyers can only cancel pending orders",
      });
    }

    /* Seller allowed transitions */
    const SELLER_FLOW = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped"],
      shipped: ["delivered"],
    };
    if (isSeller && !isAdmin && !SELLER_FLOW[order.status]?.includes(status)) {
      return res.status(403).json({
        success: false,
        message: `Cannot move ${order.status} → ${status}`,
      });
    }

    /* Restore stock on cancel */
    if (status === "cancelled" && order.status !== "cancelled") {
      await plantsCollection.updateOne(
        { _id: order.plantId },
        { $inc: { quantity: order.quantity }, $set: { updatedAt: new Date() } },
      );
    }

    /* Update order */
    await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
    );

    /* Push event to tracking timeline */
    await pushTrackingEvent(trackingCollection, id, status, email);

    res.status(200).json({ success: true, message: `Order ${status}` });
  },
);

/* ─────────────────────────────────────────────
   DELETE ORDER (admin only)
───────────────────────────────────────────── */
const deleteOrder = asyncHandler(
  async (req, res, ordersCollection, trackingCollection) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }

    const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    /* Also remove the tracking doc */
    await trackingCollection.deleteOne({ orderId: new ObjectId(id) });

    res.status(200).json({ success: true, message: "Order deleted" });
  },
);

module.exports = {
  createOrder,
  getOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
};
