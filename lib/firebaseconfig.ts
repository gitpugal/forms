// lib/firebaseConfig.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
  signInWithPopup,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
// Firebase configuration object type
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyCI6AO4CqOUGcJlj7Vfuwx2zTcs1beCjXI",
  authDomain: "formflow-4934c.firebaseapp.com",
  projectId: "formflow-4934c",
  storageBucket: "formflow-4934c.appspot.com",
  messagingSenderId: "870110657055",
  appId: "1:870110657055:web:fc02e28face092a2a1f32a",
  measurementId: "G-BZWR7DWRSF",
};

// Initialize Firebase app
const app: FirebaseApp = initializeApp(firebaseConfig);

// Get authentication instance
const auth: Auth = getAuth(app);
const database = getDatabase(app);

// Create GoogleAuthProvider instance
const provider: GoogleAuthProvider = new GoogleAuthProvider();
provider.setCustomParameters({ access_type: "offline" });
provider.addScope("https://www.googleapis.com/auth/drive");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

// Export authentication-related variables
export { auth, provider, signInWithPopup, database };
