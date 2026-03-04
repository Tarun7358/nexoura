const requestLimits = {};

// Rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
  const key = `${req.ip}-${req.path}`;
  const now = Date.now();

  if (!requestLimits[key]) {
    requestLimits[key] = [];
  }

  // Remove requests older than 1 minute
  requestLimits[key] = requestLimits[key].filter(
    (timestamp) => now - timestamp < 60000
  );

  // Allow max 30 requests per minute
  if (requestLimits[key].length >= 30) {
    return res.status(429).json({
      message: "Too many requests. Please try again later.",
      retryAfter: 60,
    });
  }

  requestLimits[key].push(now);
  next();
};

// Transaction limit check (max 5 transactions per hour for payments)
const transactionLimitMiddleware = (userTransactions) => {
  return (req, res, next) => {
    const userId = req.userId;
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    if (!userTransactions[userId]) {
      userTransactions[userId] = [];
    }

    // Remove old transactions
    userTransactions[userId] = userTransactions[userId].filter(
      (timestamp) => timestamp > oneHourAgo
    );

    // Check limit
    if (userTransactions[userId].length >= 5) {
      return res.status(429).json({
        message: "Payment limit exceeded. Maximum 5 transactions per hour.",
      });
    }

    userTransactions[userId].push(now);
    next();
  };
};

module.exports = {
  rateLimitMiddleware,
  transactionLimitMiddleware,
};
