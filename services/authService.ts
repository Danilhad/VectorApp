import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// Функция входа
export const loginCorporateUser = async (email: string, pass: string) => {
  const cleanEmail = email.trim();
  if (!cleanEmail || !pass) throw new Error("Введите логин и пароль");
  
  return await signInWithEmailAndPassword(auth, cleanEmail, pass);
};

// Функция выхода
export const logoutUser = async () => {
  return await signOut(auth);
};

// Функция получения данных профиля из Firestore
export const getUserProfile = async (uid: string) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};