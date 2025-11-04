import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "this_secret_should_be_longer_and_kept_safe";

/**
 * Middleware to authenticate JWT tokens
 * Verifies the token from the Authorization header and attaches user info to req.user
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract Bearer token

  if (!token) {
    return res.status(401).json({ message: "Access token required." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user; // Attach decoded user info to request
    next();
  });
};

/**
 * Optional: Middleware to verify user owns the resource
 * Use this when you want to ensure a user can only access their own data
 */
export const verifyOwnership = (req, res, next) => {
  const userId = req.params.userId || req.body.userId;
  
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  if (req.user.sub !== userId) {
    return res.status(403).json({ message: "Access denied. You can only access your own resources." });
  }

  next();
};

/**
 * Optional: Middleware to check for specific roles (if you implement role-based access)
 * Example usage: app.get("/admin", authenticateToken, requireRole("admin"), ...)
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied. No role assigned." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  };
};