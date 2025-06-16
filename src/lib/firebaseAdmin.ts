// src/lib/firebaseAdmin.ts
// IMPORTANT: This file is for SERVER-SIDE USE ONLY. Do NOT import it in client-side code.
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminAppInstance: App | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
// Ensure \n characters in the private key are correctly interpreted
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

if (typeof window !== 'undefined') {
  console.error(
    'FIREBASE_ADMIN_SDK_ERROR: firebaseAdmin.ts is being imported on the client side. This is a server-only module.'
  );
}

// Check if Firebase Admin SDK is already initialized
if (admin.apps.length === 0) {
  if (!projectId || !privateKey || !clientEmail) {
    console.error(
      'FIREBASE_ADMIN_SDK_INIT_ERROR: Critical Firebase Admin SDK environment variables are missing.' +
      ' Please ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are correctly set in your .env.local file.' +
      ' Private key should be the full string including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----, with \\n for newlines.'
    );
  } else {
    try {
      const credential = admin.credential.cert({ projectId, privateKey, clientEmail });
      adminAppInstance = admin.initializeApp({ credential, projectId });
      console.log('Firebase Admin SDK initialized successfully. Project ID:', adminAppInstance.options.projectId);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(
        'FIREBASE_ADMIN_SDK_INIT_ERROR: Failed to initialize Firebase Admin SDK.' +
        ' Check your Firebase credentials and project setup. Error:',
        errorMessage,
        // Log the full error object for more details if available
        e
      );
      adminAppInstance = null; // Ensure it's null on error
    }
  }
} else {
  adminAppInstance = admin.app(); // Get default app if already initialized
  console.log('Firebase Admin SDK already initialized. Project ID:', adminAppInstance.options.projectId);
}

// Conditionally initialize Firestore and Auth instances
if (adminAppInstance) {
  try {
    firestoreInstance = getFirestore(adminAppInstance);
  } catch (e) {
    console.error("FIREBASE_ADMIN_SDK_INIT_ERROR: Failed to initialize Firestore instance:", e);
    firestoreInstance = null;
  }
  try {
    authInstance = getAuth(adminAppInstance);
  } catch (e) {
    console.error("FIREBASE_ADMIN_SDK_INIT_ERROR: Failed to initialize Firebase Auth (Admin) instance:", e);
    authInstance = null;
  }
} else {
    console.warn("Firebase Admin App instance is not available; Firestore and Auth (Admin) will not be initialized.");
}


function getDb(): Firestore {
  if (!firestoreInstance) {
    console.error(
      'CRITICAL_FIREBASE_ERROR: Firestore instance is not available. ' +
      'This usually means the Firebase Admin SDK failed to initialize correctly. ' +
      'Please check server logs for FIREBASE_ADMIN_SDK_INIT_ERROR messages and verify your .env.local Firebase credentials.'
    );
    throw new Error(
      'Firestore not initialized. Check server logs for Firebase Admin SDK errors.'
    );
  }
  return firestoreInstance;
}

function getAdminAuth(): Auth {
  if (!authInstance) {
    console.error(
      'CRITICAL_FIREBASE_ERROR: Firebase Auth (Admin) instance is not available. ' +
      'This usually means the Firebase Admin SDK failed to initialize correctly. ' +
      'Please check server logs for FIREBASE_ADMIN_SDK_INIT_ERROR messages and verify your .env.local Firebase credentials.'
    );
    throw new Error(
      'Firebase Auth (Admin) not initialized. Check server logs for Firebase Admin SDK errors.'
    );
  }
  return authInstance;
}

export function isAdminSDKInitialized(): boolean {
  const isInitialized = !!adminAppInstance && !!firestoreInstance && !!authInstance;
  if (!isInitialized) {
      console.warn("isAdminSDKInitialized check: Firebase Admin SDK is not fully initialized. adminApp:", !!adminAppInstance, "firestore:", !!firestoreInstance, "auth:", !!authInstance);
  }
  return isInitialized;
}

// Export getters
export { getDb as db, getAdminAuth as adminAuth };

// Exporting adminAppInstance for potential direct use (e.g., by other Firebase Admin services if needed)
// Be cautious if using this directly, ensure it's not null.
export { adminAppInstance as adminApp };
