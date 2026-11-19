/**
 * InSite - Firebase Configuration
 *
 * This file initializes the Firebase app and exports auth/db references.
 * Uses Firebase compat libraries loaded via CDN <script> tags.
 *
 * Required CDN scripts (load BEFORE this file):
 *   https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js
 *   https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js
 *   https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (idempotent)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Persist auth state across browser sessions
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Export globally for use by other scripts
window.firebaseAuth = auth;
window.firebaseDB = db;
