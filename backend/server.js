/**
 * Nexoura Backend - Firebase Only (No MongoDB)
 * Express server with Firestore database
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

// Initialize Firebase Admin SDK
require("./services/firebaseService");

// Middleware
const authMiddleware = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorHandler");

// Routes
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const scrimRoutes = require("./routes/scrimRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const teamRoutes = require("./routes/teamRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

if (!process.env.JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

// ==================== SECURITY ====================

// HTTP security headers
app.use(helmet());

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", limiter);

// ==================== PERFORMANCE ====================

// Response compression
app.use(compression());

// ==================== CORS ====================

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost,capacitor://localhost,ionic://localhost")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ==================== BODY PARSER ====================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==================== REQUEST LOGGER ====================

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ==================== HEALTH CHECK ====================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Backend is running",
    database: "Firebase Firestore",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ==================== API INFO ====================

app.get("/api", (req, res) => {
  res.json({
    message: "🎮 Nexoura API is running!",
    database: "Firebase Firestore",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      wallet: "/api/wallet",
      scrims: "/api/scrims",
      tournaments: "/api/tournaments",
      teams: "/api/teams",
      admin: "/api/admin",
    },
  });
});

// ==================== PUBLIC ROUTES ====================

app.use("/api/users", userRoutes);
app.use("/api/scrims", scrimRoutes);
app.use("/api/tournaments", tournamentRoutes);

// ==================== PROTECTED ROUTES ====================

app.use("/api/wallet", authMiddleware, walletRoutes);
app.use("/api/teams", authMiddleware, teamRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);

// ==================== 404 HANDLER ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ==================== ERROR HANDLER ====================

app.use(errorHandler);

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║         🎮 Nexoura Backend           ║
║                                      ║
║  Server : http://localhost:${PORT}    ║
║  DB     : Firebase Firestore         ║
║  Env    : ${process.env.NODE_ENV || "development"}
║                                      ║
╚══════════════════════════════════════╝
`);
});

// ==================== GRACEFUL SHUTDOWN ====================

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    process.exit(0);
  });
});

// ==================== GLOBAL ERROR HANDLING ====================

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

// Uncaught Exception
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

module.exports = app;
