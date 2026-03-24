const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");

const addPlant = asyncHandler(async (req, res, plantsCollection) => {
  const plantData = req.body;

  if (!plantData.seller?.email) {
    return res.status(400).json({
      success: false,
      message: "Seller identity is required in the request body",
    });
  }

  if (plantData.seller.email !== req.user.email) {
    return res.status(403).json({
      success: false,
      message: "Security Alert: Identity Mismatch detected",
    });
  }

  const { _id, ...cleanData } = plantData;

  // 4. Database Operation
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

// plant.controller.js updates
const getPlants = asyncHandler(async (req, res, plantsCollection) => {
  const {
    category,
    email,
    search,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    role,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // 1. Build Dynamic Filter Pipeline
  let query = {};
  if (role !== "admin") query.status = { $ne: "flagged" };
  if (email) query["seller.email"] = email;
  if (category) query.category = category;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  // 2. SaaS Optimization: Execute Data and Stats in Parallel
  const [plants, totalCount, stats] = await Promise.all([
    plantsCollection
      .find(query)
      .project({ description: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray(),

    plantsCollection.countDocuments(query),

    plantsCollection
      .aggregate([
        { $match: { status: { $ne: "flagged" } } },
        {
          $group: {
            _id: null,
            totalSellers: { $addToSet: "$seller.email" },
            avgPrice: { $avg: "$price" },
            totalStock: { $sum: "$quantity" },
          },
        },
        {
          $project: {
            uniqueSellers: { $size: "$totalSellers" },
            avgPrice: { $round: ["$avgPrice", 2] },
            totalStock: 1,
          },
        },
      ])
      .toArray(),
  ]);

  res.status(200).json({
    success: true,
    meta: {
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      pageSize: limitNum,
    },
    stats: stats[0] || { uniqueSellers: 0, avgPrice: 0, totalStock: 0 },
    data: plants,
  });
});

const getSinglePlant = asyncHandler(async (req, res, plantsCollection) => {
  const id = req.params.id;
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

  res.status(200).json({
    success: true,
    data: plant,
  });
});

const updatePlant = asyncHandler(async (req, res, plantsCollection) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Specimen ID" });
  }

  const { _id, ...dataToUpdate } = updateData;

  const result = await plantsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...dataToUpdate,
        updatedAt: new Date(),
      },
    },
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

const updatePlantStatus = asyncHandler(async (req, res, plantsCollection) => {
  const id = req.params.id;
  const { status } = req.body;

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

// Add plantsCollection as the 3rd parameter to match your route call
const deletePlant = asyncHandler(async (req, res, plantsCollection) => {
  const { id } = req.params;

  // 1. Validate ID Format
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Specimen ID",
    });
  }

  // 2. Build Query
  const query = { _id: new ObjectId(id) };

  // 3. Apply Security Logic using req.userRole from verifyRole middleware
  if (req.userRole !== "admin") {
    query["seller.email"] = req.user.email;
  }

  // 4. Execute (This was crashing because plantsCollection was undefined)
  const result = await plantsCollection.deleteOne(query);

  if (result.deletedCount === 1) {
    return res.status(200).json({
      success: true,
      message: "Specimen successfully erased from vault",
    });
  } else {
    return res.status(404).json({
      success: false,
      message: "Purge failed: Specimen not found or unauthorized",
    });
  }
});

module.exports = {
  addPlant,
  getPlants,
  getSinglePlant,
  updatePlantStatus,
  updatePlant,
  deletePlant,
};
