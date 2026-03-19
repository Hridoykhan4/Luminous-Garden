const syncUser = async (req, res, usersCollection) => {
  const { email, name, photo } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const query = { email };
  const updateDoc = {
    $set: {
      name,
      photo,
      lastLoggedIn: new Date().toISOString(),
    },
    $setOnInsert: {
      role: "customer",
      createdAt: new Date().toISOString(),
      status: "active",
    },
  };

  const options = { upsert: true, returnDocument: "after" };
  const result = await usersCollection.findOneAndUpdate(
    query,
    updateDoc,
    options,
  );

  const status = result.lastErrorObject?.updatedExisting ? 200 : 201;

  res.status(status).json({
    success: true,
    message: "Identity Synced Successfully",
    data: result.value || result,
  });
};

const getUsers = async (req, res, usersCollection) => {
  const users = await usersCollection.find().toArray();
  res.status(200).json(users);
};

module.exports = { syncUser, getUsers };
