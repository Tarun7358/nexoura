const { db, admin } = require("../services/firebaseService");

const walletCollection = db.collection("wallets");

// ================= GET WALLET =================

exports.getWallet = async (userId) => {

  const doc = await walletCollection.doc(userId).get();

  if (!doc.exists) {
    return {
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEarned: 0,
      locked: false
    };
  }

  return doc.data();
};


// ================= CREATE WALLET =================

exports.createWallet = async (userId) => {

  await walletCollection.doc(userId).set({
    userId,
    balance: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalEarned: 0,
    locked: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

};


// ================= UPDATE BALANCE =================

exports.updateBalance = async (userId, amount, type) => {

  const walletRef = walletCollection.doc(userId);

  await db.runTransaction(async (transaction) => {

    const walletDoc = await transaction.get(walletRef);

    if (!walletDoc.exists) throw new Error("Wallet not found");

    const wallet = walletDoc.data();

    if (wallet.locked) {
      throw new Error("Wallet locked");
    }

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
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

  });

};