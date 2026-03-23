const syncUser = async (req, res, usersCollection) => {
  const { email, name, photo } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const query = { email };
  const updateDoc = {
    $set: { name, photo, lastLoggedIn: new Date().toISOString() },
    $setOnInsert: {
      role: "customer",
      createdAt: new Date().toISOString(),
      status: "active",
    },
  };

  const result = await usersCollection.findOneAndUpdate(query, updateDoc, {
    upsert: true,
    returnDocument: "after",
  });

  const userData = result.value || result;
  res.status(200).json({ success: true, role: userData.role });
};

const getUsers = async (req, res, usersCollection) => {
  const users = await usersCollection.find().toArray();
  res.status(200).json(users);
};


const getUserRole = async (req, res, usersCollection) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  if (!user) return res.status(404).json({ role: "customer" }); 
  res.status(200).json({ role: user.role });
};

module.exports = { syncUser, getUsers, getUserRole };
