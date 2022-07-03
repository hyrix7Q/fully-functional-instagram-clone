import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDBLo-SLYuvI-YtwDzsdRNg3DG2SX3NhNg",
  authDomain: "instagram-2834e.firebaseapp.com",
  projectId: "instagram-2834e",
  storageBucket: "instagram-2834e.appspot.com",
  messagingSenderId: "758709361494",
  appId: "1:758709361494:web:e53a56d8b901a0c02154f7",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage();
