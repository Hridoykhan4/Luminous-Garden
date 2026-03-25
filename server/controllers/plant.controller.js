const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");

/* ─────────────────────────────────────────────
   ADD PLANT
───────────────────────────────────────────── */
const addPlant = asyncHandler(async (req, res, plantsCollection) => {
  const plantData = req.body;

  if (!plantData.seller?.email) {
    return res
      .status(400)
      .json({ success: false, message: "Seller identity is required" });
  }
  if (plantData.seller.email !== req.user.email) {
    return res
      .status(403)
      .json({ success: false, message: "Security Alert: Identity Mismatch" });
  }

  const { _id, ...cleanData } = plantData;

  const result = await plantsCollection.insertOne({
    ...cleanData,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.status(201).json({
    success: true,
    message: "Specimen successfully added to the garden",
    insertedId: result.insertedId,
  });
});

/* ─────────────────────────────────────────────
   GET PLANTS
───────────────────────────────────────────── */
const getPlants = asyncHandler(async (req, res, plantsCollection) => {
  const {
    email,
    search,
    category,
    minPrice,
    maxPrice,
    role,
    page = "1",
    limit = "10",
  } = req.query;

  const query = {};

  /* 1. Status — hide flagged from non-admins */
  if (role !== "admin") {
    query.status = { $ne: "flagged" };
  }

  /* 2. Seller filter */
  if (email) query["seller.email"] = email;

  /* 3. Category — skip when empty or "all" */
  if (category && category !== "all") query.category = category;

  /* 4. Price range */
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  /* 5. Full-text search */
  if (search?.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  /* 6. Pagination */
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(parseInt(limit, 10), 100));
  const skip = (pageNum - 1) * limitNum;

  const [plants, totalCount] = await Promise.all([
    plantsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray(),
    plantsCollection.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
    data: plants,
  });
});

/* ─────────────────────────────────────────────
   GET PLANT STATS  ← new dedicated endpoint
   Returns: totalCount, uniqueSellers, totalStock
   Used by PulseStats component on the homepage
───────────────────────────────────────────── */
const getPlantStats = asyncHandler(async (req, res, plantsCollection) => {
  // Only count active/non-flagged plants for public stats
  const baseFilter = { status: { $ne: "flagged" } };

  const [statsResult, totalCount] = await Promise.all([
    plantsCollection
      .aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$quantity" },
            uniqueSellers: { $addToSet: "$seller.email" },
          },
        },
        {
          $project: {
            _id: 0,
            totalStock: 1,
            uniqueSellers: { $size: "$uniqueSellers" },
          },
        },
      ])
      .toArray(),
    plantsCollection.countDocuments(baseFilter),
  ]);

  const stats = statsResult[0] || { totalStock: 0, uniqueSellers: 0 };

  res.status(200).json({
    success: true,
    totalCount,
    uniqueSellers: stats.uniqueSellers,
    totalStock: stats.totalStock,
  });
});

/* ─────────────────────────────────────────────
   GET SINGLE PLANT
───────────────────────────────────────────── */
const getSinglePlant = asyncHandler(async (req, res, plantsCollection) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Specimen ID" });
  }

  const plant = await plantsCollection.findOne({ _id: new ObjectId(id) });
  if (!plant) {
    return res
      .status(404)
      .json({ success: false, message: "Specimen not found" });
  }

  res.status(200).json({ success: true, data: plant });
});

/* ─────────────────────────────────────────────
   UPDATE PLANT
───────────────────────────────────────────── */
const updatePlant = asyncHandler(async (req, res, plantsCollection) => {
  const { id } = req.params;
  const { _id, ...dataToUpdate } = req.body;

  if (!ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Specimen ID" });
  }

  const result = await plantsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...dataToUpdate, updatedAt: new Date() } },
  );

  if (result.matchedCount === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Specimen not found" });
  }

  res.status(200).json({
    success: true,
    message: "Inventory Synced",
    modifiedCount: result.modifiedCount,
  });
});

/* ─────────────────────────────────────────────
   UPDATE PLANT STATUS
───────────────────────────────────────────── */
const updatePlantStatus = asyncHandler(async (req, res, plantsCollection) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Specimen ID" });
  }

  const result = await plantsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status,
        updatedAt: new Date(),
        ...(status === "flagged" && {
          flaggedBy: req.user.email,
          flaggedAt: new Date(),
        }),
      },
    },
  );

  res.status(200).json({ success: true, modifiedCount: result.modifiedCount });
});

/* ─────────────────────────────────────────────
   DELETE PLANT
───────────────────────────────────────────── */
const deletePlant = asyncHandler(async (req, res, plantsCollection) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Specimen ID" });
  }

  const query = { _id: new ObjectId(id) };
  if (req.userRole !== "admin") query["seller.email"] = req.user.email;

  const result = await plantsCollection.deleteOne(query);

  if (result.deletedCount === 1) {
    return res
      .status(200)
      .json({ success: true, message: "Specimen erased from vault" });
  }

  res.status(404).json({
    success: false,
    message: "Purge failed: not found or unauthorized",
  });
});

module.exports = {
  addPlant,
  getPlants,
  getPlantStats,
  getSinglePlant,
  updatePlantStatus,
  updatePlant,
  deletePlant,
};
