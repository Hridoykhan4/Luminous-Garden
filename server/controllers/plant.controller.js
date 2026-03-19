const addPlant = async (req, res, plantsCollection) => {
  const plantData = req.body;

  if (!plantData.name || !plantData.price || !plantData.category) {
    return res.status(400).json({
      success: false,
      message: "Required plant fields are missing (name, price, or category).",
    });
  }

  const newPlant = {
    ...plantData,
    price: parseFloat(plantData.price),
    quantity: parseInt(plantData.quantity),
    createdAt: new Date().toISOString(),
    status: "available",
  };

  const result = await plantsCollection.insertOne(newPlant);

  res.status(201).json({
    success: true,
    message: "Plant added to the Luminous Garden",
    insertedId: result.insertedId,
  });
};

const getPlants = async (req, res, plantsCollection) => {
  const category = req.query.category;
  let query = {};

  if (category) {
    query = { category: category };
  }

  const plants = await plantsCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  res.status(200).json(plants);
};

module.exports = { addPlant, getPlants };
