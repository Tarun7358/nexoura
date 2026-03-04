# Firebase Wallet System - Quick Start Guide

> **⏱️ 5-minute setup** for Firebase wallet integration with Nexoura

## 🎯 What You'll Have
- ✅ Realtime wallet balance updates
- ✅ Atomic entry fee deduction
- ✅ Transaction history
- ✅ Admin scrim management
- ✅ Secure Firestore database
- ✅ Cloud Functions for payment processing

---

## 📋 Pre-requisites
- [ ] Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Service account key downloaded
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Backend Firebase files copied to `backend/config/`

---

## 🚀 Step-by-Step Setup

### 1️⃣ Download & Place Service Account Key (30 seconds)
```bash
# Download from Firebase Console > Settings > Service Accounts > Generate New Private Key
# Place in backend root directory:
backend/serviceAccountKey.json
```

### 2️⃣ Configure Environment Variables (1 minute)
```bash
# backend/.env
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=../serviceAccountKey.json
FIREBASE_DATABASE_URL=https://YOUR_PROJECT.firebaseio.com
RAZORPAY_KEY_ID=rzp_test_xxxxx        # Optional
RAZORPAY_KEY_SECRET=rzp_test_secret   # Optional
```

```bash
# frontend/.env.local
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
VITE_API_BASE_URL=http://localhost:5000
```

### 3️⃣ Install Backend Dependencies (1 minute)
```bash
cd backend
npm install firebase-admin
```

### 4️⃣ Deploy Cloud Functions (2 minutes)
```bash
cd nexoura
npm install -g firebase-tools
firebase login
node setup-functions.js           # Creates functions directory
cd functions
npm install
firebase deploy --only functions
```

### 5️⃣ Deploy Firestore Rules (30 seconds)
```bash
firebase deploy --only firestore:rules
```

### 6️⃣ Install Frontend Dependencies (1 minute)
```bash
cd frontend
npm install firebase firebase-functions
```

---

## ✅ Verify Setup

### Backend Check
```bash
cd backend
node -e "require('./config/firebaseConfig'); console.log('✅ Firebase configured')"
```

### Frontend Check
```bash
cd frontend
npm run dev
# Open browser console - should see: "✅ Firebase initialized"
```

### Test Deposit
```bash
# 1. Go to http://localhost:5173/wallet
# 2. Click "Deposit"
# 3. Complete test payment (Razorpay test mode)
# 4. Balance should update in realtime
```

---

## 🎮 Quick Test Flow

### 1. Create Admin User
```bash
# Firebase Console > Authentication > Add User
# email: admin@nexoura.com
# password: Test@123
```

### 2. Set Admin Role
```javascript
// Firebase Console > Firestore > Create documents
/users/USER_UID
{
  "role": "admin",
  "email": "admin@nexoura.com"
}
```

### 3. Create Scrim
```bash
curl -X POST http://localhost:5000/api/admin/create-scrim \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Free Fire Solo",
    "game": "Free Fire",
    "mode": "Solo",
    "entryFee": 100,
    "prizePool": 1000,
    "slots": 10,
    "map": "Bermuda"
  }'
```

### 4. Join Scrim (User)
```bash
# Frontend: Click "Join Scrim"
# Should deduct entry fee from wallet balance
# Check: Firestore > users > joinedPlayers array updated
```

---

## 📊 File Locations Reference

```
Essential Files:
✓ backend/config/firebaseConfig.js
✓ backend/controllers/walletControllerFirebase.js
✓ frontend/src/utils/firebaseConfig.ts
✓ frontend/src/utils/firebaseWalletService.ts
✓ firestore.rules
✓ functions/src/functions/wallet.js

Documentation:
📄 FIREBASE_SETUP.md
📄 FIREBASE_INTEGRATION_GUIDE.md
📄 FIREBASE_FILE_REFERENCE.md
📄 QUICK_START_GUIDE.md (this file)
```

---

## 🔧 Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| `MISSING_OR_INVALID_SERVICE_ACCOUNT_KEY` | Verify `serviceAccountKey.json` in backend root |
| Firebase not initializing | Check `.env` variables match project |
| "Permission denied" on write | Redeploy firestore.rules: `firebase deploy --only firestore:rules` |
| Realtime updates not showing | Clear browser cache, check browser console for errors |
| Cloud Functions failing | Check logs: `firebase functions:log` |

---

## 🎯 What's Next?

After setup, implement these in order:

1. **Frontend Wallet Component**
   - Display balance (realtime)
   - Show transactions
   - Add deposit button

2. **Frontend Scrim Components**
   - List scrims
   - Join scrim button
   - Leave scrim

3. **Admin Panel**
   - Create scrims
   - View players
   - Distribute rewards

4. **Payment Gateway**
   - Integrate Razorpay
   - Test deposits
   - Verify payments

5. **Production**
   - Setup custom domain
   - Enable production rules
   - Monitor Firestore usage

---

## 📚 Key Commands

```bash
# Local development
firebase emulators:start --only functions,firestore

# Deploy functions only
firebase deploy --only functions

# Deploy rules only
firebase deploy --only firestore:rules

# View Cloud Functions logs
firebase functions:log

# Check Firestore usage
firebase use --list

# List deployed functions
firebase functions:list
```

---

## 💡 Pro Tips

1. **Test locally first**
   ```bash
   firebase emulators:start
   # Use in .env: VITE_USE_FIREBASE_EMULATOR=true
   ```

2. **Monitor Firestore usage**
   - Go to Firebase Console > Firestore > Usage
   - Keep under free tier limits

3. **Backup rules**
   ```bash
   firebase firestore:get-rules > firestore.rules.backup
   ```

4. **Debug realtime listeners**
   ```typescript
   const unsubscribe = onSnapshot(docRef, 
     (doc) => console.log('Data:', doc.data()),
     (error) => console.error('Error:', error)
   );
   ```

---

## ⏰ Timeline to Launch

- **Day 1**: Setup Firebase, deploy functions & rules (2 hours)
- **Day 2**: Test wallet operations, fix issues (3 hours)
- **Day 3**: Build UI components (4 hours)
- **Day 4**: Admin panel, scrim management (3 hours)
- **Day 5**: Testing, production setup (2 hours)

**Total: ~2 weeks for full implementation**

---

## 🚀 Ready to Start?

1. ✅ Completed pre-requisites above?
2. ✅ Downloaded `serviceAccountKey.json`?
3. ✅ Configured `.env` files?
4. ✅ Ran Firebase CLI commands?

**Then you're ready!** 🎉

Start with: `firebase deploy --only firestore:rules`

---

## 📞 Need Help?

Check these in order:
1. [FIREBASE_INTEGRATION_GUIDE.md](./backend/FIREBASE_INTEGRATION_GUIDE.md) - Detailed steps
2. [FIREBASE_FILE_REFERENCE.md](./FIREBASE_FILE_REFERENCE.md) - File organization
3. [Firebase Docs](https://firebase.google.com/docs) - Official docs
4. Browser console → Check for error messages

---

**You're all set! Happy coding! 🚀**
