const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).send({ message: "Unauthorized Access" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Unauthorized Access" });
    req.user = decoded;
    next();
  });
};

const verifyRole = (usersCollection, allowedRole) => {
  return async (req, res, next) => {
    const email = req.user?.email;
    const user = await usersCollection.findOne({ email });
    console.log(user);
    if (!user || user.role !== allowedRole) {
      return res.status(403).send({
        message: `Forbidden: Restricted to ${allowedRole}s only.`,
      });
    }
    next();
  };
};

module.exports = { verifyToken, verifyRole };
