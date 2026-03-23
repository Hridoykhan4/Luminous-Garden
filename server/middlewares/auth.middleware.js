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

const verifyRole = (usersCollection, allowedRoles) => {
  return async (req, res, next) => {
    const email = req.user?.email;
    const user = await usersCollection.findOne({ email });

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!user || !roles.includes(user.role)) {
      return res.status(403).send({
        success: false,
        message: `Security Alert: Access restricted to [${roles.join(", ")}]`,
      });
    }

    req.userRole = user.role;
    next();
  };
};
module.exports = { verifyToken, verifyRole };
