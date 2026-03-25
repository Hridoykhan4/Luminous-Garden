const express = require("express");
const router = express.Router();

const {
  addPlant,
  getPlants,
  getPlantStats,
  getSinglePlant,
  updatePlantStatus,
  updatePlant,
  deletePlant,
} = require("../controllers/plant.controller");

const {
  verifyToken,
  verifyRole,
  authenticateOptional,
} = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate");
const { plantSchema } = require("../shared/validation");

module.exports = (plantsCollection, usersCollection) => {
  router.get("/stats", (req, res) => getPlantStats(req, res, plantsCollection));


  router.get("/", authenticateOptional, (req, res) =>
    getPlants(req, res, plantsCollection),
  );

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

  router.patch(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["seller", "admin"]),
    (req, res) => updatePlant(req, res, plantsCollection),
  );

  router.delete(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["seller", "admin"]),
    (req, res) => deletePlant(req, res, plantsCollection),
  );

  return router;
};
