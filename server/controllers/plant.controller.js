const asyncHandler = require("express-async-handler");

const addPlant = asyncHandler(async (req, res, plantsCollection) => {
  const plantData = req.body;
  console.log(plantData);
  // LOG EVERYTHING - Look at your terminal after you click Publish
  console.log("--- DEBUG START ---");
  console.log("Full Body:", JSON.stringify(plantData, null, 2));
  console.log("Seller Email from Body:", plantData.seller?.email);
  console.log("User Email from JWT:", req.user?.email);
  console.log("--- DEBUG END ---");

  if (!plantData.seller?.email) {
    return res.status(400).json({ success: false, message: "Seller email is missing in request body" });
  }

  if (plantData.seller.email !== req.user.email) {
    return res.status(403).json({ success: false, message: "Forbidden: Identity Mismatch" });
  }

  const result = await plantsCollection.insertOne({
    ...plantData,
    createdAt: new Date(),
  });

  res.status(201).json({ success: true, insertedId: result.insertedId });
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
