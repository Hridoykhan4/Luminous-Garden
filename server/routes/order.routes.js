const express = require("express");
const {
  createOrder,
  getOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/order.controller");
const { getTracking } = require("../controllers/tracking.controller");
const { verifyToken, verifyRole } = require("../middlewares/auth.middleware");

module.exports = (
  ordersCollection,
  plantsCollection,
  usersCollection,
  trackingCollection,
) => {
  // ✅ CRITICAL: router must be created INSIDE the factory function.
  // If declared at module scope, Express reuses the same singleton router
  // across requires — meaning the collections closure from the first call
  // is permanently bound, and middleware registration can be duplicated
  // on hot reload. Always create router inside the factory.
  const router = express.Router();

  /* POST /orders — any logged-in user can place an order */
  router.post(
    "/",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res, next) =>
      createOrder(
        req,
        res,
        plantsCollection,
        ordersCollection,
        trackingCollection,
      ).catch(next),
  );

  /* GET /orders — role-aware, returns buyer or seller view */
  router.get(
    "/",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res, next) =>
      getOrders(req, res, ordersCollection).catch(next),
  );

  /*
    IMPORTANT: /track/:orderId MUST be before /:id
    Otherwise Express matches "track" as an order _id param
    → ObjectId.isValid("track") = false → 400 error
  */
  router.get(
    "/track/:orderId",
    verifyToken,
    // No verifyToken here — tracking page is accessible via public share link
    // The controller itself checks ownership before exposing sensitive fields
    (req, res, next) =>
      getTracking(req, res, trackingCollection, usersCollection).catch(next),
  );

  /* GET /orders/:id */
  router.get(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res, next) =>
      getSingleOrder(req, res, ordersCollection).catch(next),
  );

  /* PATCH /orders/:id/status */
  router.patch(
    "/:id/status",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res, next) =>
      updateOrderStatus(
        req,
        res,
        ordersCollection,
        plantsCollection,
        trackingCollection,
      ).catch(next),
  );

  /* DELETE /orders/:id — admin only */
  router.delete(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["admin"]),
    (req, res, next) =>
      deleteOrder(
        req,
        res,
        ordersCollection,
        plantsCollection,
        trackingCollection,
      ).catch(next),
  );

  return router;
};