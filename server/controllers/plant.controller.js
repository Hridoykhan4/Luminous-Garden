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
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.status(201).json({
    success: true,
    message: "Specimen successfully added to the garden",
    insertedId: result.insertedId,
  });
});

const getPlants = asyncHandler(async (req, res, plantsCollection) => {
  const { category, email, search, limit } = req.query;

  let query = {};
  if (email) query["seller.email"] = email;
  if (category) query.category = category;
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  const lim = parseInt(limit) || 0;

  const plants = await plantsCollection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(lim)
    .toArray();

  const totalCount = await plantsCollection.countDocuments(query);

  res.status(200).json({
    success: true,
    count: totalCount,
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

module.exports = { addPlant, getPlants, getSinglePlant };
