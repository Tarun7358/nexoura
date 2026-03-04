const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const Tournament = require("../models/Tournament");
const Notification = require("../models/Notification");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, limit = 50, skip = 0, search } = req.query;

    let filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { gamerTag: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .populate("wallet")
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: { total, limit: parseInt(limit), skip: parseInt(skip) },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Get user details with wallet
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password")
      .populate("wallet")
      .populate("teams", "name members")
      .populate("tournaments", "name entryFee");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { type, status, limit = 100, skip = 0, userId } = req.query;

    let filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const transactions = await Transaction.find(filter)
      .populate("userId", "email gamerTag")
      .populate("tournamentId", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: { total, limit: parseInt(limit), skip: parseInt(skip) },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};

// Approve withdrawal
exports.approveWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.type !== "withdraw" || transaction.status !== "pending") {
      return res.status(400).json({ message: "Invalid transaction for approval" });
    }

    // Update transaction
    transaction.status = "success";
    transaction.metadata = {
      approvedBy: req.userId,
      approvedAt: new Date(),
    };
    await transaction.save();

    // Create notification
    const notification = new Notification({
      userId: transaction.userId,
      type: "withdrawal",
      title: "Withdrawal Approved! ✅",
      message: `Your withdrawal of ₹${transaction.amount} has been approved`,
      relatedId: transaction._id,
      relatedModel: "Transaction",
    });
    await notification.save();

    res.json({
      message: "Withdrawal approved",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Error approving withdrawal", error: error.message });
  }
};

// Reject withdrawal
exports.rejectWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.type !== "withdraw" || transaction.status !== "pending") {
      return res.status(400).json({ message: "Invalid transaction for rejection" });
    }

    // Refund the amount
    const wallet = await Wallet.findOne({ userId: transaction.userId });
    wallet.balance += transaction.amount;
    await wallet.save();

    // Update transaction
    transaction.status = "cancelled";
    transaction.failureReason = reason;
    transaction.metadata = {
      rejectedBy: req.userId,
      reason,
      rejectedAt: new Date(),
    };
    await transaction.save();

    // Create notification
    const notification = new Notification({
      userId: transaction.userId,
      type: "withdrawal",
      title: "Withdrawal Rejected",
      message: `Your withdrawal request was rejected. ₹${transaction.amount} has been refunded to your wallet. Reason: ${reason}`,
      relatedId: transaction._id,
      relatedModel: "Transaction",
    });
    await notification.save();

    res.json({
      message: "Withdrawal rejected and refunded",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting withdrawal", error: error.message });
  }
};

// Get wallet statistics
exports.getWalletStats = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalUsers = await User.countDocuments();
    const totalActiveUsers = await User.countDocuments({ isActive: true });
    const totalWalletBalance = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" },
          totalDeposited: { $sum: "$totalDeposited" },
          totalWithdrawn: { $sum: "$totalWithdrawn" },
        },
      },
    ]);

    res.json({
      userStats: {
        total: totalUsers,
        active: totalActiveUsers,
      },
      transactionStats: stats,
      walletStats: totalWalletBalance[0] || {
        totalBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

// Lock user wallet (for suspicious activity)
exports.lockWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    wallet.locked = true;
    wallet.lockReason = reason;
    await wallet.save();

    // Notify user
    const notification = new Notification({
      userId,
      type: "withdrawal",
      title: "Account Security Alert 🔒",
      message: `Your wallet has been locked for security reasons. Reason: ${reason}`,
    });
    await notification.save();

    res.json({
      message: "Wallet locked",
      wallet,
    });
  } catch (error) {
    res.status(500).json({ message: "Error locking wallet", error: error.message });
  }
};

// Unlock user wallet
exports.unlockWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    wallet.locked = false;
    wallet.lockReason = null;
    await wallet.save();

    res.json({
      message: "Wallet unlocked",
      wallet,
    });
  } catch (error) {
    res.status(500).json({ message: "Error unlocking wallet", error: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "moderator"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

    res.json({
      message: "User role updated",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error: error.message });
  }
};
