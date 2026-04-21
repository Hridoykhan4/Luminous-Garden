const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const MIN_STRIPE_BDT = 70;

const generateTransactionID = () => {
  const prefix = "TXN";
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);

  return `${prefix}-${timestamp}-${randomPart}`.toUpperCase();
};

const createSSLInitialize = ({ plantsCollection }) =>
  asyncHandler(async (req, res) => {
    const { plantId, quantity, customer, delivery, payment } = req.body;
    if (!plantId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Plant ID and quantity are required",
      });
    }
    if (payment?.method !== "bkash") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method for Stripe checkout",
      });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const plant = await plantsCollection.findOne({
      _id: new ObjectId(plantId),
      status: { $ne: "flagged" },
    });

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    if ((plant.quantity || 0) < qty) {
      return res.status(409).json({
        success: false,
        message: "Insufficient stock",
      });
    }
    // console.log(plant);
    const unitPrice = Number(plant.price || 0);
    const totalAmountBdt = unitPrice * qty;

    const transactionId = generateTransactionID();

    const initiateData = {
      store_id: process.env.store_id,
      store_passwd: process.env.store_passwd,
      total_amount: String(totalAmountBdt),
      currency: "BDT",
      tran_id: transactionId,
      success_url: "http://localhost:5000/payments/success-payment",
      fail_url: `${process.env.CLIENT_URL}/fail`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      ipn_url: "http://localhost:5000/ipn-success",
      shipping_method: "Courier",
      product_name: plant.name,
      product_category: plant.category || "Plant",
      product_profile: "general",

      cus_name: customer?.name || "Customer",
      cus_email: customer?.email || "customer@example.com",
      cus_add1: delivery?.address || "Dhaka",
      cus_city: delivery?.district || "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: customer?.phone || "01700000000",

      ship_name: customer?.name || "Customer",
      ship_add1: delivery?.address || "Dhaka",
      ship_add2: delivery?.area || "",
      ship_city: delivery?.district || "Dhaka",
      ship_state: delivery?.district || "Dhaka",
      ship_postcode: delivery?.postcode || "1000",
      ship_country: "Bangladesh",
    };

    const initRes = await fetch(
      "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(initiateData),
      },
    );

    const data = await initRes.json();

    if (data.status !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: data.failedreason || "SSLCommerze init failed",
        ssl: data,
      });
    }

    res.send({
      success: true,
      url: data.GatewayPageURL,
      sessionkey: data.sessionkey,
    });
  });

const createStripeCheckoutSession = ({ plantsCollection }) =>
  asyncHandler(async (req, res) => {
    if (!plantsCollection) {
      return res.status(500).json({
        success: false,
        message:
          "Payment route is misconfigured: plantsCollection was not provided.",
      });
    }

    const { plantId, quantity, customer, delivery, payment } = req.body;

    if (!plantId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Plant ID and quantity are required",
      });
    }

    if (payment?.method !== "stripe") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method for Stripe checkout",
      });
    }

    if (!ObjectId.isValid(plantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plant ID",
      });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const plant = await plantsCollection.findOne({
      _id: new ObjectId(plantId),
      status: { $ne: "flagged" },
    });

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    if ((plant.quantity || 0) < qty) {
      return res.status(409).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const unitPrice = Number(plant.price || 0);
    const totalAmountBdt = unitPrice * qty;

    if (!unitPrice || totalAmountBdt <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid plant price",
      });
    }

    if (totalAmountBdt < MIN_STRIPE_BDT) {
      return res.status(400).json({
        success: false,
        message: `Card payment is available only for orders of ৳${MIN_STRIPE_BDT} or more. Please use Cash on Delivery for smaller orders.`,
      });
    }

    if (!process.env.CLIENT_URL) {
      return res.status(500).json({
        success: false,
        message: "CLIENT_URL is not configured on the server",
      });
    }

    const unitAmount = Math.round(unitPrice * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      customer_email: customer?.email || req.user?.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: plant.name,
              images: plant.image ? [plant.image] : [],
              description: `${plant.category || "Plant"} • Qty: ${qty}`,
            },
            unit_amount: unitAmount,
          },
          quantity: qty,
        },
      ],
      metadata: {
        plantId: String(plant._id),
        quantity: String(qty),
        customerName: customer?.name || "",
        customerPhone: customer?.phone || "",
        customerEmail: customer?.email || req.user?.email || "",
        address: delivery?.address || "",
        area: delivery?.area || "",
        district: delivery?.district || "",
        region: delivery?.region || "",
        note: delivery?.note || "",
        paymentMethod: "stripe",
        totalAmount: String(totalAmountBdt),
      },
    });

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  });

const finalizeStripeOrder = ({
  plantsCollection,
  ordersCollection,
  trackingCollection,
}) =>
  asyncHandler(async (req, res) => {
    if (!plantsCollection || !ordersCollection || !trackingCollection) {
      return res.status(500).json({
        success: false,
        message:
          "Payment route is misconfigured: required MongoDB collections were not provided.",
      });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Stripe session not found",
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment is not completed",
      });
    }

    const existingOrder = await ordersCollection.findOne({
      "payment.sessionId": session.id,
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Order already finalized",
        orderId: existingOrder._id,
      });
    }

    const plantId = session.metadata?.plantId;
    const quantity = Number(session.metadata?.quantity || 1);

    if (!ObjectId.isValid(plantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plantId in Stripe metadata",
      });
    }

    const plant = await plantsCollection.findOne({
      _id: new ObjectId(plantId),
    });

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    if ((plant.quantity || 0) < quantity) {
      return res.status(409).json({
        success: false,
        message: "Insufficient stock while finalizing order",
      });
    }

    await plantsCollection.updateOne(
      { _id: new ObjectId(plantId) },
      {
        $inc: { quantity: -quantity },
        $set: { updatedAt: new Date() },
      },
    );

    const order = {
      plantId: new ObjectId(plantId),
      plantName: plant.name,
      plantImage: plant.image,
      plantCategory: plant.category,
      quantity,
      pricePerUnit: plant.price,
      totalPrice: plant.price * quantity,
      customer: {
        name: session.metadata?.customerName || "",
        email: session.metadata?.customerEmail || session.customer_email || "",
        phone: session.metadata?.customerPhone || "",
        photo: "",
      },
      seller: {
        name: plant.seller?.name || "",
        email: plant.seller?.email || "",
      },
      delivery: {
        address: session.metadata?.address || "",
        area: session.metadata?.area || "",
        note: session.metadata?.note || "",
      },
      payment: {
        method: "stripe",
        status: "paid",
        sessionId: session.id,
        paymentIntentId: session.payment_intent || "",
      },
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);

    await trackingCollection.insertOne({
      orderId: result.insertedId,
      plantName: order.plantName,
      plantImage: order.plantImage,
      customer: order.customer,
      seller: order.seller,
      delivery: order.delivery,
      events: [
        {
          status: "pending",
          title: "Order Received",
          description: "Your paid order has been placed successfully.",
          icon: "receipt",
          timestamp: new Date(),
          actor: order.customer.email,
        },
      ],
      currentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Stripe order finalized successfully",
      orderId: result.insertedId,
      orderData: { ...order, _id: result.insertedId },
    });
  });

const successPayment = () =>
  asyncHandler(async (req, res) => {
    const paymentSuccess = req.body;
    console.log(paymentSuccess, "Success Info", req);
  });

module.exports = {
  createStripeCheckoutSession,
  finalizeStripeOrder,
  createSSLInitialize,
  successPayment,
};
