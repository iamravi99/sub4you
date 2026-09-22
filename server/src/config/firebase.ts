import admin from 'firebase-admin';
import { env } from './env.js';

let isFirebaseInitialized = false;

try {
  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY,
      }),
    });
    isFirebaseInitialized = true;
    console.log('[Firebase Admin] Initialized with Service Account credentials');
  } else {
    // If running in development without live credentials
    admin.initializeApp({
      projectId: env.FIREBASE_PROJECT_ID || 'sub4you-demo',
    });
    isFirebaseInitialized = true;
    console.warn('[Firebase Admin] Initialized in local/dev mode.');
  }
} catch (error) {
  console.warn('[Firebase Admin] Initialization note:', error);
}

export { admin, isFirebaseInitialized };
