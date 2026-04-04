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
    (req, res, next) => getOrders(req, res, ordersCollection).catch(next),
  );

  router.get("/track/:orderId", verifyToken, (req, res, next) =>
    getTracking(req, res, trackingCollection, usersCollection).catch(next),
  );

  /* GET /orders/:id */
  router.get(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res, next) => getSingleOrder(req, res, ordersCollection).catch(next),
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
