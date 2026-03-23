const express = require("express");
const router = express.Router();
const {
  addPlant,
  getPlants,
  getSinglePlant,
} = require("../controllers/plant.controller");
const { verifyToken, verifyRole } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate");
const { plantSchema } = require("../shared/validation");

module.exports = (plantsCollection, usersCollection) => {
  router.get("/", (req, res) => getPlants(req, res, plantsCollection));

  router.get("/:id", (req, res) => getSinglePlant(req, res, plantsCollection));

  router.post(
    "/",
    verifyToken,
    verifyRole(usersCollection, ["seller"]),
    validate(plantSchema),
    (req, res) => addPlant(req, res, plantsCollection),
  );

  return router;
};
