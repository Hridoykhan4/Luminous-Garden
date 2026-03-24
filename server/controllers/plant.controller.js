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
    role 
  } = req.query;

  let query = {};

  // 1. SaaS Status Logic
  if (role !== "admin") {
    query.status = { $ne: "flagged" };
  }

  // 2. Advanced Filters
  if (email) query["seller.email"] = email;
  if (category) query.category = category;
  
  // 3. Range Filtering (SaaS Standard)
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // 4. Case-Insensitive Fuzzy Search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  // 5. Pagination Logic
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const lim = parseInt(limit);

  const plants = await plantsCollection
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(lim)
    .toArray();

  const totalCount = await plantsCollection.countDocuments(query);

  res.status(200).json({
    success: true,
    totalCount,
    totalPages: Math.ceil(totalCount / lim),
    currentPage: parseInt(page),
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
