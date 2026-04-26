import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGn-fls79yfgttDUR3caYhOYa7BXL0ly4",
  authDomain: "vectorapp-57011.firebaseapp.com",
  projectId: "vectorapp-57011",
  storageBucket: "vectorapp-57011.firebasestorage.app",
  messagingSenderId: "296923565454",
  appId: "1:296923565454:web:aa6f4303510993c02668df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Настройка для сохранения сессии на телефоне
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});