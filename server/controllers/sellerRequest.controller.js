const { ObjectId } = require("mongodb");

/* ══════════════════════════════════════════════════════
   submitSellerRequest
   POST /seller-requests
   Body: { shopName, phone, district, address, nidNumber,
           tradeLicense?, experience, specialization, bio }
══════════════════════════════════════════════════════ */
const submitSellerRequest = async (req, res, sellerRequestsCollection) => {
  const email = req.user?.email;
  if (!email)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const {
    shopName,
    phone,
    district,
    address,
    nidNumber,
    tradeLicense,
    experience,
    specialization,
    bio,
    applicantName,
    applicantPhoto,
  } = req.body;

  // Required field check
  const required = {
    shopName,
    phone,
    district,
    address,
    nidNumber,
    experience,
    specialization,
    bio,
  };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length)
    return res
      .status(400)
      .json({ success: false, message: `Missing: ${missing.join(", ")}` });

  // One active request per user
  const existing = await sellerRequestsCollection.findOne({
    applicantEmail: email,
    status: { $in: ["pending", "approved"] },
  });
  if (existing)
    return res.status(409).json({
      success: false,
      message: "You already have an active request",
      status: existing.status,
    });

  const doc = {
    applicantEmail: email,
    applicantName: applicantName || "",
    applicantPhoto: applicantPhoto || "",
    shopName,
    phone,
    district,
    address,
    nidNumber,
    tradeLicense: tradeLicense || null,
    experience,
    specialization,
    bio,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await sellerRequestsCollection.insertOne(doc);

  return res
    .status(201)
    .json({ success: true, message: "Application submitted" });
};

/* ══════════════════════════════════════════════════════
   getMyRequestStatus
   GET /seller-requests/my-status
   Used by BeSeller page to show current state on load
══════════════════════════════════════════════════════ */
const getMyRequestStatus = async (req, res, sellerRequestsCollection) => {
  const email = req.user?.email;
  if (!email)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const request = await sellerRequestsCollection.findOne(
    { applicantEmail: email },
    { sort: { createdAt: -1 } }, // most recent
  );

  if (!request) return res.status(200).json({ success: true, data: null });

  return res.status(200).json({ success: true, data: request });
};

/* ══════════════════════════════════════════════════════
   getSellerRequests  (admin only)
   GET /seller-requests?status=pending
══════════════════════════════════════════════════════ */
const getSellerRequests = async (req, res, sellerRequestsCollection) => {
  const { status } = req.query;

  const filter = {};
  const VALID = ["pending", "approved", "rejected"];
  if (status && VALID.includes(status)) filter.status = status;

  const requests = await sellerRequestsCollection
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return res.status(200).json({
    success: true,
    total: requests.length,
    data: requests,
  });
};

/* ══════════════════════════════════════════════════════
   handleSellerRequest  (admin only)
   PATCH /seller-requests/:id
   Body: { action: "approve" | "reject" }

   On approve → also upgrades the user's role to "seller"
══════════════════════════════════════════════════════ */
const handleSellerRequest = async (
  req,
  res,
  sellerRequestsCollection,
  usersCollection,
) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!["approve", "reject"].includes(action))
    return res.status(400).json({
      success: false,
      message: "action must be 'approve' or 'reject'",
    });

  if (!ObjectId.isValid(id))
    return res
      .status(400)
      .json({ success: false, message: "Invalid request ID" });

  const request = await sellerRequestsCollection.findOne({
    _id: new ObjectId(id),
  });
  if (!request)
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });

  if (request.status !== "pending")
    return res
      .status(409)
      .json({ success: false, message: "Request already processed" });

  const newStatus = action === "approve" ? "approved" : "rejected";

  // Update request status
  await sellerRequestsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: newStatus,
        reviewedAt: new Date().toISOString(),
        reviewedBy: req.user?.email,
        updatedAt: new Date().toISOString(),
      },
    },
  );

  // If approved → upgrade user role to seller
  if (action === "approve") {
    await usersCollection.updateOne(
      { email: request.applicantEmail },
      {
        $set: {
          role: "seller",
          sellerInfo: {
            shopName: request.shopName,
            district: request.district,
            specialization: request.specialization,
            phone: request.phone,
            approvedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        },
      },
    );
  }

  return res.status(200).json({
    success: true,
    message:
      action === "approve"
        ? "Seller approved and role upgraded"
        : "Request rejected",
  });
};

module.exports = {
  submitSellerRequest,
  getSellerRequests,
  handleSellerRequest,
  getMyRequestStatus,
};
