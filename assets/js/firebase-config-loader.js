// Firebase Config Loader
// Fetches Firebase configuration from Firebase Hosting at runtime.
// The actual config (with API key) is hosted on Firebase, NOT in this repo.

const FIREBASE_CONFIG_URL = 'https://uhas-survey.web.app/firebase-config.json';

async function loadFirebaseConfig() {
  try {
    const resp = await fetch(FIREBASE_CONFIG_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const firebaseConfig = await resp.json();

    // Expose config for SyncService
    if (!window.CONFIG) window.CONFIG = {};
    window.CONFIG.firebase = firebaseConfig;

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Auth instance
    window.auth = firebase.auth();

    // Firestore instance (use firestoreDb to avoid conflict with IndexedDB db)
    window.firestoreDb = firebase.firestore();

    // Storage instance
    window.storage = firebase.storage();

    console.log('✅ Firebase initialized from remote config');
    return firebaseConfig;
  } catch (err) {
    console.error('❌ Failed to load Firebase config:', err);

    // Fallback: check if firebase-config.js was loaded locally (developer mode)
    if (window.CONFIG?.firebase) {
      console.warn('⚠️ Using locally loaded Firebase config (dev mode)');
      return window.CONFIG.firebase;
    }

    throw new Error('Firebase config unavailable. Check network or local config.');
  }
}

// Auto-load on script execution
window._firebaseReady = loadFirebaseConfig();
