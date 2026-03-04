const express = require("express");
const { db, admin } = require("../services/firebaseService");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ================= GET ALL TOURNAMENTS =================

router.get("/", async (req, res) => {
  try {

    const snapshot = await db
      .collection("tournaments")
      .orderBy("startDate", "desc")
      .get();

    const tournaments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(tournaments);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= GET SINGLE TOURNAMENT =================

router.get("/:id", async (req, res) => {
  try {

    const doc = await db.collection("tournaments").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data()
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= CREATE TOURNAMENT =================

router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const {
      name,
      mode,
      entryFee,
      prizePool,
      maxParticipants,
      startDate
    } = req.body;

    const tournamentRef = db.collection("tournaments").doc();

    const tournamentData = {
      name,
      mode,
      entryFee,
      prizePool,
      maxParticipants,
      currentParticipants: 0,
      participants: [],
      createdBy: req.userId,
      startDate,
      createdAt: new Date()
    };

    await tournamentRef.set(tournamentData);

    res.status(201).json({
      id: tournamentRef.id,
      ...tournamentData
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= JOIN TOURNAMENT =================

router.post("/:id/join", authMiddleware, async (req, res) => {
  try {

    const userId = req.userId;
    const tournamentId = req.params.id;

    const tournamentRef = db.collection("tournaments").doc(tournamentId);

    await db.runTransaction(async (transaction) => {

      const tournamentDoc = await transaction.get(tournamentRef);

      if (!tournamentDoc.exists) {
        throw new Error("Tournament not found");
      }

      const tournament = tournamentDoc.data();

      if (tournament.currentParticipants >= tournament.maxParticipants) {
        throw new Error("Tournament is full");
      }

      if (tournament.participants.includes(userId)) {
        throw new Error("User already joined");
      }

      transaction.update(tournamentRef, {
        participants: admin.firestore.FieldValue.arrayUnion(userId),
        currentParticipants: tournament.currentParticipants + 1
      });

    });

    res.json({ message: "Joined tournament successfully" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// ================= UPDATE TOURNAMENT =================

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const tournamentRef = db.collection("tournaments").doc(req.params.id);

    await tournamentRef.update({
      ...req.body,
      updatedAt: new Date()
    });

    const updatedDoc = await tournamentRef.get();

    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= DELETE TOURNAMENT =================

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    await db.collection("tournaments").doc(req.params.id).delete();

    res.json({ message: "Tournament deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
