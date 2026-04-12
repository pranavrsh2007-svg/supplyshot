import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMJUYVjmLRNfowjn18o9xKif_Fk-iNuOc",
  authDomain: "supplyshot-b2218.firebaseapp.com",
  projectId: "supplyshot-b2218",
  storageBucket: "supplyshot-b2218.firebasestorage.app",
  messagingSenderId: "754394651203",
  appId: "1:754394651203:web:b6eb997fb4401bcd9412f6"
};

// Safe initialization: re-use existing app if already initialized
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn("Firebase initialization warning:", e);
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);
