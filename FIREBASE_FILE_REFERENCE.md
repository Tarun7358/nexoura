# Firebase Wallet System - File Structure & Reference

## 📁 Complete File Organization

```
nexoura/
├── backend/
│   ├── config/
│   │   ├── firebaseConfig.js           ← Firebase Admin SDK initialization
│   │   └── db.js                       ← MongoDB connection
│   │
│   ├── controllers/
│   │   ├── walletController.js         ← MongoDB wallet operations
│   │   ├── walletControllerFirebase.js ← Firebase + MongoDB hybrid operations
│   │   ├── adminController.js          ← Admin operations
│   │   └── scrimController.js          ← Scrim operations
│   │
│   ├── models/
│   │   ├── User.js                     ← User schema
│   │   ├── Wallet.js                   ← Wallet schema
│   │   ├── Transaction.js              ← Transaction schema
│   │   ├── Scrim.js                    ← Scrim schema
│   │   ├── Tournament.js               ← Tournament schema
│   │   └── Team.js                     ← Team schema
│   │
│   ├── routes/
│   │   ├── userRoutes.js               ← User endpoints
│   │   ├── walletRoutes.js             ← Wallet endpoints (GET balance, transactions)
│   │   ├── scrimRoutes.js              ← Public scrim endpoints (list, join, leave)
│   │   ├── adminScrimRoutes.js         ← Admin scrim management
│   │   └── adminRoutes.js              ← Admin operations
│   │
│   ├── middleware/
│   │   ├── auth.js                     ← JWT authentication
│   │   ├── admin.js                    ← Admin verification
│   │   └── errorHandler.js             ← Error handling
│   │
│   ├── functions/              (Optional: Firebase Cloud Functions)
│   │   ├── src/
│   │   │   ├── index.js                ← Functions entry point
│   │   │   └── functions/
│   │   │       ├── wallet.js           ← Deposit, withdraw, rewards
│   │   │       ├── scrims.js           ← Join, leave scrims
│   │   │       └── users.js            ← Auto-create wallet on signup
│   │   └── package.json
│   │
│   ├── jobs/
│   │   └── syncWithFirebase.js         ← Periodic sync job
│   │
│   ├── FIREBASE_SETUP.md               ← Firebase setup guide
│   ├── FIREBASE_INTEGRATION_GUIDE.md   ← Complete integration steps
│   ├── .env.example                    ← Backend environment template
│   ├── .env                            ← Sensitive variables (git ignored)
│   ├── server.js                       ← Express server entry
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── utils/
│   │   │   ├── firebaseConfig.ts       ← Firebase SDK initialization
│   │   │   ├── firebaseFunction.ts     ← Cloud Functions helper
│   │   │   ├── firebaseWalletService.ts ← Wallet operations & listeners
│   │   │   ├── firebaseAuthService.ts  ← Authentication operations
│   │   │   └── firebaseScrimService.ts ← Scrim operations
│   │   │
│   │   ├── components/
│   │   │   ├── Wallet/
│   │   │   │   ├── WalletBalance.tsx   ← Display balance (realtime)
│   │   │   │   ├── DepositModal.tsx    ← Deposit UI
│   │   │   │   ├── WithdrawModal.tsx   ← Withdraw UI
│   │   │   │   └── TransactionHistory.tsx
│   │   │   │
│   │   │   ├── Scrims/
│   │   │   │   ├── ScrimList.tsx       ← Display scrims
│   │   │   │   ├── ScrimDetail.tsx     ← Single scrim view
│   │   │   │   └── JoinScrimButton.tsx ← Join with fee deduction
│   │   │   │
│   │   │   ├── Admin/
│   │   │   │   ├── AdminScrimPanel.tsx ← Create/edit scrims
│   │   │   │   ├── AdminRewardModal.tsx ← Reward players
│   │   │   │   └── AdminDashboard.tsx  ← Admin overview
│   │   │   │
│   │   │   └── Auth/
│   │   │       ├── Login.tsx           ← Firebase auth login
│   │   │       └── Signup.tsx          ← Firebase auth signup
│   │   │
│   │   ├── hooks/
│   │   │   ├── useWallet.ts            ← Wallet data hook
│   │   │   ├── useScrims.ts            ← Scrims data hook
│   │   │   └── useRealtimeUpdates.ts   ← Realtime listener hook
│   │   │
│   │   └── App.tsx
│   │
│   ├── .env.local.example              ← Frontend environment template
│   ├── .env.local                      ← Sensitive variables (git ignored)
│   ├── package.json
│   └── vite.config.ts
│
├── firestore.rules                     ← Firestore security rules
├── firebase.json                       ← Firebase configuration
├── setup-functions.js                  ← Script to create functions directory
├── serviceAccountKey.json              ← Firebase service account (git ignored)
│
└── README.md
```

---

## 🔑 Key Files & Their Purpose

### Backend Configuration
| File | Purpose | Key Variables |
|------|---------|---------------|
| `config/firebaseConfig.js` | Firebase Admin SDK setup | `admin`, `db`, `auth` |
| `.env` (Backend) | MongoDB, Firebase, Keys | `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` |
| `FIREBASE_SETUP.md` | Firebase project setup steps | - |
| `FIREBASE_INTEGRATION_GUIDE.md` | Complete integration walkthrough | - |

### Backend Operations
| File | Purpose | Main Exports |
|------|---------|--------------|
| `controllers/walletControllerFirebase.js` | Hybrid MongoDB+Firebase wallet ops | `getBalance`, `depositMoney`, `withdrawMoney` |
| `models/Wallet.js` | MongoDB wallet schema | `Wallet` model |
| `models/Transaction.js` | MongoDB transaction schema | `Transaction` model |
| `routes/walletRoutes.js` | REST API for wallet | `/api/wallet/*` |
| `routes/scrimRoutes.js` | Public scrim endpoints | `/api/scrims/*` |
| `routes/adminScrimRoutes.js` | Admin scrim operations | `/api/admin/scrims/*` |

### Cloud Functions
| File | Purpose | Functions |
|------|---------|-----------|
| `functions/src/functions/wallet.js` | Cloud Functions for wallet | `depositMoney`, `withdrawMoney`, `rewardPlayer` |
| `functions/src/functions/scrims.js` | Cloud Functions for scrims | `joinScrim`, `leaveScrim` |
| `functions/src/functions/users.js` | Cloud Functions for users | `createUserWallet`, `deleteUserData` |

### Frontend Configuration
| File | Purpose | Key Exports |
|------|---------|------------|
| `utils/firebaseConfig.ts` | Firebase SDK & Firestore setup | `app`, `auth`, `db`, `storage` |
| `utils/firebaseWalletService.ts` | Wallet CRUD operations & listeners | `getWalletBalance`, `onWalletBalanceChange`, `joinScrimWithFee` |
| `utils/firebaseAuthService.ts` | Authentication operations | `login`, `signup`, `logout` |
| `.env.local` | API keys and config | `VITE_FIREBASE_*` variables |

### Frontend Components
| File | Purpose | Props |
|------|---------|-------|
| `components/Wallet/WalletBalance.tsx` | Display realtime balance | - |
| `components/Wallet/DepositModal.tsx` | Deposit interface | `isOpen`, `onClose` |
| `components/Wallet/TransactionHistory.tsx` | Transaction list | `limit` |
| `components/Scrims/ScrimList.tsx` | List all scrims | `filter` |
| `components/Scrims/JoinScrimButton.tsx` | Join scrim with fee deduction | `scrimId` |

### Firestore Schemas
| Collection | Fields | Purpose |
|------------|--------|---------|
| `users/{userId}` | uid, email, name, walletBalance, role | User profile + balance |
| `users/{userId}/wallet/balance` | balance, totalDeposited, totalWithdrawn | Wallet summary |
| `users/{userId}/wallet/transactions/all/{txnId}` | type, amount, status, createdAt | Transaction history |
| `scrims/{scrimId}` | title, game, entryFee, joinedPlayers, status | Scrim details |
| `wallettransactions/{txnId}` | userId, type, amount, status | Audit log |

---

## 🔄 Data Flow Diagrams

### Deposit Flow
```
Frontend (React)
    ↓
User clicks "Deposit"
    ↓
DepositModal.tsx calls depositMoney()
    ↓
firebaseWalletService.ts → Cloud Function
    ↓
Razorpay Payment Gateway
    ↓
Payment verified → deposit confirmed
    ↓
Firestore updated (balance + transaction)
    ↓
Realtime listener triggers
    ↓
UI updates with new balance
```

### Join Scrim Flow
```
Frontend
    ↓
User clicks "Join Scrim"
    ↓
Check balance from Firestore listener
    ↓
Call joinScrimWithFee()
    ↓
Cloud Function joinScrim()
    ↓
Validate balance & slots
    ↓
Deduct entry fee atomically
    ↓
Add user to joinedPlayers
    ↓
Record transaction in Firestore
    ↓
Backend syncs to MongoDB
    ↓
UI updates in realtime
```

### Admin Create Scrim Flow
```
Admin Dashboard
    ↓
Fill scrim details
    ↓
POST /api/admin/create-scrim
    ↓
Backend creates in MongoDB
    ↓
Sync to Firestore (collection: scrims)
    ↓
Public users see in list
    ↓
Admins can manage in admin panel
```

---

## 🚀 API Endpoints Reference

### Wallet Endpoints
```
GET    /api/wallet/balance              → Get wallet balance
POST   /api/wallet/deposit              → Initiate deposit
POST   /api/wallet/deposit/confirm      → Confirm deposit after payment
POST   /api/wallet/withdraw             → Request withdrawal
GET    /api/wallet/transactions         → Get transaction history
```

### Scrim Endpoints
```
GET    /api/scrims                      → List all scrims
GET    /api/scrims/:id                  → Get scrim details
POST   /api/scrims/:id/join             → Join scrim
POST   /api/scrims/:id/leave            → Leave scrim

POST   /api/admin/create-scrim          → Create scrim (admin only)
PUT    /api/admin/update-scrim/:id      → Update scrim (admin only)
DELETE /api/admin/delete-scrim/:id      → Delete scrim (admin only)
POST   /api/admin/start-scrim/:id       → Start scrim (admin only)
POST   /api/admin/end-scrim/:id         → End scrim (admin only)
```

---

## 🔐 Security Rules Summary

### Read Access
- Users can read own wallet data
- Scrims readable by all authenticated users
- Admin transactions visible to admins only

### Write Access
- Wallet writes only via Cloud Functions
- Scrim creation by admins only
- Transactions immutable (no edits)

### Delete Access
- Admins can delete scrims
- Users cannot delete transactions

---

## 📦 Installation Checklist

### Backend
- [ ] Install `firebase-admin`
- [ ] Copy `firebaseConfig.js` to `backend/config/`
- [ ] Copy `walletControllerFirebase.js` to `backend/controllers/`
- [ ] Add Firebase routes to `server.js`
- [ ] Configure `.env` with Firebase variables
- [ ] Download and save `serviceAccountKey.json`

### Frontend
- [ ] Install `firebase` and `firebase-functions`
- [ ] Copy Firebase utility files to `frontend/src/utils/`
- [ ] Copy `.env.local` template
- [ ] Create wallet and scrim components
- [ ] Add realtime listeners to components

### Cloud Functions
- [ ] Run `node setup-functions.js`
- [ ] Install dependencies: `cd functions && npm install`
- [ ] Deploy: `firebase deploy --only functions`
- [ ] Deploy rules: `firebase deploy --only firestore:rules`

### Firebase Console
- [ ] Enable Firestore
- [ ] Enable Cloud Functions
- [ ] Deploy security rules
- [ ] Create API keys (if using REST)

---

## 🧪 Testing Checklist

- [ ] Firebase connects without errors
- [ ] User signup creates wallet in Firestore
- [ ] Deposit flow works end-to-end
- [ ] Realtime balance updates in UI
- [ ] Join scrim deducts entry fee
- [ ] Transaction history populated
- [ ] Admin can create scrims
- [ ] Public users see scrims in list
- [ ] Leave scrim refunds fee
- [ ] Firestore rules enforced (no unauthorized access)

---

## 📞 Common Issues & Solutions

### Problem: "MISSING_OR_INVALID_SERVICE_ACCOUNT_KEY"
**Solution:**
1. Verify `serviceAccountKey.json` exists in backend root
2. Check `.env` path is correct
3. Validate JSON syntax is valid

### Problem: Realtime updates not showing
**Solution:**
1. Ensure `onSnapshot` listener is attached
2. Check Firestore rules allow read access
3. Verify `unsubscribe()` called in cleanup

### Problem: Transaction recorded twice (MongoDB + Firebase)
**Solution:**
1. Use batch writes in Cloud Functions
2. Implement idempotency keys
3. Use sync job to prevent duplicates

### Problem: Admin can't create scrims
**Solution:**
1. Verify user has `role: 'admin'` in Firestore
2. Check Firestore rules allow admin writes
3. Validate Cloud Function has admin permissions

---

## 🎓 Learning Resources

### Required Reading
1. [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
2. [Firestore Realtime Listeners](https://firebase.google.com/docs/firestore/query-data/listen)
3. [Cloud Functions](https://firebase.google.com/docs/functions)
4. [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

### Helpful Links
- [Firebase Console](https://console.firebase.google.com/)
- [Cloud Functions API Reference](https://firebase.google.com/docs/reference/functions)
- [Firestore Data Structure](https://firebase.google.com/docs/firestore/data-model)

---

**Last Updated:** 2024
**Status:** Complete Firebase Wallet System - Ready for Development
