const express = require("express");
const router = express.Router();
const { syncUser, getUsers } = require("../controllers/user.controller");

module.exports = (usersCollection) => {
  router.post("/", (req, res) => syncUser(req, res, usersCollection));
  router.get("/", (req, res) => getUsers(req, res, usersCollection));
  return router;
};


