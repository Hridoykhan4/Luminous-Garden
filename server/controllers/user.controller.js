const syncUser = async (req, res, usersCollection) => {
  try {
    if (!usersCollection) {
      return res
        .status(500)
        .json({ message: "Database collection not initialized" });
    }

    const { email, name, photo } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const isExist = await usersCollection.findOne({ email });

    if (isExist) {
      await usersCollection.updateOne(
        { email },
        { $set: { lastLoggedIn: new Date().toISOString() } },
      );
      return res.status(200).json({ message: "Welcome back!", exists: true });
    }

    const newUser = {
      name,
      email,
      photo,
      role: "customer",
      createdAt: new Date().toISOString(),
      lastLoggedIn: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser);
    res.status(201).json(result);
  } catch (error) {
    console.error("DETAILED SERVER ERROR:", error); 
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getUsers = async(req, res, usersCollection) => {
  res.send(await usersCollection.find().toArray())
}

module.exports = { syncUser , getUsers};
