const asyncHandler = require("express-async-handler");

const addPlant = asyncHandler(async (req, res, plantsCollection) => {
  const plantData = req.body;

  // Verify identity
  if (plantData.seller?.email !== req.user?.email) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Identity mismatch",
    });
  }

  const result = await plantsCollection.insertOne({
    ...plantData,
    createdAt: new Date(),
  });

  res.status(201).json({
    success: true,
    message: "Plant added to the Luminous Garden",
    insertedId: result.insertedId,
  });
});

const getPlants = asyncHandler(async (req, res, plantsCollection) => {
  const { category } = req.query;
  const query = category ? { category } : {};

  const plants = await plantsCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  res.status(200).json(plants);
});

module.exports = { addPlant, getPlants };
