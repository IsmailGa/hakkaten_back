const jwt = require("jsonwebtoken");
const pool = require("../model/db");
const SECRET_KEY = process.env.SECRET_KEY || "[]1;23mk";

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authentication token is missing" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const userResult = await pool.query("SELECT * FROM users WHERE uid = $1", [decoded.uid]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { uid: decoded.uid, is_admin: decoded.is_admin, user_id: decoded.uid };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user?.is_admin) {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
