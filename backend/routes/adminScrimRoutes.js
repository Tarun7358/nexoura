const express = require("express");
const { db } = require("../services/firebaseService");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// All routes require admin authentication
router.use(adminMiddleware);


// ================= CREATE SCRIM =================

router.post("/create-scrim", async (req, res) => {
  try {

    const {
      title,
      game,
      mode,
      entryFee,
      prizePool,
      slots,
      date,
      time,
      map,
      description,
      rules
    } = req.body;

    if (!title || !game || !mode || !entryFee || !prizePool || !slots || !date || !time) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const scrimId = `SCRIM-${Date.now()}-${Math.random().toString(36).substring(2,9)}`;

    const scrimRef = db.collection("scrims").doc();

    const scrimData = {
      scrimId,
      title,
      game,
      mode,
      entryFee,
      prizePool,
      slots,
      joinedPlayers: [],
      date: new Date(date),
      time,
      map: map || null,
      description: description || "",
      rules: rules || "",
      status: "upcoming",
      createdBy: req.userId,
      createdAt: new Date()
    };

    await scrimRef.set(scrimData);

    res.status(201).json({
      message: "Scrim created successfully",
      scrim: { id: scrimRef.id, ...scrimData }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating scrim",
      error: error.message
    });
  }
});


// ================= UPDATE SCRIM =================

router.put("/update-scrim/:id", async (req, res) => {
  try {

    const scrimRef = db.collection("scrims").doc(req.params.id);
    const scrimDoc = await scrimRef.get();

    if (!scrimDoc.exists) {
      return res.status(404).json({ message: "Scrim not found" });
    }

    const scrim = scrimDoc.data();

    if (scrim.createdBy !== req.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await scrimRef.update({
      ...req.body,
      updatedAt: new Date()
    });

    const updated = await scrimRef.get();

    res.json({
      message: "Scrim updated successfully",
      scrim: { id: updated.id, ...updated.data() }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating scrim",
      error: error.message
    });
  }
});


// ================= DELETE SCRIM =================

router.delete("/delete-scrim/:id", async (req, res) => {
  try {

    const scrimRef = db.collection("scrims").doc(req.params.id);
    const scrimDoc = await scrimRef.get();

    if (!scrimDoc.exists) {
      return res.status(404).json({ message: "Scrim not found" });
    }

    const scrim = scrimDoc.data();

    if (scrim.createdBy !== req.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await scrimRef.delete();

    res.json({ message: "Scrim deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting scrim",
      error: error.message
    });
  }
});


// ================= GET ALL SCRIMS =================

router.get("/scrims", async (req, res) => {
  try {

    const { game, mode, status, limit = 100 } = req.query;

    let query = db.collection("scrims").orderBy("date", "desc").limit(parseInt(limit));

    const snapshot = await query.get();

    let scrims = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply filters
    if (game) scrims = scrims.filter(s => s.game === game);
    if (mode) scrims = scrims.filter(s => s.mode === mode);
    if (status) scrims = scrims.filter(s => s.status === status);

    res.json({ scrims });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching scrims",
      error: error.message
    });
  }
});


// ================= START SCRIM =================

router.post("/start-scrim/:id", async (req, res) => {
  try {

    const scrimRef = db.collection("scrims").doc(req.params.id);

    await scrimRef.update({ status: "ongoing" });

    const updated = await scrimRef.get();

    res.json({
      message: "Scrim started",
      scrim: { id: updated.id, ...updated.data() }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error starting scrim",
      error: error.message
    });
  }
});


// ================= END SCRIM =================

router.post("/end-scrim/:id", async (req, res) => {
  try {

    const scrimRef = db.collection("scrims").doc(req.params.id);

    await scrimRef.update({ status: "completed" });

    const updated = await scrimRef.get();

    res.json({
      message: "Scrim ended",
      scrim: { id: updated.id, ...updated.data() }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error ending scrim",
      error: error.message
    });
  }
});


// ================= CANCEL SCRIM =================

router.post("/cancel-scrim/:id", async (req, res) => {
  try {

    const scrimRef = db.collection("scrims").doc(req.params.id);

    await scrimRef.update({ status: "cancelled" });

    const updated = await scrimRef.get();

    res.json({
      message: "Scrim cancelled",
      scrim: { id: updated.id, ...updated.data() }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error cancelling scrim",
      error: error.message
    });
  }
});

module.exports = router;