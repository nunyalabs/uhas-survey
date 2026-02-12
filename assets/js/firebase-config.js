// Firebase configuration for UHAS Study
const firebaseConfig = {
  apiKey: "REDACTED_API_KEY", // Placeholder
  authDomain: "health-45db2.firebaseapp.com",
  projectId: "health-45db2",
  storageBucket: "health-45db2.appspot.com",
  messagingSenderId: "952946475862", // Placeholder
  appId: "1:952946475862:web:70f90e3e7f96407c728cf7" // Placeholder
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Auth instance
const auth = firebase.auth();

// Firestore instance (use firestoreDb to avoid conflict with IndexedDB db)
const firestoreDb = firebase.firestore();

// Enable offline persistence with new cache API (no more warnings)
try {
  // Offline persistence is now configured in Firestore settings
  // No need to call enablePersistence() separately
} catch (err) {
  console.warn('Firestore initialization:', err);
}

// Storage instance
const storage = firebase.storage();
