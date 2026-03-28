const express = require("express");

const { verifyToken, verifyRole } = require("../middlewares/auth.middleware");
const {
  submitSellerRequest,
  getMyRequestStatus,
  getSellerRequests,
  handleSellerRequest,
} = require("../controllers/sellerrequest.controller");

const sellerRequestRoutes = (sellerRequestsCollection, usersCollection) => {
  const router = express.Router();

  // User submits their own application
  router.post("/", verifyToken, (req, res, next) =>
    submitSellerRequest(req, res, sellerRequestsCollection).catch(next),
  );

  // User checks their own request status (for BeSeller page guard)
  router.get("/my-status", verifyToken, (req, res, next) =>
    getMyRequestStatus(req, res, sellerRequestsCollection).catch(next),
  );

  // Admin: get all requests (filterable by status)
  router.get(
    "/",
    verifyToken,
    verifyRole(usersCollection, ["admin"]),
    (req, res, next) =>
      getSellerRequests(req, res, sellerRequestsCollection).catch(next),
  );

  // Admin: approve or reject a request
  router.patch(
    "/:id",
    verifyToken,
    verifyRole(usersCollection, ["admin"]),
    (req, res, next) =>
      handleSellerRequest(
        req,
        res,
        sellerRequestsCollection,
        usersCollection,
      ).catch(next),
  );

  return router;
};

module.exports = sellerRequestRoutes;
