const express = require("express");
const router = express.Router();
const { addPlant, getPlants } = require("../controllers/plant.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate");
const { plantSchema } = require("../shared/validation");

module.exports = (plantsCollection) => {
  // Pass the collection directly into the controller call
  router.get("/", (req, res) => getPlants(req, res, plantsCollection));

  // FIX: Removed 'plantsCollection' from the (req, res) params list
  router.post("/", verifyToken, validate(plantSchema), (req, res) =>
    addPlant(req, res, plantsCollection),
  );

  return router;
};
