const { ObjectId } = require("mongodb");

/* ══════════════════════════════════════════════════════
   syncUser
   Called on every login. Upserts name/photo/lastLoggedIn.
   Sets role:"customer", status:"active" only on first insert.
══════════════════════════════════════════════════════ */
const syncUser = async (req, res, usersCollection) => {
  const { email, name, photo } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const result = await usersCollection.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        photo,
        lastLoggedIn: new Date().toISOString(),
      },
      $setOnInsert: {
        role: "customer",
        status: "active",
        createdAt: new Date().toISOString(),
      },
    },
    {
      upsert: true,
      returnDocument: "after", 
    },
  );

  // MongoDB Node driver v4+ returns the document directly (not result.value)
  // Handle both old and new driver shapes safely
  const userData = result?.value ?? result;

  return res.status(200).json({
    success: true,
    role: userData?.role || "customer",
  });
};

/* ══════════════════════════════════════════════════════
   getUsers  (admin only)
   GET /users?role=seller&search=john
══════════════════════════════════════════════════════ */
const getUsers = async (req, res, usersCollection) => {
  const { role, search } = req.query;

  const filter = {};

  if (role && ["customer", "seller", "admin"].includes(role)) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await usersCollection
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return res.status(200).json({
    success: true,
    total: users.length,
    data: users,
  });
};

/* ══════════════════════════════════════════════════════
   getUserRole  (public — used by useUserRole hook)
   GET /users/role/:email
══════════════════════════════════════════════════════ */
const getUserRole = async (req, res, usersCollection) => {
  const { email } = req.params;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const user = await usersCollection.findOne(
    { email },
    { projection: { role: 1, status: 1 } },
  );

  if (!user) return res.status(200).json({ success: true, role: "customer" });

  // If account is restricted/suspended, surface that
  return res.status(200).json({
    success: true,
    role: user.role || "customer",
    status: user.status || "active",
  });
};

/* ══════════════════════════════════════════════════════
   updateUserRole  (admin only)
   PATCH /users/:id/role   body: { role }
══════════════════════════════════════════════════════ */
const updateUserRole = async (req, res, usersCollection) => {
  const { id } = req.params;
  const { role } = req.body;

  const VALID_ROLES = ["customer", "seller", "admin"];
  if (!role || !VALID_ROLES.includes(role))
    return res.status(400).json({ success: false, message: "Invalid role" });

  if (!ObjectId.isValid(id))
    return res.status(400).json({ success: false, message: "Invalid user ID" });

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { role, updatedAt: new Date().toISOString() } },
  );

  if (result.matchedCount === 0)
    return res.status(404).json({ success: false, message: "User not found" });

  return res
    .status(200)
    .json({ success: true, message: `Role updated to ${role}` });
};

/* ══════════════════════════════════════════════════════
   updateUserStatus  (admin only)
   PATCH /users/:id/status   body: { status }
══════════════════════════════════════════════════════ */
const updateUserStatus = async (req, res, usersCollection) => {
  const { id } = req.params;
  const { status } = req.body;

  const VALID_STATUSES = ["active", "restricted", "suspended"];
  if (!status || !VALID_STATUSES.includes(status))
    return res.status(400).json({ success: false, message: "Invalid status" });

  if (!ObjectId.isValid(id))
    return res.status(400).json({ success: false, message: "Invalid user ID" });

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date().toISOString() } },
  );

  if (result.matchedCount === 0)
    return res.status(404).json({ success: false, message: "User not found" });

  return res
    .status(200)
    .json({ success: true, message: `Status updated to ${status}` });
};

/* ══════════════════════════════════════════════════════
   updateMyProfile  (authenticated user — own profile)
   PATCH /users/me   body: { name, photo }
   Cannot change email or role — ever.
══════════════════════════════════════════════════════ */
const updateMyProfile = async (req, res, usersCollection) => {
  // verifyToken middleware attaches decoded token to req.user
  const email = req.user?.email;
  if (!email)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const { name, photo } = req.body;

  // Strict whitelist — only these two fields can change
  const $set = { updatedAt: new Date().toISOString() };
  if (name && typeof name === "string") $set.name = name.trim();
  if (photo && typeof photo === "string") $set.photo = photo;

  if (Object.keys($set).length === 1)
    // only updatedAt — nothing useful sent
    return res
      .status(400)
      .json({ success: false, message: "No valid fields to update" });

  const result = await usersCollection.updateOne({ email }, { $set });

  if (result.matchedCount === 0)
    return res.status(404).json({ success: false, message: "User not found" });

  return res.status(200).json({ success: true, message: "Profile updated" });
};

module.exports = {
  syncUser,
  getUsers,
  getUserRole,
  updateUserRole,
  updateUserStatus,
  updateMyProfile,
};
