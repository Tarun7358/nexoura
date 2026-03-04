import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  increment,
  arrayUnion,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { getFirebaseFunction } from './firebaseFunction';

/**
 * Firebase Wallet Service
 * Handles all wallet operations with Firestore
 */

// ==================== READ OPERATIONS ====================

/**
 * Get user's current wallet balance
 */
export const getWalletBalance = async (userId = auth.currentUser?.uid) => {
  if (!userId) throw new Error('User not authenticated');

  try {
    const balanceRef = doc(db, 'users', userId, 'wallet', 'balance');
    const balanceSnap = await getDoc(balanceRef);

    if (!balanceSnap.exists()) {
      console.warn('Wallet balance document not found, returning 0');
      return {
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        lastUpdated: new Date(),
      };
    }

    return balanceSnap.data();
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw error;
  }
};

/**
 * Get user's transaction history
 */
export const getTransactionHistory = async (
  userId = auth.currentUser?.uid,
  limitCount = 10
) => {
  if (!userId) throw new Error('User not authenticated');

  try {
    const transactionsQuery = query(
      collection(db, 'users', userId, 'wallet', 'transactions', 'all'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const transactionsSnap = await getDocs(transactionsQuery);
    return transactionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Get user's scrim-related transactions
 */
export const getScrimTransactions = async (
  userId = auth.currentUser?.uid,
  limitCount = 20
) => {
  if (!userId) throw new Error('User not authenticated');

  try {
    const transactionsQuery = query(
      collection(db, 'users', userId, 'wallet', 'transactions', 'all'),
      where('type', 'in', ['entry_fee', 'reward']),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const transactionsSnap = await getDocs(transactionsQuery);
    return transactionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching scrim transactions:', error);
    throw error;
  }
};

// ==================== WRITE OPERATIONS ====================

/**
 * Initialize wallet for new user
 */
export const initializeUserWallet = async (userId = auth.currentUser?.uid) => {
  if (!userId) throw new Error('User not authenticated');

  try {
    const balanceRef = doc(db, 'users', userId, 'wallet', 'balance');
    
    await setDoc(balanceRef, {
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      lastUpdated: serverTimestamp(),
    }, { merge: true });

    console.log('✅ Wallet initialized for user:', userId);
  } catch (error) {
    console.error('Error initializing wallet:', error);
    throw error;
  }
};

/**
 * Record a transaction in wallet history
 */
export const recordTransaction = async (
  transactionData,
  userId = auth.currentUser?.uid
) => {
  if (!userId) throw new Error('User not authenticated');

  const {
    type,        // 'deposit', 'withdraw', 'entry_fee', 'reward'
    amount,
    status,       // 'pending', 'success', 'failed'
    referenceId,  // Payment gateway reference
    scrimId,      // Optional, for scrim-related txns
    description,
  } = transactionData;

  try {
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const txData = {
      transactionId,
      type,
      amount,
      status,
      referenceId: referenceId || '',
      scrimId: scrimId || '',
      description: description || '',
      createdAt: serverTimestamp(),
      completedAt: status === 'success' ? serverTimestamp() : null,
    };

    // Add to user's transaction subcollection
    const txRef = doc(
      db,
      'users',
      userId,
      'wallet',
      'transactions',
      'all',
      transactionId
    );
    
    await setDoc(txRef, txData);

    // Also record in audit collection (optional)
    if (status === 'success') {
      const auditRef = doc(db, 'wallettransactions', transactionId);
      await setDoc(auditRef, {
        ...txData,
        userId,
      });
    }

    console.log('✅ Transaction recorded:', transactionId);
    return transactionId;
  } catch (error) {
    console.error('Error recording transaction:', error);
    throw error;
  }
};

/**
 * Deposit money to wallet
 * Calls Cloud Function for atomic update
 */
export const depositMoney = async (
  amount,
  paymentReference,
  userId = auth.currentUser?.uid
) => {
  if (!userId) throw new Error('User not authenticated');
  if (!amount || amount <= 0) throw new Error('Invalid amount');

  try {
    // Call Cloud Function
    const depositFunction = httpsCallable(getFirebaseFunction(), 'depositMoney');
    const response = await depositFunction({
      amount,
      paymentReference,
    });

    console.log('✅ Deposit successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Deposit failed:', error);
    throw error;
  }
};

/**
 * Withdraw money from wallet
 * Calls Cloud Function for atomic update + bank transfer logic
 */
export const withdrawMoney = async (
  amount,
  bankDetails,
  userId = auth.currentUser?.uid
) => {
  if (!userId) throw new Error('User not authenticated');
  if (!amount || amount <= 0) throw new Error('Invalid amount');
  if (!bankDetails) throw new Error('Bank details required');

  try {
    // First, check balance
    const wallet = await getWalletBalance(userId);
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Call Cloud Function
    const withdrawFunction = httpsCallable(getFirebaseFunction(), 'withdrawMoney');
    const response = await withdrawFunction({
      amount,
      bankDetails,
    });

    console.log('✅ Withdrawal initiated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Withdrawal failed:', error);
    throw error;
  }
};

// ==================== REALTIME LISTENERS ====================

/**
 * Listen to wallet balance in realtime
 */
export const onWalletBalanceChange = (
  callback,
  userId = auth.currentUser?.uid
) => {
  if (!userId) {
    console.error('User not authenticated');
    return () => {};
  }

  try {
    const balanceRef = doc(db, 'users', userId, 'wallet', 'balance');
    
    const unsubscribe = onSnapshot(
      balanceRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        } else {
          console.warn('Balance document not found');
          callback({
            balance: 0,
            totalDeposited: 0,
            totalWithdrawn: 0,
          });
        }
      },
      (error) => {
        console.error('Error listening to balance:', error);
        callback(null, error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up balance listener:', error);
    return () => {};
  }
};

/**
 * Listen to transaction updates in realtime
 */
export const onTransactionsChange = (
  callback,
  userId = auth.currentUser?.uid,
  txLimit = 10
) => {
  if (!userId) {
    console.error('User not authenticated');
    return () => {};
  }

  try {
    const transactionsQuery = query(
      collection(db, 'users', userId, 'wallet', 'transactions', 'all'),
      orderBy('createdAt', 'desc'),
      limit(txLimit)
    );

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(transactions);
      },
      (error) => {
        console.error('Error listening to transactions:', error);
        callback([], error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up transactions listener:', error);
    return () => {};
  }
};

// ==================== SCRIM OPERATIONS ====================

/**
 * Join scrim - deducts entry fee atomically
 * Calls Cloud Function
 */
export const joinScrimWithFee = async (
  scrimId,
  userId = auth.currentUser?.uid
) => {
  if (!userId) throw new Error('User not authenticated');
  if (!scrimId) throw new Error('Scrim ID required');

  try {
    // Call Cloud Function
    const joinFunction = httpsCallable(getFirebaseFunction(), 'joinScrim');
    const response = await joinFunction({ scrimId });

    console.log('✅ Joined scrim successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to join scrim:', error);
    throw error;
  }
};

/**
 * Leave scrim - refunds entry fee (if scrim not started)
 */
export const leaveScrim = async (
  scrimId,
  userId = auth.currentUser?.uid
) => {
  if (!userId) throw new Error('User not authenticated');
  if (!scrimId) throw new Error('Scrim ID required');

  try {
    // Get scrim details
    const scrimRef = doc(db, 'scrims', scrimId);
    const scrimSnap = await getDoc(scrimRef);

    if (!scrimSnap.exists()) {
      throw new Error('Scrim not found');
    }

    const scrimData = scrimSnap.data();

    // Check if user is joined
    if (!scrimData.joinedPlayers?.includes(userId)) {
      throw new Error('Not joined in this scrim');
    }

    // Only allow leaving if scrim hasn't started
    if (scrimData.status !== 'upcoming') {
      throw new Error('Cannot leave an ongoing or completed scrim');
    }

    // Use batch to atomically update scrim and wallet
    const batch = writeBatch(db);

    // Remove from scrim
    batch.update(scrimRef, {
      joinedPlayers: arrayUnion().filter(id => id !== userId),
      slots: increment(1), // Free up a slot
    });

    // Refund entry fee to user
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      walletBalance: increment(scrimData.entryFee),
    });

    // Record refund transaction
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const txRef = doc(
      db,
      'users',
      userId,
      'wallet',
      'transactions',
      'all',
      transactionId
    );

    batch.set(txRef, {
      transactionId,
      type: 'refund',
      amount: scrimData.entryFee,
      status: 'success',
      scrimId,
      createdAt: serverTimestamp(),
      description: `Refund for leaving scrim: ${scrimData.title}`,
    });

    await batch.commit();

    console.log('✅ Left scrim and refunded entry fee');
    return { success: true, transactionId, refundAmount: scrimData.entryFee };
  } catch (error) {
    console.error('Error leaving scrim:', error);
    throw error;
  }
};

/**
 * Reward player - admin only (uses Cloud Function)
 */
export const rewardPlayer = async (
  userId,
  amount,
  reason = 'Prize reward'
) => {
  try {
    const rewardFunction = httpsCallable(getFirebaseFunction(), 'rewardPlayer');
    const response = await rewardFunction({
      userId,
      amount,
      reason,
    });

    console.log('✅ Reward given:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error giving reward:', error);
    throw error;
  }
};

export default {
  // Read
  getWalletBalance,
  getTransactionHistory,
  getScrimTransactions,
  
  // Write
  initializeUserWallet,
  recordTransaction,
  depositMoney,
  withdrawMoney,
  
  // Realtime
  onWalletBalanceChange,
  onTransactionsChange,
  
  // Scrims
  joinScrimWithFee,
  leaveScrim,
  rewardPlayer,
};
