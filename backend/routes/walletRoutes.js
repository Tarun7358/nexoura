const express = require("express");
const { db, admin } = require("../services/firebaseService");

const router = express.Router();

router.get("/balance", async (req, res) => {
  try {
    const userId = req.userId;
    const walletDoc = await db.collection("wallets").doc(userId).get();

    if (!walletDoc.exists) {
      return res.json({
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
      });
    }

    return res.json(walletDoc.data());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/deposit", async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const walletRef = db.collection("wallets").doc(userId);
    const transactionRef = db.collection("transactions").doc();

    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      const existing = walletDoc.exists ? walletDoc.data() : {};
      const balance = Number(existing.balance || 0) + numericAmount;
      const totalDeposited = Number(existing.totalDeposited || 0) + numericAmount;

      transaction.set(
        walletRef,
        {
          userId,
          balance,
          totalDeposited,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      transaction.set(transactionRef, {
        userId,
        type: "deposit",
        amount: numericAmount,
        status: "success",
        createdAt: new Date(),
      });
    });

    return res.json({ message: "Deposit successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/withdraw", async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const walletRef = db.collection("wallets").doc(userId);
    const transactionRef = db.collection("transactions").doc();

    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error("Wallet not found");
      }

      const wallet = walletDoc.data();
      const currentBalance = Number(wallet.balance || 0);

      if (currentBalance < numericAmount) {
        throw new Error("Insufficient balance");
      }

      const totalWithdrawn = Number(wallet.totalWithdrawn || 0) + numericAmount;

      transaction.update(walletRef, {
        balance: currentBalance - numericAmount,
        totalWithdrawn,
        updatedAt: new Date(),
      });

      transaction.set(transactionRef, {
        userId,
        type: "withdraw",
        amount: numericAmount,
        status: "pending",
        createdAt: new Date(),
      });
    });

    return res.json({ message: "Withdraw successful" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const userId = req.userId;
    const limit = Number(req.query.limit || 50);

    const snapshot = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/join-tournament", async (req, res) => {
  try {
    const { tournamentId } = req.body;
    const userId = req.userId;

    if (!tournamentId) {
      return res.status(400).json({ message: "Tournament ID is required" });
    }

    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    const walletRef = db.collection("wallets").doc(userId);
    const transactionRef = db.collection("transactions").doc();

    await db.runTransaction(async (transaction) => {
      const tournamentDoc = await transaction.get(tournamentRef);
      const walletDoc = await transaction.get(walletRef);

      if (!tournamentDoc.exists) {
        throw new Error("Tournament not found");
      }

      if (!walletDoc.exists) {
        throw new Error("Wallet not found");
      }

      const entryFee = Number(tournamentDoc.data().entryFee || 0);
      const wallet = walletDoc.data();
      const balance = Number(wallet.balance || 0);

      if (balance < entryFee) {
        throw new Error("Insufficient balance");
      }

      transaction.update(walletRef, {
        balance: balance - entryFee,
        updatedAt: new Date(),
      });

      transaction.update(tournamentRef, {
        participants: admin.firestore.FieldValue.arrayUnion(userId),
        currentParticipants: admin.firestore.FieldValue.increment(1),
        updatedAt: new Date(),
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

    return res.json({ message: "Joined tournament successfully" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.get("/check-activity", async (req, res) => {
  try {
    const userId = req.userId;
    const snapshot = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .where("createdAt", ">", new Date(Date.now() - 60 * 60 * 1000))
      .get();

    if (snapshot.size > 20) {
      return res.json({
        suspicious: true,
        message: "Too many transactions detected",
      });
    }

    return res.json({ suspicious: false });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
