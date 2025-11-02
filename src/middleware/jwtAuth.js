import jwt from 'jsonwebtoken';

// 🔹 In-memory token blacklist
const tokenBlacklist = new Map();

// 🔹 Authenticate your own JWT (used for ALL protected routes)
export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: "Token is blacklisted. Please login again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, firebaseUid, role, etc. }
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// 🔹 Middleware to check blacklist separately (can be used in logout route)
export const checkBlacklist = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token && tokenBlacklist.has(token)) {
    return res.status(401).json({ error: "Token is blacklisted. Please login again." });
  }
  next();
};

// 🔹 Function to add token to blacklist with automatic cleanup
export const addToBlacklist = (token, expiresInSeconds) => {
  const expireTime = Date.now() + expiresInSeconds * 1000;
  tokenBlacklist.set(token, expireTime);

  // Automatically remove token after it expires
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, expiresInSeconds * 1000);
};
