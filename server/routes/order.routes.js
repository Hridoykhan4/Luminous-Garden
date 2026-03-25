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
  /* POST /orders */
  router.post("/", verifyToken, (req, res) =>
    createOrder(
      req,
      res,
      plantsCollection,
      ordersCollection,
      trackingCollection,
    ),
  );

  /* GET /orders */
  router.get(
    "/",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res) => getOrders(req, res, ordersCollection, usersCollection),
  );

  /* GET /orders/:id */
  router.get(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res) => getSingleOrder(req, res, ordersCollection),
  );

  /* PATCH /orders/:id/status */
  router.patch(
    "/:id/status",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res) =>
      updateOrderStatus(
        req,
        res,
        ordersCollection,
        plantsCollection,
        trackingCollection,
      ),
  );

  /* GET /orders/track/:orderId  — tracking timeline */
  router.get(
    "/track/:orderId",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res) => getTracking(req, res, trackingCollection, usersCollection),
  );

  /* DELETE /orders/:id */
  router.delete(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["admin"]),
    (req, res) => deleteOrder(req, res, ordersCollection, trackingCollection),
  );

  return router;
};
