import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function initFirebaseAdmin() {
  if (getApps().length === 0) {
    // In Firebase App Hosting, Application Default Credentials are used automatically.
    // If not in a GCP environment, we would need to pass a credential,
    // but App Hosting handles this out of the box.
    // We just initialize with default config if running locally without FIREBASE_CONFIG,
    // but for local dev with real firestore we'd need a service account.
    // For now, we rely on ADC or fallback to unauthenticated for local emulator if needed.
    // To support local development securely, one might set GOOGLE_APPLICATION_CREDENTIALS.
    initializeApp();
  }
}

initFirebaseAdmin();

export const db = getFirestore();

// Audit objects carry optional fields (e.g. siteInfo.serverSoftware) that are often undefined.
// Firestore rejects undefined values unless told to skip them. settings() may only be called
// once per instance, so guard against module re-evaluation in dev.
const globalForDb = globalThis as unknown as { __makiFirestoreConfigured?: boolean };
if (!globalForDb.__makiFirestoreConfigured) {
  db.settings({ ignoreUndefinedProperties: true });
  globalForDb.__makiFirestoreConfigured = true;
}
