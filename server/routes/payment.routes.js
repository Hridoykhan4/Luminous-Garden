const express = require("express");
const {
  createStripeCheckoutSession,
  finalizeStripeOrder,
  createSSLInitialize,
} = require("../controllers/payment.controller");

module.exports = (plantsCollection, ordersCollection, trackingCollection) => {
  const router = express.Router();

  router.post(
    "/stripe/checkout-session",
    createStripeCheckoutSession({ plantsCollection }),
  );

  router.post('/create-ssl-payment', async(req,res) => {
    createSSLInitialize({plantsCollection})
  })

  router.post(
    "/stripe/finalize",
    finalizeStripeOrder({
      plantsCollection,
      ordersCollection,
      trackingCollection,
    }),
  );

  return router;
};
