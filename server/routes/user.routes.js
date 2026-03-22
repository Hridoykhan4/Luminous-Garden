const express = require("express");
const {
  syncUser,
  getUsers,
  getUserRole,
} = require("../controllers/user.controller");

const userRoutes = (usersCollection) => {
  const router = express.Router();

  router.post("/", (req, res, next) =>
    syncUser(req, res, usersCollection).catch(next),
  );

  router.get("/", (req, res, next) =>
    getUsers(req, res, usersCollection).catch(next),
  );

  router.get("/role/:email", (req, res, next) =>
    getUserRole(req, res, usersCollection).catch(next),
  );

  return router;
};

module.exports = userRoutes;
