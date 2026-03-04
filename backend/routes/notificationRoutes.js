const express = require("express");
const { db } = require("../services/firebaseService");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);


// ================= GET USER NOTIFICATIONS =================

router.get("/", async (req, res) => {
  try {

    const { read, limit = 50 } = req.query;
    const userId = req.userId;

    let query = db
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit));

    if (read !== undefined) {
      query = query.where("read", "==", read === "true");
    }

    const snapshot = await query.get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));


    // Count unread notifications
    const unreadSnapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .where("read", "==", false)
      .get();

    const totalSnapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .get();

    res.json({
      notifications,
      unread: unreadSnapshot.size,
      total: totalSnapshot.size
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message
    });
  }
});


// ================= MARK ONE AS READ =================

router.patch("/:notificationId/read", async (req, res) => {
  try {

    const notificationRef = db
      .collection("notifications")
      .doc(req.params.notificationId);

    const doc = await notificationRef.get();

    if (!doc.exists || doc.data().userId !== req.userId) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notificationRef.update({
      read: true,
      updatedAt: new Date()
    });

    const updatedDoc = await notificationRef.get();

    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating notification",
      error: error.message
    });
  }
});


// ================= MARK ALL AS READ =================

router.patch("/", async (req, res) => {
  try {

    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", req.userId)
      .where("read", "==", false)
      .get();

    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();

    res.json({ message: "All notifications marked as read" });

  } catch (error) {
    res.status(500).json({
      message: "Error updating notifications",
      error: error.message
    });
  }
});


// ================= DELETE NOTIFICATION =================

router.delete("/:notificationId", async (req, res) => {
  try {

    const notificationRef = db
      .collection("notifications")
      .doc(req.params.notificationId);

    const doc = await notificationRef.get();

    if (!doc.exists || doc.data().userId !== req.userId) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notificationRef.delete();

    res.json({ message: "Notification deleted" });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting notification",
      error: error.message
    });
  }
});

module.exports = router;