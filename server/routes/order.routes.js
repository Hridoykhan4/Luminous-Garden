const express = require("express");
const router = express.Router();
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
  /* POST /orders — any logged-in user can place an order */
  router.post("/", verifyToken, (req, res) =>
    createOrder(
      req,
      res,
      plantsCollection,
      ordersCollection,
      trackingCollection,
    ),
  );

  /* GET /orders — role-aware, returns buyer or seller view */
  router.get(
    "/",
    verifyToken,
    verifyRole(usersCollection, ["user", "customer", "seller", "admin"]),
    (req, res) => getOrders(req, res, ordersCollection, usersCollection),
  );

  /*
    IMPORTANT: /track/:orderId MUST be before /:id
    Otherwise Express matches "track" as an order _id param → ObjectId.isValid("track") = false → 400
  */
  router.get(
    "/track/:orderId",
    verifyToken,
    verifyRole(usersCollection, ["user", "customer", "seller", "admin"]),
    (req, res) => getTracking(req, res, trackingCollection, usersCollection),
  );

  /* GET /orders/:id */
  router.get(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["user", "customer", "seller", "admin"]),
    (req, res) => getSingleOrder(req, res, ordersCollection),
  );

  /* PATCH /orders/:id/status */
  router.patch(
    "/:id/status",
    verifyToken,
    verifyRole(usersCollection, ["user", "customer", "seller", "admin"]),
    (req, res) =>
      updateOrderStatus(
        req,
        res,
        ordersCollection,
        plantsCollection,
        trackingCollection,
      ),
  );

  /* DELETE /orders/:id — admin only */
  router.delete(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["admin"]),
    (req, res) =>
      deleteOrder(
        req,
        res,
        ordersCollection,
        plantsCollection,
        trackingCollection,
      ),
  );

  return router;
};
