const express = require("express");
const { db, admin } = require("../services/firebaseService");

const router = express.Router();


// ================= GET USER TEAMS =================

router.get("/user/:userId", async (req, res) => {
  try {

    const userId = req.params.userId;

    const snapshot = await db
      .collection("teams")
      .where("members", "array-contains", userId)
      .get();

    const teams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(teams);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= GET SINGLE TEAM =================

router.get("/:id", async (req, res) => {
  try {

    const doc = await db.collection("teams").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data()
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= CREATE TEAM =================

router.post("/", async (req, res) => {
  try {

    const { name, maxMembers } = req.body;
    const owner = req.userId;

    // Check if team name already exists
    const existing = await db
      .collection("teams")
      .where("name", "==", name)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: "Team name already exists" });
    }

    const teamRef = db.collection("teams").doc();

    const teamData = {
      name,
      owner,
      members: [owner],
      maxMembers: maxMembers || 10,
      createdAt: new Date()
    };

    await teamRef.set(teamData);

    res.status(201).json({
      id: teamRef.id,
      ...teamData
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= ADD MEMBER =================

router.post("/:id/members", async (req, res) => {
  try {

    const { userId } = req.body;
    const teamRef = db.collection("teams").doc(req.params.id);

    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      return res.status(404).json({ message: "Team not found" });
    }

    const team = teamDoc.data();
    const isAdmin = req.user?.role === "admin";

    if (team.owner !== req.userId && !isAdmin) {
      return res.status(403).json({ message: "Only owner or admin can add members" });
    }

    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: "Team is full" });
    }

    if (team.members.includes(userId)) {
      return res.status(400).json({ message: "User already in team" });
    }

    await teamRef.update({
      members: admin.firestore.FieldValue.arrayUnion(userId)
    });

    const updatedTeam = await teamRef.get();

    res.json({
      id: updatedTeam.id,
      ...updatedTeam.data()
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= REMOVE MEMBER =================

router.delete("/:id/members/:userId", async (req, res) => {
  try {

    const teamRef = db.collection("teams").doc(req.params.id);
    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      return res.status(404).json({ message: "Team not found" });
    }

    const team = teamDoc.data();
    const isAdmin = req.user?.role === "admin";

    if (team.owner !== req.userId && !isAdmin) {
      return res.status(403).json({ message: "Only owner or admin can remove members" });
    }

    await teamRef.update({
      members: admin.firestore.FieldValue.arrayRemove(req.params.userId)
    });

    const updatedTeam = await teamRef.get();

    res.json({
      id: updatedTeam.id,
      ...updatedTeam.data()
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= UPDATE TEAM =================

router.put("/:id", async (req, res) => {
  try {

    const teamRef = db.collection("teams").doc(req.params.id);
    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      return res.status(404).json({ message: "Team not found" });
    }

    const team = teamDoc.data();
    const isAdmin = req.user?.role === "admin";

    if (team.owner !== req.userId && !isAdmin) {
      return res.status(403).json({ message: "Only owner or admin can update team" });
    }

    await teamRef.update({
      ...req.body,
      updatedAt: new Date()
    });

    const updatedTeam = await teamRef.get();

    res.json({
      id: updatedTeam.id,
      ...updatedTeam.data()
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= DELETE TEAM =================

router.delete("/:id", async (req, res) => {
  try {
    const teamRef = db.collection("teams").doc(req.params.id);
    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      return res.status(404).json({ message: "Team not found" });
    }

    const team = teamDoc.data();
    const isAdmin = req.user?.role === "admin";

    if (team.owner !== req.userId && !isAdmin) {
      return res.status(403).json({ message: "Only owner or admin can delete team" });
    }

    await teamRef.delete();

    res.json({ message: "Team deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
