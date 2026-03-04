const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK
// Option 1: Using service account key file
let initialized = false;

try {
  const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || 
    path.join(__dirname, '../../serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountKeyPath)),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://your-project.firebaseio.com'
  });

  initialized = true;
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.log('📝 Make sure to:');
  console.log('   1. Create a Firebase project at https://console.firebase.google.com');
  console.log('   2. Download the service account key (Settings > Service Accounts > Generate New Private Key)');
  console.log('   3. Save it as serviceAccountKey.json in the backend directory');
  console.log('   4. Add FIREBASE_DATABASE_URL to .env file');
  
  // Initialize with placeholder for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️  Running in development mode without Firebase');
  }
}

const db = initialized ? admin.firestore() : null;
const auth = initialized ? admin.auth() : null;
const storage = initialized ? admin.storage() : null;

module.exports = { 
  admin, 
  db, 
  auth,
  storage,
  initialized 
};
