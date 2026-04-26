import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import 'react-native-reanimated';

// Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { WaybillProvider, useWaybills } from './WaybillContext';

// --- ГЛОБАЛЬНЫЕ МОДАЛЬНЫЕ ОКНА (ВНУТРИ ФАЙЛА) ---
const GlobalModals = () => {
  const { 
    setMileage, reportText, setReportText,
    isMilModalVisible, milFade, milScale, isRepModalVisible, repFade, repScale, toggleModal,
    setIsMilModalVisible, setIsRepModalVisible
  } = useWaybills();
  
  const [milInput, setMilInput] = useState('');

  return (
    <>
      {isMilModalVisible && (
        <Animated.View style={[styles.modalOverlay, { opacity: milFade }]}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => toggleModal(setIsMilModalVisible, milFade, milScale, false)} 
          />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoiding}>
            <Animated.View style={[styles.modalContent, { transform: [{ scale: milScale }] }]}>
              <Text style={styles.modalTitle}>Обновить пробег</Text>
              <TextInput
                style={styles.input}
                placeholder="Пробег..."
                keyboardType="numeric"
                value={milInput}
                onChangeText={setMilInput}
                autoFocus
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => toggleModal(setIsMilModalVisible, milFade, milScale, false)}>
                  <Text style={styles.cancelBtnText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveBtn} 
                  onPress={() => {
                    if (milInput) setMileage(parseInt(milInput));
                    toggleModal(setIsMilModalVisible, milFade, milScale, false);
                    setMilInput('');
                  }}
                >
                  <Text style={styles.saveBtnText}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {isRepModalVisible && (
        <Animated.View style={[styles.modalOverlay, { opacity: repFade }]}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => toggleModal(setIsRepModalVisible, repFade, repScale, false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoiding}>
            <Animated.View style={[styles.modalContent, { transform: [{ scale: repScale }] }]}>
              <Text style={styles.modalTitle}>Неисправность</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                placeholder="Опишите проблему..."
                multiline
                value={reportText}
                onChangeText={setReportText}
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => toggleModal(setIsRepModalVisible, repFade, repScale, false)}>
                  <Text style={styles.cancelBtnText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveBtn} 
                  onPress={() => {
                    Alert.alert("Отправлено", "Заявка принята");
                    toggleModal(setIsRepModalVisible, repFade, repScale, false);
                    setReportText('');
                  }}
                >
                  <Text style={styles.saveBtnText}>Отправить</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </>
  );
};

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // 1. Слушаем Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 2. АВТОМАТИЧЕСКАЯ НАВИГАЦИЯ (РЕШАЕТ ПРОБЛЕМУ ВЫХОДА)
  useEffect(() => {
    if (loading) return;

    // Проверяем, находится ли пользователь во вкладках
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && inTabsGroup) {
      // Если вышел, но все еще во вкладках — принудительно на логин
      router.replace('/login');
    } else if (user && segments[0] === 'login') {
      // Если вошел, но на странице логина — принудительно на главную
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A1A1A" />
        <Text style={styles.loadingText}>Загрузка ВЕКТОР...</Text>
      </View>
    );
  }

  return (
    <WaybillProvider>
      {/* Ключ key гарантирует полную перерисовку при смене статуса */}
      <Stack key={user ? 'auth' : 'guest'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" options={{ presentation: 'modal' }} />
      </Stack>
      
      <StatusBar style="dark" />
      {user && <GlobalModals />}
    </WaybillProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { marginTop: 15, color: '#888', fontWeight: '600' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  keyboardAvoiding: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { color: '#1A1A1A', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#F8F9FB', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 14 },
  cancelBtnText: { color: '#888', fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: '#0075FF', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700' }
});