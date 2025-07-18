// Import the functions you need from the SDKs you need
import { getFirestore } from 'firebase/firestore';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASKGwUnaPLfRQ5R4TW55k52MobpAAnttw",
  authDomain: "chandrettans-meals.firebaseapp.com",
  projectId: "chandrettans-meals",
  storageBucket: "chandrettans-meals.firebasestorage.app",
  messagingSenderId: "6930601881",
  appId: "1:6930601881:web:f4ce6c05f40cd1851c2508",
  measurementId: "G-XNRPRZST6B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const db = getFirestore(app);
export { db };