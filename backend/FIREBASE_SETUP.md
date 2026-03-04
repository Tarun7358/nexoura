# Firebase Wallet System Setup Guide

## 🔥 Firebase Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable the following services:
   - Authentication (Email/Password, Google, Phone)
   - Cloud Firestore
   - Cloud Functions
   - Cloud Messaging

### 2. Initialize Firebase

**Backend** (Node.js with Admin SDK):
```javascript
// firebase-config.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
  databaseURL: 'https://your-project.firebaseio.com'
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
```

**Frontend** (React with SDK):
```jsx
// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 👥 User Authentication Setup

### Sign Up (Email + Password)
```javascript
// Firebase Auth
const { user } = await createUserWithEmailAndPassword(auth, email, password);

// Create user document in Firestore
await db.collection('users').doc(user.uid).set({
  uid: user.uid,
  email: user.email,
  name: name,
  role: 'user',
  walletBalance: 0,
  createdAt: new Date(),
  emailVerified: false
});

// Initialize wallet subcollection
await db.collection('users').doc(user.uid).collection('wallet').doc('balance').set({
  balance: 0,
  totalDeposited: 0,
  totalWithdrawn: 0,
  lastUpdated: new Date()
});
```

### Sign In
```javascript
const { user } = await signInWithEmailAndPassword(auth, email, password);
```

### Google Sign-In
```javascript
const provider = new GoogleAuthProvider();
const { user } = await signInWithPopup(auth, provider);
// Create user doc if new user
```

---

## 💰 Firestore Database Schema

### Collections

#### `users/{userId}`
```javascript
{
  uid: string,
  email: string,
  name: string,
  role: 'user' | 'admin',
  walletBalance: number,
  totalEarnings: number,
  createdAt: timestamp,
  lastLogin: timestamp,
  emailVerified: boolean,
  avatar: string (optional)
}
```

#### `users/{userId}/wallet/transactions` (subcollection)
```javascript
{
  transactionId: string,
  type: 'deposit' | 'withdraw' | 'entry_fee' | 'reward',
  amount: number,
  status: 'pending' | 'success' | 'failed',
  referenceId: string,
  scrimId: string (optional),
  createdAt: timestamp,
  completedAt: timestamp (optional),
  description: string
}
```

#### `scrims/{scrimId}`
```javascript
{
  scrimId: string,
  title: string,
  game: 'Free Fire' | 'PUBG' | 'COD' | 'Fortnite' | 'Valorant',
  mode: 'Solo' | 'Duo' | 'Squad' | '4v4' | '5v5',
  entryFee: number,
  prizePool: number,
  slots: number,
  joinedPlayers: [userId1, userId2, ...],
  date: timestamp,
  time: string (HH:MM format),
  map: string,
  roomId: string,
  roomPassword: string,
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  createdBy: adminId,
  createdAt: timestamp,
  startedAt: timestamp (optional),
  endedAt: timestamp (optional)
}
```

#### `wallettransactions/{transactionId}` (optional, for audit log)
```javascript
{
  transactionId: string,
  userId: string,
  type: string,
  amount: number,
  status: string,
  referenceId: string,
  createdAt: timestamp
}
```

---

## ⚡ Cloud Functions

### 1. Auto-Create Wallet on User Signup

**File**: `functions/onUserSignup.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.createUserWallet = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  
  try {
    // Create user document
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'User',
      role: 'user',
      walletBalance: 0,
      totalEarnings: 0,
      createdAt: new Date(),
      emailVerified: user.emailVerified
    });

    // Create wallet subcollection
    await db.collection('users').doc(user.uid).collection('wallet').doc('balance').set({
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      lastUpdated: new Date()
    });

    console.log(`Wallet created for user: ${user.uid}`);
  } catch (error) {
    console.error('Error creating wallet:', error);
  }
});
```

### 2. Deposit Money (Add Funds)

**File**: `functions/onDeposit.js`

```javascript
exports.depositMoney = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;
  const { amount, paymentReference } = data;
  
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  if (!amount || amount <= 0) throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');

  const db = admin.firestore();
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Update wallet balance
    await db.collection('users').doc(uid).update({
      walletBalance: admin.firestore.FieldValue.increment(amount),
      totalEarnings: admin.firestore.FieldValue.increment(amount)
    });

    // Update wallet subcollection
    await db.collection('users').doc(uid).collection('wallet').doc('balance').update({
      balance: admin.firestore.FieldValue.increment(amount),
      totalDeposited: admin.firestore.FieldValue.increment(amount),
      lastUpdated: new Date()
    });

    // Create transaction record
    await db.collection('users').doc(uid).collection('wallet').doc('transactions').collection('all').doc(transactionId).set({
      transactionId,
      type: 'deposit',
      amount,
      status: 'success',
      referenceId: paymentReference,
      createdAt: new Date(),
      description: `Deposit of ₹${amount} via ${paymentReference}`
    });

    // Audit log
    await db.collection('wallettransactions').doc(transactionId).set({
      transactionId,
      userId: uid,
      type: 'deposit',
      amount,
      status: 'success',
      referenceId: paymentReference,
      createdAt: new Date()
    });

    return { success: true, transactionId, newBalance: admin.firestore.FieldValue.increment(amount) };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### 3. Join Scrim (Deduct Entry Fee)

**File**: `functions/onJoinScrim.js`

```javascript
exports.joinScrim = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;
  const { scrimId } = data;

  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  if (!scrimId) throw new functions.https.HttpsError('invalid-argument', 'Scrim ID required');

  const db = admin.firestore();
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Get scrim details
    const scrimDoc = await db.collection('scrims').doc(scrimId).get();
    if (!scrimDoc.exists) throw new functions.https.HttpsError('not-found', 'Scrim not found');

    const scrimData = scrimDoc.data();
    const entryFee = scrimData.entryFee;

    // Get user wallet
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (userData.walletBalance < entryFee) {
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient balance');
    }

    // Check if already joined
    if (scrimData.joinedPlayers.includes(uid)) {
      throw new functions.https.HttpsError('failed-precondition', 'Already joined this scrim');
    }

    // Deduct entry fee
    await db.collection('users').doc(uid).update({
      walletBalance: admin.firestore.FieldValue.increment(-entryFee)
    });

    // Add user to scrim
    await db.collection('scrims').doc(scrimId).update({
      joinedPlayers: admin.firestore.FieldValue.arrayUnion(uid)
    });

    // Create transaction record
    await db.collection('users').doc(uid).collection('wallet').doc('transactions').collection('all').doc(transactionId).set({
      transactionId,
      type: 'entry_fee',
      amount: entryFee,
      status: 'success',
      scrimId,
      createdAt: new Date(),
      description: `Joined scrim: ${scrimData.title}`
    });

    return { success: true, transactionId };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### 4. Distribute Reward (Admin Only)

**File**: `functions/onRewardPlayer.js`

```javascript
exports.rewardPlayer = functions.https.onCall(async (data, context) => {
  const adminUid = context.auth.uid;
  const { userId, amount, reason } = data;

  if (!adminUid) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');

  const db = admin.firestore();

  try {
    // Verify admin role
    const adminDoc = await db.collection('users').doc(adminUid).get();
    if (adminDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add reward to user wallet
    await db.collection('users').doc(userId).update({
      walletBalance: admin.firestore.FieldValue.increment(amount),
      totalEarnings: admin.firestore.FieldValue.increment(amount)
    });

    // Create transaction record
    await db.collection('users').doc(userId).collection('wallet').doc('transactions').collection('all').doc(transactionId).set({
      transactionId,
      type: 'reward',
      amount,
      status: 'success',
      createdAt: new Date(),
      description: reason || 'Prize reward'
    });

    return { success: true, transactionId };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

---

## 🔐 Firestore Security Rules

**File**: `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Allow reading certain fields publicly (like username for leaderboard)
      allow read: if true; // Adjust based on privacy needs
      
      // Subcollections
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Scrims readable by all authenticated users
    match /scrims/{scrimId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update, delete: if request.auth.uid == resource.data.createdBy ||
                              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Transactions readable only by owner
    match /wallettransactions/{transactionId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 📱 Frontend: Realtime Wallet Updates

**React Component** with Firestore listeners:

```jsx
import { useEffect, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

function WalletComponent() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Real-time balance listener
    const unsubscribeBalance = onSnapshot(
      doc(db, 'users', user.uid, 'wallet', 'balance'),
      (doc) => {
        setBalance(doc.data()?.balance || 0);
      }
    );

    // Real-time transactions listener
    const unsubscribeTransactions = onSnapshot(
      doc(db, 'users', user.uid, 'wallet', 'transactions'),
      (doc) => {
        setTransactions(doc.data()?.all || []);
      }
    );

    return () => {
      unsubscribeBalance();
      unsubscribeTransactions();
    };
  }, []);

  return (
    <div>
      <h2>Wallet Balance: ₹{balance}</h2>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.transactionId}>
            {tx.type}: ₹{tx.amount} - {tx.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WalletComponent;
```

---

## 🚀 Deployment

### Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Everything
```bash
firebase deploy
```

---

## 📊 Hybrid Approach (Recommended)

Use **both** MongoDB + Firebase:
- **MongoDB**: Core app data (users, tournaments, teams)
- **Firebase**: Wallet transactions, real-time updates, auth

This provides:
- ✅ Fast real-time wallet updates
- ✅ Secure authentication
- ✅ Scalable backend
- ✅ Native Firebase messaging

---

## 🔄 Migration Path

If migrating from MongoDB to Firebase:

1. Set up Firebase project
2. Implement Cloud Functions in parallel
3. Keep MongoDB as backup
4. Gradually migrate users to Firebase wallet
5. Monitor and optimize
6. Full migration complete

---

**Status**: Complete Firebase setup guide ready for implementation
