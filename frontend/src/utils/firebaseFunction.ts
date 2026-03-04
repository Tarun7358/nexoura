import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { app } from './firebaseConfig';

// Get Firebase Functions instance
let functionsInstance = null;

export const getFirebaseFunction = () => {
  if (!functionsInstance && app) {
    functionsInstance = getFunctions(app, 'us-central1');

    // Use emulator in development
    if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
        console.log('✅ Connected to Firebase Functions emulator');
      } catch (error) {
        console.warn('Firebase Functions emulator already connected');
      }
    }
  }

  return functionsInstance;
};

export default getFirebaseFunction;
