const express = require("express");
const router = express.Router();
const { generateToken, logoutUser } = require("../controllers/auth.controller");

// These will be prefixed by "/auth" because of how we link them in index.js
router.post("/jwt", generateToken);
router.get("/logout", logoutUser);

module.exports = router;
