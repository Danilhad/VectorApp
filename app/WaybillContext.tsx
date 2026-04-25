import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated, Keyboard } from 'react-native';

const WaybillContext = createContext(null);

export const WaybillProvider = ({ children }) => {
  const [waybills, setWaybills] = useState([
    { id: '1', sender: 'Хадиуллин Д.', fileName: 'Хадиуллин Д._21.04.2026', status: 'approved', uri: null, comment: '', timestamp: Date.now() },
  ]);

  const [mileage, setMileage] = useState(145302);
  const [reportText, setReportText] = useState('');
  const [canFixSelf, setCanFixSelf] = useState(false);

  // Состояния для модалок
  const [isMilModalVisible, setIsMilModalVisible] = useState(false);
  const milFade = useRef(new Animated.Value(0)).current;
  const milScale = useRef(new Animated.Value(0.9)).current;

  const [isRepModalVisible, setIsRepModalVisible] = useState(false);
  const repFade = useRef(new Animated.Value(0)).current;
  const repScale = useRef(new Animated.Value(0.9)).current;

  const toggleModal = (modalSetter, fade, scale, show) => {
    if (show) {
      modalSetter(true);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
      ]).start();
    } else {
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 200, useNativeDriver: true })
      ]).start(() => modalSetter(false));
    }
  };

  const addWaybill = (newBill) => setWaybills([{ ...newBill, timestamp: Date.now() }, ...waybills]);
  
  const updateStatus = (id, status, comment = '', newUri = null) => {
    setWaybills(prev => prev.map(bill => 
      bill.id === id ? { ...bill, status, comment, uri: newUri || bill.uri } : bill
    ));
  };

  const deleteWaybill = (id) => setWaybills(prev => prev.filter(bill => bill.id !== id));

  return (
    <WaybillContext.Provider value={{ 
      waybills, addWaybill, updateStatus, deleteWaybill,
      mileage, setMileage,
      reportText, setReportText, canFixSelf, setCanFixSelf,
      isMilModalVisible, setIsMilModalVisible, // <--- Добавили сеттер
      milFade, milScale, 
      isRepModalVisible, setIsRepModalVisible, // <--- Добавили сеттер
      repFade, repScale, toggleModal
    }}>
      {children}
    </WaybillContext.Provider>
  );
};

export const useWaybills = () => useContext(WaybillContext);