const express = require("express");
const {
  syncUser,
  getUsers,
  getUserRole,
  updateUserRole,
  updateUserStatus,
  updateMyProfile,
} = require("../controllers/user.controller");
const { verifyToken, verifyRole } = require("../middlewares/auth.middleware");

const userRoutes = (usersCollection) => {
  const router = express.Router();

  // ── Public / semi-public ──────────────────────────────────────────
  // Called on every login to upsert the user doc
  router.post("/", (req, res, next) =>
    syncUser(req, res, usersCollection).catch(next),
  );

  // Used by useUserRole hook — no auth needed (role is not sensitive)
  router.get("/role/:email", (req, res, next) =>
    getUserRole(req, res, usersCollection).catch(next),
  );

  // ── Authenticated user updating their OWN profile ─────────────────
  // Must come BEFORE /:id routes so "me" isn't treated as an ObjectId
  router.patch("/me", verifyToken, (req, res, next) =>
    updateMyProfile(req, res, usersCollection).catch(next),
  );

  // ── Admin-only ────────────────────────────────────────────────────
  router.get(
    "/",
    verifyToken,
    verifyRole(usersCollection, ["admin"]),
    (req, res, next) => getUsers(req, res, usersCollection).catch(next),
  );

  router.patch(
    "/:id/role",
    verifyToken,
    verifyRole(usersCollection, ["admin"]),
    (req, res, next) => updateUserRole(req, res, usersCollection).catch(next),
  );

  router.patch(
    "/:id/status",
    verifyToken,
    verifyRole(usersCollection, ["admin"]),
    (req, res, next) => updateUserStatus(req, res, usersCollection).catch(next),
  );

  return router;
};

module.exports = userRoutes;
