const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");
const createOrder = asyncHandler(
  async (req, res, plantsCollection, ordersCollection) => {
    const { plantId, quantity, customer, delivery, payment } = req.body;

    /* ── 1. Validate input ── */
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

    /* ── 2. Fetch plant + atomic stock check & decrement ── */
    // findOneAndUpdate with $inc is atomic — no race condition
    const updatedPlant = await plantsCollection.findOneAndUpdate(
      {
        _id: new ObjectId(plantId),
        status: { $ne: "flagged" },
        quantity: { $gte: qty }, // only succeeds if enough stock
      },
      {
        $inc: { quantity: -qty }, // decrement atomically
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "before" }, // return doc before decrement
    );

    if (!updatedPlant) {
      return res.status(409).json({
        success: false,
        message:
          "Insufficient stock or plant unavailable. Please refresh and try again.",
      });
    }

    const plant = updatedPlant;

    /* ── 3. Build order document ── */
    const order = {
      // Plant snapshot — store at time of order so history is preserved
      plantId: new ObjectId(plantId),
      plantName: plant.name,
      plantImage: plant.image,
      plantCategory: plant.category,

      quantity: qty,
      pricePerUnit: plant.price,
      totalPrice: plant.price * qty,

      // Customer — from req.user (auth) + form input
      customer: {
        name: customer.name || req.user.displayName || "",
        email: req.user.email,
        phone: customer.phone,
        photo: customer?.photo || "",
      },

      // Seller snapshot
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
        method: payment?.method || "cod", // cod | stripe | bkash
        status: "pending", // pending | paid | refunded
      },

      // Order lifecycle
      status: "pending", // pending → confirmed → shipped → delivered | cancelled
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: result.insertedId,
      orderData: { ...order, _id: result.insertedId },
    });
  },
);

const getOrders = asyncHandler(
  async (req, res, ordersCollection, usersCollection) => {
    const { role = "buyer", status, page = "1", limit = "20" } = req.query;

    const email = req.user.email;
    const isAdmin = await usersCollection.findOne({ email, role: "admin" });
    console.log(isAdmin);

    const query = {};

    if (!isAdmin) {
      if (role === "seller") {
        // Orders where this user is the seller
        query["seller.email"] = email;
      } else {
        // Default: orders placed by this user
        query["customer.email"] = email;
      }
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

module.exports = { createOrder, getOrders };
