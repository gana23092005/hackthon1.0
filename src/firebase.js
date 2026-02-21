// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgKp-vEvoxyL_4khRtSBIgfRUhHdt57vk",
  authDomain: "placement-pro-8106b.firebaseapp.com",
  projectId: "placement-pro-8106b",
  storageBucket: "placement-pro-8106b.firebasestorage.app",
  messagingSenderId: "636035271341",
  appId: "1:636035271341:web:0c695b131c157b6cff5424",
  measurementId: "G-5SCFJJHGQE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

