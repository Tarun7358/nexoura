# Firebase Wallet System - Complete Integration Guide

## 📋 Overview

This guide provides step-by-step instructions for integrating Firebase wallet system with Nexoura's backend. The system uses a **hybrid approach**: MongoDB for primary data storage and Firebase for real-time updates.

### Architecture
```
Nexoura Backend (Node.js/Express/MongoDB)
    ↓
    ├─→ MongoDB (Primary Data)
    │   ├─ Users
    │   ├─ Wallets
    │   ├─ Transactions
    │   └─ Scrims
    │
    └─→ Firebase/Firestore (Real-time Sync)
        ├─ users/{userId}/*
        ├─ wallets/{userId}/*
        ├─ scrims/{scrimId}
        └─ wallettransactions/{txId}
```

---

## 🚀 Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "New Project"
3. Enter project name: `nexoura-prod` (or your choice)
4. Accept terms and create

### 1.2 Enable Services
Enable the following:
- ✅ Authentication (Email/Password)
- ✅ Cloud Firestore (NoSQL)
- ✅ Cloud Functions (Node.js 18)
- ✅ Cloud Storage (for avatars, docs)
- ✅ Cloud Messaging (FCM - notifications)

### 1.3 Get Service Account Key
1. Go to Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `serviceAccountKey.json` in backend root

---

## 🔐 Step 2: Backend Setup

### 2.1 Install Firebase Admin SDK
```bash
cd backend
npm install firebase-admin
```

### 2.2 Configure Firebase
1. Copy `firebaseConfig.js` to `backend/config/`
2. Add to `.env`:
```
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=../serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 2.3 Update Server
```javascript
// backend/server.js
const { db, initialized } = require('./config/firebaseConfig');

// Log Firebase status
if (initialized) {
  console.log('✅ Firebase connected');
} else {
  console.warn('⚠️  Firebase not initialized');
}
```

---

## 📱 Step 3: Frontend Setup

### 3.1 Install Firebase SDK
```bash
cd frontend
npm install firebase firebase-functions
```

### 3.2 Create Environment File
Create `frontend/.env.local`:
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
VITE_API_BASE_URL=http://localhost:5000
```

### 3.3 Initialize Firebase in App
```typescript
// frontend/src/main.tsx
import { isFirebaseInitialized } from './utils/firebaseConfig';

if (isFirebaseInitialized()) {
  console.log('✅ Firebase initialized');
}
```

---

## ⚡ Step 4: Cloud Functions Setup

### 4.1 Generate Functions Structure
```bash
cd nexoura
node setup-functions.js
```

This creates:
```
functions/
├── package.json
└── src/
    ├── index.js
    └── functions/
        ├── wallet.js (deposits, withdrawals, rewards)
        ├── scrims.js (join, leave, rewards)
        └── users.js (create wallet on signup)
```

### 4.2 Deploy Functions
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only functions
```

Or test locally:
```bash
firebase emulators:start --only functions
```

---

## 🔑 Step 5: Firestore Security Rules

### 5.1 Deploy Rules
```bash
firebase deploy --only firestore:rules
```

**Rule Summary:**
- Users can only access their own wallet data
- Admins can create scrims and manage transactions
- All writes go through Cloud Functions (secure)
- Public read for scrims (list view)

---

## 💳 Step 6: Razorpay Integration (Optional)

### 6.1 Create Razorpay Account
- Sign up at [Razorpay](https://razorpay.com/)
- Get API Key and Secret
- Add to `.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=rzp_test_secret_xxxxx
```

### 6.2 Install Package
```bash
npm install razorpay
```

### 6.3 Create Payment Route
```javascript
// backend/routes/paymentRoutes.js
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  
  const options = {
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
});

router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Verify signature
  const crypto = require('crypto');
  const sign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (sign === razorpay_signature) {
    // Payment verified - credit wallet
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});
```

---

## 🎯 Step 7: Authentication Setup

### 7.1 Firebase Authentication
```typescript
// frontend/components/Auth/Login.tsx
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';

const handleLogin = async (email: string, password: string) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const token = await user.getIdToken();
    
    // Store token
    localStorage.setItem('firebaseToken', token);
    localStorage.setItem('userId', user.uid);
    
    // Initialize wallet
    await initializeUserWallet(user.uid);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 7.2 Update User Model (Backend)
Add Firebase UID to User schema:
```javascript
// backend/models/User.js
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  firebaseUid: { type: String, unique: true },
  walletBalance: { type: Number, default: 0 },
  // ... other fields
});
```

---

## 💰 Step 8: Wallet Operations Flow

### 8.1 Deposit Flow
```
User Clicks Deposit
       ↓
Frontend calls depositMoney()
       ↓
Cloud Function validates & updates Firestore
       ↓
Backend syncs from Firebase via webhook
       ↓
MongoDB updated
       ↓
User sees realtime balance update
```

### 8.2 Scrim Join Flow
```
User clicks Join Scrim
       ↓
Check balance (Firestore)
       ↓
Deduct entry fee (Cloud Function)
       ↓
Add to scrim.joinedPlayers
       ↓
Record transaction
       ↓
Backend updates MongoDB via sync
```

---

## 📊 Step 9: Realtime Updates

### 9.1 Listen to Wallet Changes
```typescript
import { onWalletBalanceChange } from '@/utils/firebaseWalletService';

export function WalletComponent() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const unsubscribe = onWalletBalanceChange((data) => {
      if (data) setBalance(data.balance);
    });

    return unsubscribe;
  }, []);

  return <h2>Balance: ₹{balance}</h2>;
}
```

### 9.2 Listen to Transactions
```typescript
import { onTransactionsChange } from '@/utils/firebaseWalletService';

export function TransactionHistory() {
  const [txns, setTxns] = useState([]);

  useEffect(() => {
    const unsubscribe = onTransactionsChange(setTxns);
    return unsubscribe;
  }, []);

  return txns.map(tx => (
    <div key={tx.id}>{tx.type}: ₹{tx.amount}</div>
  ));
}
```

---

## 🧪 Step 10: Testing

### 10.1 Local Development
```bash
# Terminal 1: Firebase Emulator
firebase emulators:start

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Frontend
cd frontend && npm run dev
```

### 10.2 Test Wallet Deposit
```bash
# Create user in Firebase Auth Console
# Manually add balance to Firestore for testing
# Verify realtime update in UI
```

### 10.3 Test Scrim Join
```bash
# Create scrim as admin
# User joins (entry fee deducted)
# Verify balance updated in realtime
# Check transaction recorded
```

---

## 📝 Step 11: Error Handling

### 11.1 Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| `MISSING_OR_INVALID_SERVICE_ACCOUNT_KEY` | Firebase not initialized | Check `serviceAccountKey.json` path |
| `Permission denied` | Firestore rules | Check user auth status |
| `INSUFFICIENT_BALANCE` | Not enough funds | Show error, suggest deposit |
| `ALREADY_JOINED` | User in scrim | Prevent duplicate joins |

### 11.2 Error Handling Code
```typescript
import { onWalletBalanceChange } from '@/utils/firebaseWalletService';

export function WalletComponent() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onWalletBalanceChange(
      (data) => {
        if (data) setBalance(data.balance);
        setError(null);
      },
      (error) => {
        setError(error.message);
      }
    );

    return unsubscribe;
  }, []);

  if (error) return <div className="error">{error}</div>;
  return <h2>Balance: ₹{balance}</h2>;
}
```

---

## 🔄 Step 12: Sync Strategy

### 12.1 Bidirectional Sync
**From MongoDB to Firebase:**
- Backend creates transaction → Firebase listener updates UI in realtime
- Admin approves withdrawal → Firebase updates status

**From Firebase to MongoDB:**
- Scheduled job every 5 minutes
- Event-driven triggers on critical updates

### 12.2 Sync Implementation
```javascript
// backend/jobs/syncWithFirebase.js
const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { db } = require('../config/firebaseConfig');

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('🔄 Syncing with Firebase...');
    
    // Get recent MongoDB transactions
    const recentTxns = await Transaction.find({
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    });

    // Sync each to Firebase
    for (const txn of recentTxns) {
      if (txn.firebaseId) continue; // Already synced

      const firebaseId = txn._id.toString();
      const userDoc = await db.collection('users').doc(txn.firebaseUid).get();
      
      if (userDoc.exists) {
        await db
          .collection('users')
          .doc(txn.firebaseUid)
          .collection('wallet')
          .doc('transactions')
          .collection('all')
          .doc(firebaseId)
          .set({
            transactionId: txn.transactionId,
            type: txn.type,
            amount: txn.amount,
            status: txn.status,
            createdAt: txn.createdAt,
            description: txn.description,
          });
      }
    }

    console.log('✅ Sync completed');
  } catch (error) {
    console.error('❌ Sync error:', error);
  }
});
```

---

## 📚 Step 13: Production Deployment

### 13.1 Environment Variables
Create `.env.production`:
```
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/etc/secrets/firebase-key.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=rzp_live_xxxxx
NODE_ENV=production
```

### 13.2 Deploy Backend
```bash
# Build backend
npm run build

# Deploy to server (using PM2 or Docker)
pm2 start server.js --name nexoura-api
pm2 save
```

### 13.3 Deploy Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel/Netlify/AWS S3
```

### 13.4 Deploy Cloud Functions
```bash
firebase deploy --only functions --project nexoura-prod
```

---

## 🎯 Step 14: Monitoring

### 14.1 Firebase Console Monitoring
- Go to Firebase Console → Firestore → Database
- View real-time reads/writes
- Monitor Firestore usage

### 14.2 Backend Monitoring
```javascript
// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

### 14.3 Error Tracking (Sentry)
```bash
npm install @sentry/node
```

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Service account key generated
- [ ] Cloud Functions deployed
- [ ] Firestore rules deployed
- [ ] Backend Firebase integration working
- [ ] Frontend Firebase config set
- [ ] Razorpay integration complete
- [ ] Realtime listeners working
- [ ] Sync mechanism tested
- [ ] Error handling implemented
- [ ] Production variables set
- [ ] Monitoring configured
- [ ] User testing completed

---

## 🆘 Troubleshooting

### Frontend Firebase not connecting
**Check:**
1. `.env.local` variables correct
2. Firebase project ID matches
3. No API key restrictions blocking requests

### Cloud Functions not triggering
**Check:**
1. `firebase deploy --only functions` successful
2. Firebase console shows functions deployed
3. Check Cloud Functions logs

### Real-time updates not working
**Check:**
1. Firestore rules allow user read access
2. Unsubscribe functions called in cleanup
3. Check browser console for errors

---

## 📚 Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Realtime Listeners](https://firebase.google.com/docs/firestore/query-data/listen)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [Razorpay Integration](https://razorpay.com/docs/payment-gateway/)

---

**Status**: ✅ Complete Firebase Wallet System Setup Guide Ready for Implementation
