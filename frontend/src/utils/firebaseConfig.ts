import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let auth;
let db;
let storage;
let messaging;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  setPersistence(auth, browserLocalPersistence).catch((error) =>
    console.error('Auth persistence error:', error)
  );

  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn('FCM not available:', err?.message || err);
  }

  console.log('Firebase initialized');
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.log('Make sure frontend .env has all VITE_FIREBASE_* values');
}

export { app, auth, db, storage, messaging };

export const requestNotificationPermission = async () => {
  if (!messaging) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      return token;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
  return null;
};

export const isFirebaseInitialized = () => {
  return !!(app && auth && db);
};