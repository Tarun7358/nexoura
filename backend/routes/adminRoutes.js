const express = require("express");
const { db } = require("../services/firebaseService");

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  return next();
};

router.use(requireAdmin);

router.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => {
      const user = doc.data();
      delete user.password;
      return { id: doc.id, ...user };
    });

    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/users/:userId", async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.userId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = doc.data();
    delete user.password;

    return res.json({
      id: doc.id,
      ...user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/users/:userId/role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const userRef = db.collection("users").doc(req.params.userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRef.update({
      role,
      updatedAt: new Date(),
    });

    return res.json({ message: "User role updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const snapshot = await db
      .collection("transactions")
      .orderBy("createdAt", "desc")
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

router.patch("/transactions/:transactionId/approve", async (req, res) => {
  try {
    const transactionRef = db
      .collection("transactions")
      .doc(req.params.transactionId);

    const doc = await transactionRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await transactionRef.update({
      status: "approved",
      approvedAt: new Date(),
      approvedBy: req.userId,
    });

    return res.json({ message: "Withdrawal approved" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/transactions/:transactionId/reject", async (req, res) => {
  try {
    const transactionRef = db
      .collection("transactions")
      .doc(req.params.transactionId);

    const doc = await transactionRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await transactionRef.update({
      status: "rejected",
      rejectedAt: new Date(),
      rejectedBy: req.userId,
    });

    return res.json({ message: "Withdrawal rejected" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/wallets/:userId/lock", async (req, res) => {
  try {
    await db.collection("wallets").doc(req.params.userId).set(
      {
        locked: true,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return res.json({ message: "Wallet locked" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/wallets/:userId/unlock", async (req, res) => {
  try {
    await db.collection("wallets").doc(req.params.userId).set(
      {
        locked: false,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return res.json({ message: "Wallet unlocked" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/wallet/stats", async (req, res) => {
  try {
    const snapshot = await db.collection("transactions").get();
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    snapshot.docs.forEach((doc) => {
      const t = doc.data();
      const amount = Number(t.amount || 0);
      if (t.type === "deposit") totalDeposits += amount;
      if (t.type === "withdraw") totalWithdrawals += amount;
    });

    return res.json({
      totalDeposits,
      totalWithdrawals,
      totalTransactions: snapshot.size,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
