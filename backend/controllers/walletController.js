const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Generate unique transaction ID
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get wallet balance
exports.getBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json({
      balance: wallet.balance,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn,
      totalEarned: wallet.totalEarned,
      currency: "INR",
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching balance", error: error.message });
  }
};

// Deposit (Add Money)
exports.deposit = async (req, res) => {
  try {
    const { amount, paymentMethod, referenceId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const transactionId = generateTransactionId();

    // Create deposit transaction
    const transaction = new Transaction({
      transactionId,
      userId: req.userId,
      type: "deposit",
      amount,
      status: "success",
      paymentMethod,
      referenceId: referenceId || "manual",
      description: `Added ₹${amount} via ${paymentMethod}`,
    });

    await transaction.save();

    // Update wallet
    wallet.balance += amount;
    wallet.totalDeposited += amount;
    await wallet.save();

    // Create notification
    const notification = new Notification({
      userId: req.userId,
      type: "deposit",
      title: "Money Added! 💰",
      message: `₹${amount} has been added to your wallet`,
      relatedId: transaction._id,
      relatedModel: "Transaction",
    });
    await notification.save();

    res.status(200).json({
      message: "Deposit successful",
      transactionId,
      newBalance: wallet.balance,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Deposit failed", error: error.message });
  }
};

// Withdraw (Withdraw Money)
exports.withdraw = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
        current: wallet.balance,
        required: amount,
      });
    }

    const transactionId = generateTransactionId();

    // Create withdrawal transaction (pending)
    const transaction = new Transaction({
      transactionId,
      userId: req.userId,
      type: "withdraw",
      amount,
      status: "pending",
      paymentMethod,
      description: `Withdrawal request for ₹${amount}`,
    });

    await transaction.save();

    // Deduct from wallet immediately
    wallet.balance -= amount;
    await wallet.save();

    // Create notification
    const notification = new Notification({
      userId: req.userId,
      type: "withdrawal",
      title: "Withdrawal Pending ⏳",
      message: `Your withdrawal of ₹${amount} is pending admin approval`,
      relatedId: transaction._id,
      relatedModel: "Transaction",
    });
    await notification.save();

    res.status(200).json({
      message: "Withdrawal request submitted",
      transactionId,
      status: "pending",
      newBalance: wallet.balance,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Withdrawal failed", error: error.message });
  }
};

// Get transaction history
exports.getTransactions = async (req, res) => {
  try {
    const { type, status, limit = 50, skip = 0 } = req.query;

    let filter = { userId: req.userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("tournamentId", "name entryFee");

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};

// Tournament entry (Deduct entry fee)
exports.joinTournament = async (req, res) => {
  try {
    const { tournamentId, entryFee } = req.body;

    if (!tournamentId || !entryFee) {
      return res.status(400).json({ message: "Tournament ID and entry fee required" });
    }

    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.balance < entryFee) {
      return res.status(400).json({
        message: "Insufficient balance for tournament entry",
        required: entryFee,
        current: wallet.balance,
      });
    }

    const transactionId = generateTransactionId();

    // Create entry fee transaction
    const transaction = new Transaction({
      transactionId,
      userId: req.userId,
      type: "entry_fee",
      amount: entryFee,
      status: "success",
      tournamentId,
      description: `Tournament entry fee`,
    });

    await transaction.save();

    // Deduct from wallet
    wallet.balance -= entryFee;
    await wallet.save();

    // Create notification
    const notification = new Notification({
      userId: req.userId,
      type: "tournament_entry",
      title: "Tournament Joined! 🎮",
      message: `You've entered the tournament with ₹${entryFee} entry fee`,
      relatedId: tournamentId,
      relatedModel: "Tournament",
    });
    await notification.save();

    res.status(200).json({
      message: "Tournament entry successful",
      transactionId,
      newBalance: wallet.balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Tournament entry failed", error: error.message });
  }
};

// Add reward (Admin only function)
exports.addReward = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid user ID or amount" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "User wallet not found" });
    }

    const transactionId = generateTransactionId();

    // Create reward transaction
    const transaction = new Transaction({
      transactionId,
      userId,
      type: "reward",
      amount,
      status: "success",
      description: reason || "Reward granted",
      metadata: {
        approvedBy: req.userId,
        reason: reason || "Admin reward",
      },
    });

    await transaction.save();

    // Add to wallet
    wallet.balance += amount;
    wallet.totalEarned += amount;
    await wallet.save();

    // Create notification
    const notification = new Notification({
      userId,
      type: "reward",
      title: "You Won a Reward! 🏆",
      message: `You've received ₹${amount} as reward - ${reason || ""}`,
      relatedId: transaction._id,
      relatedModel: "Transaction",
    });
    await notification.save();

    res.json({
      message: "Reward added successfully",
      transaction,
      newBalance: wallet.balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding reward", error: error.message });
  }
};

// Check for suspicious activity
exports.checkSuspiciousActivity = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Check for multiple withdrawals in 1 hour
    const recentWithdrawals = await Transaction.countDocuments({
      userId,
      type: "withdraw",
      status: "success",
      createdAt: { $gte: new Date(Date.now() - 3600000) },
    });

    // Check max withdrawal per day
    const totalTodayWithdrawals = await Transaction.aggregate([
      {
        $match: {
          userId: require("mongoose").Types.ObjectId(userId),
          type: "withdraw",
          status: "success",
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalToday = totalTodayWithdrawals[0]?.total || 0;

    res.json({
      recentWithdrawals,
      totalWithdrawalsToday: totalToday,
      isSuspicious: recentWithdrawals > 5 || totalToday > 50000,
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking activity", error: error.message });
  }
};
