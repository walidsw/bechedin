import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    // Parse JSON string from env var (for production / Render deployment)
    const parsed = JSON.parse(serviceAccount);
    initializeApp({ credential: cert(parsed) });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use file-based service account (for local dev)
    initializeApp({ credential: applicationDefault() });
  } else {
    // Fallback: use project ID only (works with gcloud auth application-default login)
    initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'fine-entry-475306-b5' });
  }
}

export const adminDb = getFirestore();
