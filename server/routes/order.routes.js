const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/order.controller");
const { verifyToken, verifyRole } = require("../middlewares/auth.middleware");

module.exports = (ordersCollection, plantsCollection, usersCollection) => {
  router.post("/", verifyToken, (req, res) =>
    createOrder(req, res, plantsCollection, ordersCollection),
  );

  // GET /orders — authenticated, role-aware
  router.get(
    "/",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller"]),
    (req, res) => getOrders(req, res, ordersCollection, usersCollection),
  );

  // GET /orders/:id
  router.get(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res) => getSingleOrder(req, res, ordersCollection),
  );

  // PATCH /orders/:id/status
  router.patch(
    "/:id/status",
    verifyToken,
    verifyRole(usersCollection, ["customer", "seller", "admin"]),
    (req, res) =>
      updateOrderStatus(req, res, ordersCollection, plantsCollection),
  );

  // DELETE /orders/:id — admin only
  router.delete(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["admin"]),
    (req, res) => deleteOrder(req, res, ordersCollection),
  );

  return router;
};
