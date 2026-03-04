const jwt = require("jsonwebtoken");
const { db } = require("../services/firebaseService");

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userDoc.data();

    if (user.role !== "admin" && user.role !== "moderator") {
      return res.status(403).json({ message: "Access denied. Admin only" });
    }

    req.userId = userId;
    req.user = {
      id: userId,
      email: user.email,
      role: user.role,
      gamerTag: user.gamerTag,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = adminMiddleware;
