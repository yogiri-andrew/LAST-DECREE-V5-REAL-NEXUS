// =========================================================
// LAST DECREE V5
// FIREBASE CONFIGURATION
// =========================================================
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA74bLLE8U25hikqfQWRF_7ODjp0FW0bGk",
  authDomain: "last-decree-nexus.firebaseapp.com",
  databaseURL: "https://last-decree-nexus-default-rtdb.firebaseio.com",
  projectId: "last-decree-nexus",
  storageBucket: "last-decree-nexus.firebasestorage.app",
  messagingSenderId: "1066727269269",
  appId: "1:1066727269269:web:7eedf0e59629ae1ef20c9c",
  measurementId: "G-DFL8R597PC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app)
