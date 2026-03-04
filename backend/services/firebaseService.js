const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function getFirebaseCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    return admin.credential.cert(serviceAccount);
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  const localServiceAccountPath = path.join(__dirname, "../serviceAccountKey.json");
  if (fs.existsSync(localServiceAccountPath)) {
    const serviceAccount = require(localServiceAccountPath);
    return admin.credential.cert(serviceAccount);
  }

  throw new Error(
    "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
  );
}

if (!admin.apps.length) {
  const options = {
    credential: getFirebaseCredential(),
  };

  if (process.env.FIREBASE_DATABASE_URL) {
    options.databaseURL = process.env.FIREBASE_DATABASE_URL;
  }

  admin.initializeApp(options);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  db,
  auth,
  admin,

  // ================= USER =================

  async createUser(uid, userData) {
    await db.collection("users").doc(uid).set({
      uid,
      ...userData,
      role: "user",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create wallet
    await db.collection("wallets").doc(uid).set({
      userId: uid,
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      locked: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  },

  async getUser(uid) {
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) return null;
    return { uid: doc.id, ...doc.data() };
  },

  // ================= WALLET =================

  async getWallet(uid) {
    const doc = await db.collection("wallets").doc(uid).get();
    if (!doc.exists) return { balance: 0 };
    return doc.data();
  },

  async updateWallet(uid, amount, type = "deposit") {

    const walletRef = db.collection("wallets").doc(uid);

    await db.runTransaction(async (transaction) => {

      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) throw new Error("Wallet not found");

      const wallet = walletDoc.data();

      if (wallet.locked) throw new Error("Wallet is locked");

      let newBalance = wallet.balance;

      if (type === "deposit") {
        newBalance += amount;
      }

      if (type === "withdraw") {

        if (wallet.balance < amount) {
          throw new Error("Insufficient balance");
        }

        newBalance -= amount;
      }

      transaction.update(walletRef, {
        balance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    });

    return { success: true };
  },

  // ================= TRANSACTION =================

  async addTransaction(uid, transactionData) {

    const transactionRef = db.collection("transactions").doc();

    await transactionRef.set({
      transactionId: transactionRef.id,
      userId: uid,
      ...transactionData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      transactionId: transactionRef.id,
      success: true,
    };
  },

  async getTransactions(uid, limit = 20) {

    const snapshot = await db
      .collection("transactions")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // ================= SCRIMS =================

  async createScrim(scrimData) {

    const scrimRef = db.collection("scrims").doc();

    await scrimRef.set({
      scrimId: scrimRef.id,
      ...scrimData,
      joinedPlayers: [],
      status: "upcoming",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      scrimId: scrimRef.id,
      success: true,
    };
  },

  async joinScrim(scrimId, userId) {

    const scrimRef = db.collection("scrims").doc(scrimId);

    await db.runTransaction(async (transaction) => {

      const scrimDoc = await transaction.get(scrimRef);

      if (!scrimDoc.exists) throw new Error("Scrim not found");

      const scrim = scrimDoc.data();

      if (scrim.joinedPlayers.includes(userId)) {
        throw new Error("Already joined");
      }

      if (scrim.joinedPlayers.length >= scrim.slots) {
        throw new Error("Scrim full");
      }

      transaction.update(scrimRef, {
        joinedPlayers: admin.firestore.FieldValue.arrayUnion(userId),
      });

    });

    return { success: true };
  },

  // ================= AUTH =================

  async verifyIdToken(token) {
    return await auth.verifyIdToken(token);
  },

  async createAuthUser(email, password) {

    const user = await auth.createUser({
      email,
      password,
    });

    return user;
  },

  async deleteAuthUser(uid) {
    await auth.deleteUser(uid);
    return { success: true };
  },

};
