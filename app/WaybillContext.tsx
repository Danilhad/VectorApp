import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Animated } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { createMalfunctionReport, updateUserMileage } from '../services/dbService';

export const WaybillContext = createContext<any>(null);

export const WaybillProvider = ({ children }: { children: React.ReactNode }) => {
  // Подключаем данные пользователя
  const { user, userData } = useAuth();

  // Локальный стейт пробега (при старте берем из профиля, если есть)
  const [mileage, setMileage] = useState(0);
  const [reportText, setReportText] = useState('');

  // Если данные пользователя загрузились и там есть пробег — ставим его
  useEffect(() => {
    if (userData?.mileage) {
      setMileage(userData.mileage);
    }
  }, [userData]);


  
  // --- ФУНКЦИИ ДЛЯ РАБОТЫ С FIREBASE ---

  // Сохранить новый пробег
  const handleSaveMileage = async (newVal: number) => {
    if (!user) return false;
    try {
      await updateUserMileage(user.uid, newVal); // Отправляем в облако
      setMileage(newVal); // Обновляем на экране

      // === ЗАПУСКАЕМ УВЕДОМЛЕНИЕ ===
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "ВЕКТОР: Успешно ✅",
          body: `Текущий пробег обновлен: ${newVal} км. Данные отправлены диспетчеру.`,
          sound: 'default', // Стандартный звук iOS
        },
        trigger: null, // null означает "показать прямо сейчас"
      });
      // =============================

      return true;
    } catch (error) {
      console.error("Ошибка при сохранении пробега:", error);
      Alert.alert("Ошибка", "Не удалось сохранить пробег в базу данных.");
      return false;
    }
  };

 // Отправить отчет о поломке
  const [canFixSelf, setCanFixSelf] = useState(false);

const handleSendReport = async (text: string) => {
  if (!user || !userData) return false;
  try {
    const fullFIO = `${userData.lastName || ''} ${userData.firstName || ''} ${userData.middleName || ''}`.trim();
    
    // Передаем canFixSelf в сервис
    await createMalfunctionReport(
      user.uid, 
      fullFIO, 
      userData.car || 'Автомобиль не указан', 
      text,
      canFixSelf
    );
    setCanFixSelf(false); // Сбрасываем галочку после отправки
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

  // --- АНИМАЦИИ И УПРАВЛЕНИЕ МОДАЛКАМИ ---
  const [isMilModalVisible, setIsMilModalVisible] = useState(false);
  const [milFade] = useState(new Animated.Value(0));
  const [milScale] = useState(new Animated.Value(0.9));

  const [isRepModalVisible, setIsRepModalVisible] = useState(false);
  const [repFade] = useState(new Animated.Value(0));
  const [repScale] = useState(new Animated.Value(0.9));

  const toggleModal = (setVisible: any, fadeVal: Animated.Value, scaleVal: Animated.Value, show: boolean) => {
    if (show) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(fadeVal, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleVal, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeVal, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleVal, { toValue: 0.9, duration: 150, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }
  };

  return (
    <WaybillContext.Provider value={{
      mileage, handleSaveMileage, // Изменили это
      reportText, setReportText, handleSendReport, // И это
      isMilModalVisible, setIsMilModalVisible, milFade, milScale,
      isRepModalVisible, setIsRepModalVisible, repFade, repScale,
      canFixSelf, setCanFixSelf,
      toggleModal
    }}>
      {children}
    </WaybillContext.Provider>
  );
};

export const useWaybills = () => useContext(WaybillContext);