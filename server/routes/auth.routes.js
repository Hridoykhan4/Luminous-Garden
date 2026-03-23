const express = require("express");
const router = express.Router();
const { generateToken, logoutUser } = require("../controllers/auth.controller");

router.post("/jwt", generateToken);
router.post("/logout", logoutUser);

module.exports = router;
