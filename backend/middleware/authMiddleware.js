const jwt = require("jsonwebtoken");
const { db } = require("../services/firebaseService");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userDoc.data();

    req.userId = userId;
    req.user = {
      id: userId,
      email: user.email,
      role: user.role || "user",
      gamerTag: user.gamerTag,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
