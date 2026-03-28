const jwt = require("jsonwebtoken");

/* ══════════════════════════════════════════════════════
   verifyToken
   Reads JWT from httpOnly cookie.
   Attaches decoded payload to req.user on success.
══════════════════════════════════════════════════════ */
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token",
      });
    }
    req.user = decoded;
    next();
  });
};

/* ══════════════════════════════════════════════════════
   authenticateOptional
   Same as verifyToken but never blocks the request.
   req.user = null if no token or invalid token.
   Used on public routes that have auth-aware behavior.
══════════════════════════════════════════════════════ */
const authenticateOptional = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    req.user = err ? null : decoded;
    next();
  });
};

/* ══════════════════════════════════════════════════════
   verifyRole
   Must run AFTER verifyToken (req.user must exist).

   Looks up the user in DB by email to get their live role.
   This is intentional — it means a role change takes effect
   on next request without needing a new token.

   IMPORTANT: "user" is NOT a valid role in your system.
   Valid roles: "customer" | "seller" | "admin"
   Any route passing "user" in allowedRoles will always 403.
   This is intentional — it forces you to be explicit.
══════════════════════════════════════════════════════ */
const verifyRole = (usersCollection, allowedRoles) => {
  // Validate at startup — catch typos like "user" immediately
  const SYSTEM_ROLES = ["customer", "seller", "admin"];
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  const invalidRoles = roles.filter((r) => !SYSTEM_ROLES.includes(r));
  if (invalidRoles.length) {
    // This fires when the server starts, not per-request — catches bugs early
    console.warn(
      `⚠️  verifyRole: Unknown roles [${invalidRoles.join(", ")}]. ` +
        `Valid roles are: ${SYSTEM_ROLES.join(", ")}`,
    );
  }

  return async (req, res, next) => {
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user context",
      });
    }

    try {
      const user = await usersCollection.findOne(
        { email },
        { projection: { role: 1, status: 1 } }, // only fetch what we need
      );

      if (!user) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: User not found",
        });
      }

      // Block restricted/suspended accounts regardless of role
      if (user.status && user.status !== "active") {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Your account is ${user.status}`,
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Requires [${roles.join(", ")}] role`,
        });
      }

      // Attach live role to request — controllers can use req.userRole
      req.userRole = user.role;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { verifyToken, verifyRole, authenticateOptional };
