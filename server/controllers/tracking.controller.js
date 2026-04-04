const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");

/* ─────────────────────────────────────────────
   TIMELINE EVENT DEFINITIONS
   Each status change pushes one of these into
   the tracking.events array.
───────────────────────────────────────────── */
const STATUS_EVENTS = {
  pending: {
    title: "Order Received",
    description:
      "Your order has been placed and is awaiting seller confirmation.",
    icon: "receipt",
  },
  confirmed: {
    title: "Order Confirmed",
    description: "Seller has confirmed your order and is preparing it.",
    icon: "check",
  },
  shipped: {
    title: "Out for Delivery",
    description:
      "Your specimen is on the way. Please be available to receive it.",
    icon: "truck",
  },
  delivered: {
    title: "Delivered",
    description: "Order successfully delivered. Enjoy your plant!",
    icon: "leaf",
  },
  cancelled: {
    title: "Order Cancelled",
    description: "This order has been cancelled and stock has been restored.",
    icon: "x",
  },
};

/* ─────────────────────────────────────────────
   CREATE TRACKING DOC
   Called internally when an order is created.
   Not a public route.
───────────────────────────────────────────── */
const createTracking = async (trackingCollection, order, orderId) => {
  const trackingDoc = {
    orderId: new ObjectId(orderId),
    plantName: order.plantName,
    plantImage: order.plantImage,

    customer: order.customer,
    seller: order.seller,

    // Delivery address stored for geocoding on the frontend
    delivery: order.delivery,

    // Timeline array — chronological, newest last
    events: [
      {
        status: "pending",
        ...STATUS_EVENTS.pending,
        timestamp: new Date(),
        actor: order.customer.email, // who triggered
      },
    ],

    currentStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await trackingCollection.insertOne(trackingDoc);
};

/* ─────────────────────────────────────────────
   PUSH TRACKING EVENT
   Called internally when order status changes.
───────────────────────────────────────────── */
const pushTrackingEvent = async (
  trackingCollection,
  orderId,
  status,
  actorEmail,
) => {
  const event = STATUS_EVENTS[status];
  if (!event) return;

  await trackingCollection.updateOne(
    { orderId: new ObjectId(orderId) },
    {
      $push: {
        events: {
          status,
          ...event,
          timestamp: new Date(),
          actor: actorEmail,
        },
      },
      $set: {
        currentStatus: status,
        updatedAt: new Date(),
      },
    },
  );
};

/* ─────────────────────────────────────────────
   GET TRACKING
   GET /tracking/:orderId
   Public-ish — buyer, seller, admin only
───────────────────────────────────────────── */
const getTracking = asyncHandler(
  async (req, res, trackingCollection, usersCollection) => {
    const { orderId } = req.params;

    if (!ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }

    const tracking = await trackingCollection.findOne({
      orderId: new ObjectId(orderId),
    });

    if (!tracking) {
      return res
        .status(404)
        .json({ success: false, message: "Tracking not found" });
    }

    // Access check — only buyer, seller of this order, or admin
    const email = req.user?.email;
    const user = await usersCollection.findOne({ email: req.user.email });
    const role = user?.role;

    if (
      role !== "admin" &&
      tracking.customer.email !== email &&
      tracking.seller.email !== email
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: tracking });
  },
);

module.exports = { createTracking, pushTrackingEvent, getTracking };
