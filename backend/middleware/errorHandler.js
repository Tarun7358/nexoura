/**
 * Global Error Handler Middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Firebase specific errors
  if (err.code === 'auth/user-not-found') {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  if (err.code === 'auth/wrong-password') {
    return res.status(401).json({
      success: false,
      message: 'Invalid password',
    });
  }

  if (err.code === 'auth/email-already-exists') {
    return res.status(409).json({
      success: false,
      message: 'Email already in use',
    });
  }

  if (err.code === 'auth/invalid-email') {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address',
    });
  }

  if (err.code === 'auth/weak-password') {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
