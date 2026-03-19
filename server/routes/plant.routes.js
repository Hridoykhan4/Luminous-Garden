const express = require("express");
const { addPlants, getPlants } = require("../controllers/plant.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const plantRoutes = (plantCollection) => {
  const router = express.Router();

  router.post("/", (req, res, next) =>
    addPlants(req, res, plantCollection).catch(next),
  );

  router.get("/",  verifyToken, (req, res, next) =>
    getPlants(req, res, plantCollection).catch(next),
  );

  return router;
};

module.exports = plantRoutes;
