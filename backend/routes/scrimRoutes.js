const express = require("express");
const { db, admin } = require("../services/firebaseService");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Generate unique Scrim ID
const generateScrimId = () => {
  return `SCRIM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};


// ================= GET ALL SCRIMS =================

router.get("/", async (req, res) => {
  try {

    const { game, mode, limit = 50 } = req.query;
    const parsedLimit = parseInt(limit, 10);

    let scrims = [];
    try {
      const indexedSnapshot = await db
        .collection("scrims")
        .where("status", "==", "upcoming")
        .orderBy("date")
        .limit(parsedLimit)
        .get();

      scrims = indexedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (queryError) {
      // Fallback when Firestore composite index is not created yet.
      const fallbackSnapshot = await db
        .collection("scrims")
        .orderBy("date")
        .limit(parsedLimit)
        .get();

      scrims = fallbackSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(s => s.status === "upcoming");
    }

    // Apply filters
    if (game) scrims = scrims.filter(s => s.game === game);
    if (mode) scrims = scrims.filter(s => s.mode === mode);

    res.json({ scrims });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching scrims",
      error: error.message
    });
  }
});


// ================= GET SINGLE SCRIM =================

router.get("/:id", async (req, res) => {
  try {

    const doc = await db.collection("scrims").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Scrim not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data()
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching scrim",
      error: error.message
    });
  }
});


// ================= JOIN SCRIM =================

router.post("/:id/join", authMiddleware, async (req, res) => {
  try {

    const scrimId = req.params.id;
    const userId = req.userId;
    const gamerTag = req.body.gamerTag || "Player";

    const scrimRef = db.collection("scrims").doc(scrimId);

    await db.runTransaction(async (transaction) => {

      const scrimDoc = await transaction.get(scrimRef);

      if (!scrimDoc.exists) {
        throw new Error("Scrim not found");
      }

      const scrim = scrimDoc.data();

      if (scrim.status !== "upcoming") {
        throw new Error("Scrim is not accepting entries");
      }

      if (scrim.joinedPlayers.length >= scrim.slots) {
        throw new Error("Scrim is full");
      }

      const alreadyJoined = scrim.joinedPlayers.some(
        p => p.userId === userId
      );

      if (alreadyJoined) {
        throw new Error("You already joined this scrim");
      }

      const newPlayer = {
        userId,
        gamerTag,
        joinedAt: new Date()
      };

      transaction.update(scrimRef, {
        joinedPlayers: admin.firestore.FieldValue.arrayUnion(newPlayer)
      });

    });

    const updatedScrim = await scrimRef.get();

    res.json({
      message: "Joined scrim successfully",
      scrim: { id: updatedScrim.id, ...updatedScrim.data() }
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});


// ================= LEAVE SCRIM =================

router.post("/:id/leave", authMiddleware, async (req, res) => {
  try {

    const scrimId = req.params.id;
    const userId = req.userId;

    const scrimRef = db.collection("scrims").doc(scrimId);
    const scrimDoc = await scrimRef.get();

    if (!scrimDoc.exists) {
      return res.status(404).json({ message: "Scrim not found" });
    }

    const scrim = scrimDoc.data();

    const updatedPlayers = scrim.joinedPlayers.filter(
      p => p.userId !== userId
    );

    await scrimRef.update({
      joinedPlayers: updatedPlayers
    });

    const updatedScrim = await scrimRef.get();

    res.json({
      message: "Left scrim successfully",
      scrim: { id: updatedScrim.id, ...updatedScrim.data() }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error leaving scrim",
      error: error.message
    });
  }
});

module.exports = router;
