// =========================================================
// LAST DECREE V5
// FIREBASE CONFIGURATION
// =========================================================
const firebaseConfig = {
  apiKey: "TON_API_",
  authDomain: "last-decree-nexus.firebaseapp.com",
  projectId: "last-decree-nexus",
  storageBucket: "last-decree-nexus.firebasestorage.app",
  messagingSenderId: "1066727269269",
  appId: "1:1066727269269:web:7eedf0e59629ae1ef20c9c",
  measurementId: "G-DFL8R597PC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
