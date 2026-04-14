const express = require("express");
const { getAdminStats } = require("../controllers/adminState.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

module.exports = (
  plantsCollection,
  usersCollection,
  ordersCollection,
  trackingCollection,
  sellerRequestsCollection,
) => {
  const router = express.Router();

  router.get(
    "/",
    verifyToken,
    getAdminStats({
      plantsCollection,
      usersCollection,
      ordersCollection,
      trackingCollection,
      sellerRequestsCollection,
    }),
  );

  return router;
};


