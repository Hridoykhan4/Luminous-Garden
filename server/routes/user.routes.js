const express = require("express");
const router = express.Router();
const { syncUser } = require("../controllers/user.controller");

// This function receives 'usersCollection' from index.js
module.exports = (usersCollection) => {
  // Pass the collection into the controller function
  router.post("/", (req, res) => syncUser(req, res, usersCollection));

  return router;
};
