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
      title,
      name,
      game,
      mode,
      entryFee,
      prizePool,
      maxPlayers,
      maxParticipants,
      startTime,
      startDate,
      registrationDeadline,
      bannerImage
    } = req.body;

    const tournamentRef = db.collection("tournaments").doc();
    const normalizedTitle = title || name;
    const normalizedMaxPlayers = Number(maxPlayers || maxParticipants || 0);
    const normalizedStart = startTime || startDate || null;

    const tournamentData = {
      // Keep both title/name and maxPlayers/maxParticipants for frontend compatibility
      title: normalizedTitle,
      name: normalizedTitle,
      game: game || "BGMI",
      mode: mode || "squad",
      entryFee: Number(entryFee || 0),
      prizePool: Number(prizePool || 0),
      maxPlayers: normalizedMaxPlayers,
      maxParticipants: normalizedMaxPlayers,
      registeredPlayers: 0,
      currentParticipants: 0,
      participants: [],
      status: "Upcoming",
      bannerImage: bannerImage || null,
      startTime: normalizedStart,
      createdBy: req.userId,
      startDate: normalizedStart,
      registrationDeadline: registrationDeadline || null,
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
    const { teamName } = req.body || {};

    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    const userRef = db.collection("users").doc(userId);
    const walletRef = db.collection("wallets").doc(userId);
    const registrationId = `${tournamentId}_${userId}`;
    const registrationRef = db.collection("registrations").doc(registrationId);
    const transactionRef = db.collection("transactions").doc();

    await db.runTransaction(async (transaction) => {

      const tournamentDoc = await transaction.get(tournamentRef);
      const userDoc = await transaction.get(userRef);
      const walletDoc = await transaction.get(walletRef);
      const registrationDoc = await transaction.get(registrationRef);

      if (!tournamentDoc.exists) {
        throw new Error("Tournament not found");
      }
      if (!userDoc.exists) {
        throw new Error("User not found");
      }
      if (!walletDoc.exists) {
        throw new Error("Wallet not found");
      }
      if (registrationDoc.exists) {
        throw new Error("User already registered");
      }

      const tournament = tournamentDoc.data();
      const user = userDoc.data();
      const maxAllowed = Number(tournament.maxPlayers || tournament.maxParticipants || 0);
      const current = Number(tournament.currentParticipants || tournament.registeredPlayers || 0);
      const entryFee = Number(tournament.entryFee || 0);
      const currentBalance = Number(walletDoc.data()?.balance || 0);

      if (maxAllowed > 0 && current >= maxAllowed) {
        throw new Error("Tournament is full");
      }

      if (tournament.participants.includes(userId)) {
        throw new Error("User already joined");
      }
      if (currentBalance < entryFee) {
        throw new Error("Insufficient wallet balance");
      }

      transaction.update(tournamentRef, {
        participants: admin.firestore.FieldValue.arrayUnion(userId),
        currentParticipants: current + 1,
        registeredPlayers: current + 1
      });

      transaction.set(
        walletRef,
        {
          userId,
          balance: currentBalance - entryFee,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      transaction.set(registrationRef, {
        registrationId,
        tournamentId,
        userId,
        username: user.gamerTag || user.username || user.email || "Player",
        gamingUID: user.gamingUID || "",
        teamName: teamName || "",
        paymentStatus: "success",
        registeredAt: new Date()
      });

      transaction.set(transactionRef, {
        userId,
        tournamentId,
        type: "entry_fee",
        amount: entryFee,
        status: "success",
        createdAt: new Date(),
      });

    });

    res.json({ message: "Joined tournament successfully" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ================= PAYOUT WINNER =================
router.post("/:id/payout", authMiddleware, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const tournamentId = req.params.id;
    const { userId, amount } = req.body;
    const payoutAmount = Number(amount);

    if (!userId || !payoutAmount || payoutAmount <= 0) {
      return res.status(400).json({ message: "userId and amount are required" });
    }

    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    const userRef = db.collection("users").doc(userId);
    const walletRef = db.collection("wallets").doc(userId);
    const transactionRef = db.collection("transactions").doc();

    await db.runTransaction(async (transaction) => {
      const tournamentDoc = await transaction.get(tournamentRef);
      const userDoc = await transaction.get(userRef);
      const walletDoc = await transaction.get(walletRef);

      if (!tournamentDoc.exists) throw new Error("Tournament not found");
      if (!userDoc.exists) throw new Error("User not found");

      const wallet = walletDoc.exists ? walletDoc.data() : { balance: 0 };
      const newBalance = Number(wallet.balance || 0) + payoutAmount;
      const user = userDoc.data();

      transaction.set(
        walletRef,
        {
          userId,
          balance: newBalance,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      transaction.update(userRef, {
        earnings: Number(user.earnings || 0) + payoutAmount,
        wins: Number(user.wins || 0) + 1,
        updatedAt: new Date(),
      });

      transaction.set(transactionRef, {
        userId,
        tournamentId,
        type: "reward",
        amount: payoutAmount,
        status: "success",
        awardedBy: req.userId,
        createdAt: new Date(),
      });
    });

    res.json({ message: "Payout added successfully" });
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
