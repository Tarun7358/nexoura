# Nexoura Wallet System - API Integration Guide

## Quick Start

### 1. User Registration
```javascript
POST /api/users/register
{
  "gamerTag": "gaming123",
  "email": "user@example.com",
  "password": "secure_password"
}

Response:
{
  "token": "jwt_token_here",
  "userId": "user_id",
  "user": {
    "wallet": { "balance": 100 }
  }
}
```

### 2. User Login
```javascript  
POST /api/users/login
{
  "email": "user@example.com",
  "password": "password"
}

Response: { token, userId, user }
```

## Wallet Management

### Get Balance
```javascript
GET /api/wallet/balance
Authorization: Bearer token

Response:
{
  "balance": 450,
  "totalDeposited": 500,
  "totalWithdrawn": 50,
  "totalEarned": 0,
  "currency": "INR"
}
```

### Deposit Money
```javascript
POST /api/wallet/deposit
{
  "amount": 500,
  "paymentMethod": "upi|razorpay|phonepe|admin"
}

Response: { transactionId, newBalance, transaction }
```

### Withdraw Money
```javascript
POST /api/wallet/withdraw
{
  "amount": 100,
  "paymentMethod": "upi"
}

Note: Withdrawal is marked PENDING until admin approves
```

### Tournament Entry
```javascript
POST /api/wallet/join-tournament
{
  "tournamentId": "tournament_id",
  "entryFee": 50
}

Response: Deducts fee from wallet, adds user to tournament
```

### Get Transaction History
```javascript
GET /api/wallet/transactions?type=deposit&status=success&limit=50

Response: Array of transactions with pagination
```

## Admin Dashboard APIs

### All Users
```javascript
GET /api/admin/users?limit=50&search=term

Response: List of users with wallet info
```

### All Transactions
```javascript
GET /api/admin/transactions?type=deposit&status=pending

Response: All system transactions for approval
```

### Approve Withdrawal
```javascript
POST /api/admin/transactions/{transactionId}/approve

Response: Updates transaction, notifies user
```

### Add Reward (Distribute Prize)
```javascript
POST /api/admin/wallet/reward
{
  "userId": "user_id",
  "amount": 5000,
  "reason": "Tournament Winner - $5000"
}

Response: Adds money to wallet, creates reward transaction
```

### Lock/Unlock Wallet
```javascript
POST /api/admin/wallet/{userId}/lock
{ "reason": "Suspicious activity detected" }

POST /api/admin/wallet/{userId}/unlock
```

## Performance Optimization Tips

1. **Cache Balance**: Store balance locally and sync every 30 seconds
2. **Batch Transactions**: Load transactions in pages (limit: 50)
3. **Rate Limiting**: Max 5 payment transactions per hour
4. **Debounce**: Debounce balance checks (300ms)
5. **Real-time Updates**: Use Socket.io for instant balance updates

## Security Rules

- ✅ All wallet operations logged
- ✅ Double-spending prevented (wallet locked during transaction)
- ✅ Withdrawal limited (max per day enforced)
- ✅ Admin approval required for withdrawals
- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ JWT tokens expire in 7 days

## Error Handling

```javascript
try {
  const response = await walletAPI.deposit(amount, 'upi');
} catch (error) {
  // error.response.status codes:
  // 400: Invalid amount / Insufficient balance / Param missing
  // 401: Unauthorized / No token
  // 403: Wallet locked
  // 404: Wallet not found
  // 429: Rate limit exceeded
  // 500: Server error
}
```

## Frontend Integration Example

```jsx
import { walletAPI } from './api/client';

function DepositComponent() {
  const [balance, setBalance] = useState(0);
  
  useEffect(() => {
    walletAPI.getBalance()
      .then(res => setBalance(res.data.balance))
      .catch(console.error);
  }, []);

  return <span>Balance: ₹{balance}</span>;
}
```

## Database Schema

### Wallet Collection
```javascript
{
  userId: ObjectId (unique),
  balance: Number (default: 100),
  totalDeposited: Number,
  totalWithdrawn: Number,
  totalEarned: Number,
  locked: Boolean,
  lockReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Collection  
```javascript
{
  transactionId: String (unique),
  userId: ObjectId,
  type: "deposit|withdraw|entry_fee|reward|refund",
  amount: Number,
  status: "pending|success|failed|cancelled",
  paymentMethod: "upi|razorpay|phonepe|admin|wallet",
  referenceId: String,
  tournamentId: ObjectId,
  metadata: { approvedBy, reason },
  createdAt: Date
}
```

## What's Included

✅ Complete wallet system with deposits/withdrawals
✅ Transaction logging for audit trail
✅ Admin dashboard with user/transaction management
✅ Withdrawal approval workflow
✅ Prize distribution system
✅ Rate limiting & security middleware
✅ Real-time notifications (Socket.io ready)
✅ Fraud detection checks

## Next Steps

1. Start backend: `npm run dev` (localhost:5000)
2. Install frontend dependencies: `npm install axios`
3. Connect Wallet screen to API endpoints
4. Test full flow: Register → Deposit → Join Tournament → Withdraw
5. Set up admin dashboard UI
