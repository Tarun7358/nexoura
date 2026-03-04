const express = require("express");
const { db } = require("../services/firebaseService");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create match room - admin only
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { tournamentId, roomCode, password, startTime, players = [], status = "upcoming" } = req.body;

    if (!tournamentId || !roomCode || !password) {
      return res.status(400).json({ message: "tournamentId, roomCode and password are required" });
    }

    const roomRef = db.collection("matchRooms").doc();

    const roomData = {
      roomId: roomRef.id,
      tournamentId,
      roomCode,
      password,
      startTime: startTime || null,
      players,
      status,
      createdBy: req.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await roomRef.set(roomData);

    return res.status(201).json(roomData);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get rooms for tournament (admin + players)
router.get("/tournament/:tournamentId", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db
      .collection("matchRooms")
      .where("tournamentId", "==", req.params.tournamentId)
      .orderBy("createdAt", "desc")
      .get();

    const rooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(rooms);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get rooms assigned to current user
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db
      .collection("matchRooms")
      .where("players", "array-contains", req.userId)
      .orderBy("createdAt", "desc")
      .get();

    const rooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(rooms);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Update room status/details - admin only
router.put("/:roomId", authMiddleware, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const roomRef = db.collection("matchRooms").doc(req.params.roomId);
    await roomRef.update({ ...req.body, updatedAt: new Date() });
    const updated = await roomRef.get();

    return res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;