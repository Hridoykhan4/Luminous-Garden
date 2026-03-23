const express = require("express");
const router = express.Router();
const {
  addPlant,
  getPlants,
  getSinglePlant,
  updatePlantStatus,
  updatePlant,
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

  router.patch(
    "/status/:id",
    verifyToken,
    verifyRole(usersCollection, ["admin"]),
    (req, res) => updatePlantStatus(req, res, plantsCollection),
  );


  router.patch("/:id", verifyToken, verifyRole(),  updatePlant);

  return router;
};
