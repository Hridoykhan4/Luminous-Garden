const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const MIN_STRIPE_BDT = 70;
const VALID_SSL_STATUSES = new Set(["VALID", "VALIDATED"]);

const generateTransactionID = () => {
  const prefix = "TXN";
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);

  return `${prefix}-${timestamp}-${randomPart}`.toUpperCase();
};

const validateSSLPayment = async (valId) => {
  const base =
    process.env.SSL_ENV === "live"
      ? "https://securepay.sslcommerz.com"
      : "https://sandbox.sslcommerz.com";

  const url =
    `${base}/validator/api/validationserverAPI.php` +
    `?val_id=${encodeURIComponent(valId)}` +
    `&store_id=${encodeURIComponent(process.env.SSL_store_id)}` +
    `&store_passwd=${encodeURIComponent(process.env.SSL_store_passwd)}` +
    `&v=1&format=json`;

  const response = await fetch(url);
  return response.json();
};

const createSSLInitialize = ({ plantsCollection, sslPaymentsCollection }) =>
  asyncHandler(async (req, res) => {
    const { plantId, quantity, customer, delivery, payment } = req.body;
    if (!plantId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Plant ID and quantity are required",
      });
    }
    if (payment?.method !== "sslcommerz") {
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
    // console.log(plant);
    const unitPrice = Number(plant.price || 0);
    const totalAmountBdt = unitPrice * qty;

    const transactionId = generateTransactionID();

    await sslPaymentsCollection.insertOne({
      tranId: transactionId,
      plantId: String(plant._id),
      quantity: qty,
      amount: totalAmountBdt,
      customer: {
        name: customer?.name || "",
        email: customer?.email || "",
        phone: customer?.phone || "",
        photo: customer?.photo || "",
      },
      delivery: {
        address: delivery?.address || "",
        area: delivery?.area || "",
        district: delivery?.district || "",
        region: delivery?.region || "",
        note: delivery?.note || "",
        coords: delivery?.coords || null,
      },
      payment: {
        method: "sslcommerz",
        status: "initiated",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const serverBase =
      process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;

    const gatewayBase =
      process.env.SSL_ENV === "live"
        ? "https://securepay.sslcommerz.com"
        : "https://sandbox.sslcommerz.com";

    const initiateData = {
      store_id: process.env.SSL_store_id,
      store_passwd: process.env.SSL_store_passwd,
      total_amount: String(totalAmountBdt),
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${serverBase}/payments/ssl/success`,
      fail_url: `${serverBase}/payments/ssl/fail`,
      cancel_url: `${serverBase}/payments/ssl/cancel`,
      ipn_url: `${serverBase}/payments/ssl/ipn`,
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

    const initRes = await fetch(`${gatewayBase}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(initiateData),
    });

    const data = await initRes.json();

    if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
      await sslPaymentsCollection.updateOne(
        { tranId: transactionId },
        {
          $set: {
            "payment.status": "init_failed",
            gatewayResponse: data,
            updatedAt: new Date(),
          },
        },
      );

      return res.status(400).json({
        success: false,
        message: data.failedreason || "Failed to initialize SSLCommerz payment",
        ssl: data,
      });
    }

    return res.status(200).json({
      success: true,
      url: data.GatewayPageURL,
      sessionkey: data.sessionkey,
      tranId: transactionId,
    });
  });

const finalizeSSLOrder = async ({
  payload,
  plantsCollection,
  ordersCollection,
  trackingCollection,
  sslPaymentsCollection,
}) => {
  if (!payload?.val_id) {
    throw new Error("Missing val_id");
  }
  const validated = await validateSSLPayment(payload.val_id);
  if (!VALID_SSL_STATUSES.has(validated.status)) {
    throw new Error(validated.status || "Payment validation failed");
  }
  const pending = await sslPaymentsCollection.findOne({
    tranId: validated.tran_id,
  });
  if (!pending) {
    throw new Error("Pending SSL payment not found");
  }
  const existingOrder = await ordersCollection.findOne({
    "payment.tranId": validated.tran_id,
  });

  if (existingOrder) {
    await sslPaymentsCollection.updateOne(
      { tranId: validated.tran_id },
      {
        $set: {
          "payment.status": "paid",
          orderId: existingOrder._id,
          validatedPayload: validated,
          updatedAt: new Date(),
        },
      },
    );
    return existingOrder;
  }
  if (Number(validated.amount) !== Number(pending.amount)) {
    throw new Error("Amount mismatch");
  }

  const plant = await plantsCollection.findOne({
    _id: new ObjectId(pending.plantId),
  });

  if (!plant) {
    throw new Error("Plant not found");
  }

  if ((plant.quantity || 0) < Number(pending.quantity)) {
    throw new Error("Insufficient stock while finalizing order");
  }

  await plantsCollection.updateOne(
    { _id: new ObjectId(pending.plantId) },
    {
      $inc: { quantity: -Number(pending.quantity) },
      $set: { updatedAt: new Date() },
    },
  );

  const order = {
    plantId: new ObjectId(pending.plantId),
    plantName: plant.name,
    plantImage: plant.image,
    plantCategory: plant.category,
    quantity: Number(pending.quantity),
    pricePerUnit: plant.price,
    totalPrice: plant.price * Number(pending.quantity),
    customer: pending.customer,
    seller: {
      name: plant.seller?.name || "",
      email: plant.seller?.email || "",
    },
    delivery: pending.delivery,
    payment: {
      method: "sslcommerz",
      status: "paid",
      tranId: validated.tran_id,
      valId: validated.val_id,
      bankTranId: validated.bank_tran_id || "",
      cardType: validated.card_type || "",
      cardBrand: validated.card_brand || "",
      storeAmount: Number(validated.store_amount || 0),
      raw: validated,
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
        description: "Your online payment has been placed successfully.",
        icon: "receipt",
        timestamp: new Date(),
        actor: order.customer.email,
      },
    ],
    currentStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await sslPaymentsCollection.updateOne(
    { tranId: validated.tran_id },
    {
      $set: {
        "payment.status": "paid",
        orderId: result.insertedId,
        validatedPayload: validated,
        updatedAt: new Date(),
      },
    },
  );

  return { ...order, _id: result.insertedId };
};

const sslSuccess = ({
  plantsCollection,
  ordersCollection,
  trackingCollection,
  sslPaymentsCollection,
}) =>
  asyncHandler(async (req, res) => {
    try {
      const payload = Object.keys(req.body || {}).length ? req.body : req.query;

      const order = await finalizeSSLOrder({
        payload,
        plantsCollection,
        ordersCollection,
        trackingCollection,
        sslPaymentsCollection,
      });

      return res.redirect(
        `${process.env.CLIENT_URL}/checkout/ssl/success?orderId=${order._id}`,
      );
    } catch (error) {
      return res.redirect(
        `${process.env.CLIENT_URL}/checkout/ssl/fail?message=${encodeURIComponent(error.message)}`,
      );
    }
  });

const sslIPN = ({
  plantsCollection,
  ordersCollection,
  trackingCollection,
  sslPaymentsCollection,
}) =>
  asyncHandler(async (req, res) => {
    try {
      await finalizeSSLOrder({
        payload: req.body,
        plantsCollection,
        ordersCollection,
        trackingCollection,
        sslPaymentsCollection,
      });

      return res.status(200).send("OK");
    } catch (error) {
      return res.status(400).send(error.message || "FAILED");
    }
  });

const sslFail = ({ sslPaymentsCollection }) =>
  asyncHandler(async (req, res) => {
    const payload = Object.keys(req.body || {}).length ? req.body : req.query;
    const tranId = payload?.tran_id;

    if (tranId) {
      await sslPaymentsCollection.updateOne(
        { tranId },
        {
          $set: {
            "payment.status": "failed",
            failPayload: payload,
            updatedAt: new Date(),
          },
        },
      );
    }

    return res.redirect(`${process.env.CLIENT_URL}/checkout/ssl/fail`);
  });

const sslCancel = ({ sslPaymentsCollection }) =>
  asyncHandler(async (req, res) => {
    const payload = Object.keys(req.body || {}).length ? req.body : req.query;
    const tranId = payload?.tran_id;

    if (tranId) {
      await sslPaymentsCollection.updateOne(
        { tranId },
        {
          $set: {
            "payment.status": "cancelled",
            cancelPayload: payload,
            updatedAt: new Date(),
          },
        },
      );
    }

    return res.redirect(`${process.env.CLIENT_URL}/checkout/ssl/cancel`);
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

module.exports = {
  createStripeCheckoutSession,
  finalizeStripeOrder,
  createSSLInitialize,
  sslSuccess,
  sslFail,
  sslIPN,
  sslCancel,
};
