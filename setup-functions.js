#!/usr/bin/env node

/**
 * Firebase Cloud Functions Setup Script
 * Run this script to generate the required Cloud Functions directory structure
 * 
 * Usage: node setup-functions.js
 */

const fs = require('fs');
const path = require('path');

// Create functions directory structure
const functionsDir = path.join(__dirname, 'functions');
const srcDir = path.join(functionsDir, 'src');
const functionsFileDir = path.join(srcDir, 'functions');

const directories = [
  functionsDir,
  srcDir,
  functionsFileDir,
];

console.log('🚀 Setting up Firebase Cloud Functions structure...\n');

// Create directories
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${path.relative(process.cwd(), dir)}`);
  }
});

// Create package.json for functions
const packageJson = {
  name: "firebase-functions",
  description: "Firebase Cloud Functions for Nexoura",
  main: "src/index.js",
  scripts: {
    "serve": "firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log",
    "test": "mocha"
  },
  engines: {
    "node": "18"
  },
  dependencies: {
    "firebase-functions": "^5.0.0",
    "firebase-admin": "^12.0.0"
  },
  devDependencies: {
    "firebase-tools": "^13.0.0"
  }
};

fs.writeFileSync(
  path.join(functionsDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);
console.log(`✅ Created package.json`);

// Create index.js template
const indexTemplate = `const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Import all functions
const walletFunctions = require('./functions/wallet');
const scrimFunctions = require('./functions/scrims');
const userFunctions = require('./functions/users');

// Export all functions
module.exports = {
  // Wallet functions
  depositMoney: walletFunctions.depositMoney,
  withdrawMoney: walletFunctions.withdrawMoney,
  rewardPlayer: walletFunctions.rewardPlayer,
  
  // Scrim functions
  joinScrim: scrimFunctions.joinScrim,
  leaveScrim: scrimFunctions.leaveScrim,
  createScrim: scrimFunctions.createScrim,
  
  // User functions
  createUserWallet: userFunctions.createUserWallet,
};
`;

fs.writeFileSync(path.join(srcDir, 'index.js'), indexTemplate);
console.log(`✅ Created index.js`);

// Create wallet functions template
const walletTemplate = `const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * Deposit money to user's wallet
 * Called from frontend via httpsCallable
 */
exports.depositMoney = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const { amount, paymentReference } = data;

  // Validation
  if (!uid) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Amount must be greater than 0'
    );
  }

  if (amount > 100000) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Deposit limit is ₹100,000'
    );
  }

  const transactionId = \`TXN-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  try {
    const batch = db.batch();

    // Update user wallet
    const userRef = db.collection('users').doc(uid);
    batch.update(userRef, {
      walletBalance: admin.firestore.FieldValue.increment(amount),
      totalEarnings: admin.firestore.FieldValue.increment(amount),
    });

    // Update balance subcollection
    const balanceRef = db
      .collection('users')
      .doc(uid)
      .collection('wallet')
      .doc('balance');

    batch.update(balanceRef, {
      balance: admin.firestore.FieldValue.increment(amount),
      totalDeposited: admin.firestore.FieldValue.increment(amount),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create transaction record
    const txRef = db
      .collection('users')
      .doc(uid)
      .collection('wallet')
      .doc('transactions')
      .collection('all')
      .doc(transactionId);

    batch.set(txRef, {
      transactionId,
      type: 'deposit',
      amount,
      status: 'success',
      referenceId: paymentReference,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      description: \`Deposit of ₹\${amount}\`,
    });

    // Audit log
    const auditRef = db.collection('wallettransactions').doc(transactionId);
    batch.set(auditRef, {
      transactionId,
      userId: uid,
      type: 'deposit',
      amount,
      status: 'success',
      referenceId: paymentReference,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    console.log(\`✅ Deposit successful for user \${uid}: ₹\${amount}\`);

    return {
      success: true,
      transactionId,
      message: \`Successfully deposited ₹\${amount}\`,
    };
  } catch (error) {
    console.error('❌ Deposit error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Withdraw money from wallet
 */
exports.withdrawMoney = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const { amount, bankDetails } = data;

  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }

  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
  }

  if (!bankDetails) {
    throw new functions.https.HttpsError('invalid-argument', 'Bank details required');
  }

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (userData.walletBalance < amount) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Insufficient balance'
      );
    }

    const transactionId = \`TXN-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    const batch = db.batch();

    // Deduct from wallet
    const userRef = db.collection('users').doc(uid);
    batch.update(userRef, {
      walletBalance: admin.firestore.FieldValue.increment(-amount),
    });

    // Record transaction
    const txRef = db
      .collection('users')
      .doc(uid)
      .collection('wallet')
      .doc('transactions')
      .collection('all')
      .doc(transactionId);

    batch.set(txRef, {
      transactionId,
      type: 'withdraw',
      amount,
      status: 'pending',
      description: \`Withdrawal of ₹\${amount}\`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    // TODO: Integrate with payment gateway (Razorpay/PhonePe) to transfer money
    // Once transfer is confirmed, update status to 'success'

    return {
      success: true,
      transactionId,
      message: \`Withdrawal of ₹\${amount} initiated\`,
      status: 'pending',
    };
  } catch (error) {
    console.error('❌ Withdrawal error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Reward player (admin only)
 */
exports.rewardPlayer = functions.https.onCall(async (data, context) => {
  const { userId, amount, reason } = data;

  // Check admin status
  const adminDoc = await db.collection('users').doc(context.auth?.uid).get();
  if (adminDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  if (!userId || !amount || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid parameters');
  }

  const transactionId = \`TXN-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

  try {
    const batch = db.batch();

    // Add reward to user
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
      walletBalance: admin.firestore.FieldValue.increment(amount),
      totalEarnings: admin.firestore.FieldValue.increment(amount),
    });

    // Record transaction
    const txRef = db
      .collection('users')
      .doc(userId)
      .collection('wallet')
      .doc('transactions')
      .collection('all')
      .doc(transactionId);

    batch.set(txRef, {
      transactionId,
      type: 'reward',
      amount,
      status: 'success',
      description: reason || 'Prize reward',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return { success: true, transactionId };
  } catch (error) {
    console.error('❌ Reward error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
`;

fs.writeFileSync(
  path.join(functionsFileDir, 'wallet.js'),
  walletTemplate
);
console.log(`✅ Created wallet.js`);

// Create scrims functions template
const scrimsTemplate = `const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * Join scrim - deducts entry fee
 */
exports.joinScrim = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const { scrimId } = data;

  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }

  try {
    const scrimRef = db.collection('scrims').doc(scrimId);
    const scrimDoc = await scrimRef.get();

    if (!scrimDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Scrim not found');
    }

    const scrimData = scrimDoc.data();
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    // Validations
    if (userData.walletBalance < scrimData.entryFee) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Insufficient balance'
      );
    }

    if (scrimData.joinedPlayers?.includes(uid)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Already joined this scrim'
      );
    }

    if (scrimData.joinedPlayers?.length >= scrimData.slots) {
      throw new functions.https.HttpsError('failed-precondition', 'Scrim is full');
    }

    const transactionId = \`TXN-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    const batch = db.batch();

    // Deduct entry fee
    batch.update(userRef, {
      walletBalance: admin.firestore.FieldValue.increment(-scrimData.entryFee),
    });

    // Add player to scrim
    batch.update(scrimRef, {
      joinedPlayers: admin.firestore.FieldValue.arrayUnion(uid),
    });

    // Record transaction
    const txRef = db
      .collection('users')
      .doc(uid)
      .collection('wallet')
      .doc('transactions')
      .collection('all')
      .doc(transactionId);

    batch.set(txRef, {
      transactionId,
      type: 'entry_fee',
      amount: scrimData.entryFee,
      status: 'success',
      scrimId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      description: \`Joined scrim: \${scrimData.title}\`,
    });

    await batch.commit();

    return { success: true, transactionId };
  } catch (error) {
    console.error('❌ Join scrim error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Leave scrim - refunds entry fee
 */
exports.leaveScrim = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const { scrimId } = data;

  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }

  try {
    const scrimRef = db.collection('scrims').doc(scrimId);
    const scrimDoc = await scrimRef.get();

    if (!scrimDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Scrim not found');
    }

    const scrimData = scrimDoc.data();

    // Can only leave upcoming scrims
    if (scrimData.status !== 'upcoming') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Cannot leave an ongoing or completed scrim'
      );
    }

    if (!scrimData.joinedPlayers?.includes(uid)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Not joined in this scrim'
      );
    }

    const transactionId = \`TXN-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    const batch = db.batch();

    // Remove from scrim
    batch.update(scrimRef, {
      joinedPlayers: admin.firestore.FieldValue.arrayRemove(uid),
    });

    // Refund entry fee
    const userRef = db.collection('users').doc(uid);
    batch.update(userRef, {
      walletBalance: admin.firestore.FieldValue.increment(scrimData.entryFee),
    });

    // Record refund transaction
    const txRef = db
      .collection('users')
      .doc(uid)
      .collection('wallet')
      .doc('transactions')
      .collection('all')
      .doc(transactionId);

    batch.set(txRef, {
      transactionId,
      type: 'refund',
      amount: scrimData.entryFee,
      status: 'success',
      scrimId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      description: \`Refund for leaving scrim\`,
    });

    await batch.commit();

    return { success: true, transactionId };
  } catch (error) {
    console.error('❌ Leave scrim error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
`;

fs.writeFileSync(
  path.join(functionsFileDir, 'scrims.js'),
  scrimsTemplate
);
console.log(`✅ Created scrims.js`);

// Create users functions template
const usersTemplate = `const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * Auto-create user wallet on signup
 */
exports.createUserWallet = functions.auth.user().onCreate(async (user) => {
  try {
    const batch = db.batch();

    // Create user document
    const userRef = db.collection('users').doc(user.uid);
    batch.set(userRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'User',
      role: 'user',
      walletBalance: 0,
      totalEarnings: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: user.emailVerified || false,
    }, { merge: true });

    // Create wallet subcollection
    const balanceRef = db
      .collection('users')
      .doc(user.uid)
      .collection('wallet')
      .doc('balance');

    batch.set(balanceRef, {
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    await batch.commit();

    console.log(\`✅ Wallet created for user: \${user.uid}\`);
  } catch (error) {
    console.error('❌ Error creating wallet:', error);
  }
});

/**
 * Clean up on user deletion
 */
exports.deleteUserData = functions.auth.user().onDelete(async (user) => {
  try {
    const batch = db.batch();

    // Delete user document
    const userRef = db.collection('users').doc(user.uid);
    batch.delete(userRef);

    await batch.commit();

    console.log(\`✅ User data deleted: \${user.uid}\`);
  } catch (error) {
    console.error('❌ Error deleting user data:', error);
  }
});
`;

fs.writeFileSync(
  path.join(functionsFileDir, 'users.js'),
  usersTemplate
);
console.log(`✅ Created users.js`);

console.log('\n✅ Cloud Functions structure created successfully!');
console.log('\n📝 Next steps:');
console.log('   1. cd functions');
console.log('   2. npm install');
console.log('   3. firebase deploy --only functions');
console.log('\n💡 For local development:');
console.log('   firebase emulators:start --only functions');
