const express = require("express");
const {
  createStripeCheckoutSession,
  finalizeStripeOrder,
  createSSLInitialize,
  sslSuccess,
  sslFail,
  sslCancel,
  sslIPN,
} = require("../controllers/payment.controller");

module.exports = (
  plantsCollection,
  ordersCollection,
  trackingCollection,
  sslPaymentsCollection,
) => {
  const router = express.Router();

  router.post(
    "/stripe/checkout-session",
    createStripeCheckoutSession({ plantsCollection }),
  );

  router.post(
    "/stripe/finalize",
    finalizeStripeOrder({
      plantsCollection,
      ordersCollection,
      trackingCollection,
    }),
  );

  router.post(
    "/create-ssl-payment",
    createSSLInitialize({ plantsCollection, sslPaymentsCollection }),
  );

  router.post(
    "/ssl/success",
    sslSuccess({
      plantsCollection,
      ordersCollection,
      trackingCollection,
      sslPaymentsCollection,
    }),
  );

  router.post("/ssl/fail", sslFail({ sslPaymentsCollection }));
  router.post("/ssl/cancel", sslCancel({ sslPaymentsCollection }));

  router.post(
    "/ssl/ipn",
    sslIPN({
      plantsCollection,
      ordersCollection,
      trackingCollection,
      sslPaymentsCollection,
    }),
  );

  router.get(
    "/ssl/success",
    sslSuccess({
      plantsCollection,
      ordersCollection,
      trackingCollection,
      sslPaymentsCollection,
    }),
  );
  router.get("/ssl/fail", sslFail({ sslPaymentsCollection }));
  router.get("/ssl/cancel", sslCancel({ sslPaymentsCollection }));

  return router;
};
