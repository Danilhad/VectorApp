import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// === СТАРЫЕ ФУНКЦИИ (оставляем как есть) ===
export const updateUserMileage = async (uid: string, newMileage: number) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { mileage: newMileage, lastUpdated: serverTimestamp() });
};

export const createMalfunctionReport = async (uid: string, fullName: string, car: string, text: string, canFixSelf: boolean) => {
  const reportsRef = collection(db, "reports");
  await addDoc(reportsRef, {
    instructorId: uid,
    instructorName: fullName,
    car: car,
    description: text,
    canFixSelf: canFixSelf, // Добавили признак самостоятельного ремонта
    status: "new",
    createdAt: serverTimestamp()
  });
};

// === НОВЫЕ ФУНКЦИИ ДЛЯ ЧАТОВ ===

// 1. Подписка на список чатов пользователя (реал-тайм)
export const subscribeToUserChats = (uid: string, callback: (chats: any[]) => void) => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', uid),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(chats);
  });
};

// 2. Подписка на сообщения внутри конкретного чата
export const subscribeToMessages = (chatId: string, callback: (messages: any[]) => void) => {
  const q = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

// 3. Отправка нового сообщения
export const sendMessage = async (chatId: string, senderId: string, text: string) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const chatRef = doc(db, "chats", chatId);

  // Добавляем само сообщение
  await addDoc(messagesRef, {
    text,
    senderId,
    createdAt: serverTimestamp()
  });

  // Обновляем "последнее сообщение" и время в самом чате, чтобы он поднялся наверх в списке
  await updateDoc(chatRef, {
    lastMessage: text,
    updatedAt: serverTimestamp()
  });
};

// Получение истории заявок о неисправностях конкретного инструктора
export const getInstructorReports = (uid: string, callback: (reports: any[]) => void) => {
  const q = query(
    collection(db, 'reports'),
    where('instructorId', '==', uid),
    orderBy('createdAt', 'desc') // Самые свежие сверху
  );

  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(reports);
  });
};

export const createInstructorProfile = async (uid: string, data: any) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    ...data,
    mileage: data.mileage || 0,
    lastUpdated: serverTimestamp(),
  });
};

// 1. Получить всех сотрудников (кроме самого себя)
export const getAllStaff = async (currentUid: string) => {
  const q = query(collection(db, "users"), where("__name__", "!=", currentUid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 2. Найти существующий чат или создать новый
export const findOrCreateChat = async (
  currentUser: any, // Передаем объект текущего юзера (из useAuth)
  targetUser: any   // Передаем объект выбранного сотрудника
) => {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", currentUser.uid));
  const snapshot = await getDocs(q);
  
  const existingChat = snapshot.docs.find(doc => {
    const data = doc.data();
    return data.participants.includes(targetUser.id);
  });

  if (existingChat) return existingChat.id;

  // Формируем имена для обоих сторон
  const currentFullName = `${currentUser.lastName || ''} ${currentUser.firstName || ''}`.trim() || "Собеседник";
  const targetFullName = `${targetUser.lastName || ''} ${targetUser.firstName || ''}`.trim();

  const newChat = await addDoc(chatsRef, {
    participants: [currentUser.uid, targetUser.id],
    chatNames: {
      [currentUser.uid]: targetFullName, // Я вижу его
      [targetUser.id]: currentFullName   // Он видит меня
    },
    lastMessage: "",
    updatedAt: serverTimestamp()
  });

  return newChat.id;
  };

// Удаление чата
  export const deleteChat = async (chatId: string) => {
  try {
    await deleteDoc(doc(db, "chats", chatId));
    return true;
  } catch (error) {
    console.error("Ошибка при удалении чата:", error);
    return false;
  }
};