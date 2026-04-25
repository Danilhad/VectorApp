import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView, // <--- Добавили импорт
  Platform // <--- Добавили импорт
  ,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { WaybillProvider, useWaybills } from './WaybillContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

// --- ГЛОБАЛЬНЫЕ МОДАЛЬНЫЕ ОКНА (СВЕТЛАЯ ТЕМА) ---
const GlobalModals = () => {
  const { 
    mileage, setMileage, reportText, setReportText, canFixSelf, setCanFixSelf,
    isMilModalVisible, milFade, milScale, isRepModalVisible, repFade, repScale, toggleModal,
    setIsMilModalVisible, setIsRepModalVisible
  } = useWaybills();
  
  const [milInput, setMilInput] = useState('');

  return (
    <>
      {/* ОКНО 1: ОБНОВИТЬ ПРОБЕГ */}
      {isMilModalVisible && (
        <Animated.View style={[styles.modalOverlay, { opacity: milFade }]}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => toggleModal(setIsMilModalVisible, milFade, milScale, false)} />
          
          {/* Обертка для клавиатуры */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}
            pointerEvents="box-none"
          >
            <Animated.View style={[styles.modalContent, { transform: [{ scale: milScale }] }]}>
              <Text style={styles.modalTitle}>Обновить пробег</Text>
              <TextInput
                style={styles.input}
                placeholder="Введите новый пробег..."
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={milInput}
                onChangeText={setMilInput}
                autoFocus={true}
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

      {/* ОКНО 2: СООБЩИТЬ О НЕИСПРАВНОСТИ */}
      {isRepModalVisible && (
        <Animated.View style={[styles.modalOverlay, { opacity: repFade }]}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => toggleModal(setIsRepModalVisible, repFade, repScale, false)} />
          
          {/* Обертка для клавиатуры */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}
            pointerEvents="box-none"
          >
            <Animated.View style={[styles.modalContent, { transform: [{ scale: repScale }] }]}>
              <Text style={styles.modalTitle}>Сообщить о проблеме</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Опишите неисправность (стук, чек и т.д.)..."
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={4}
                value={reportText}
                onChangeText={setReportText}
              />
              <TouchableOpacity style={styles.checkboxRow} activeOpacity={0.7} onPress={() => setCanFixSelf(!canFixSelf)}>
                <Ionicons name={canFixSelf ? "checkbox" : "square-outline"} size={24} color={canFixSelf ? "#0075FF" : "#BDC3C7"} />
                <Text style={styles.checkboxLabel}>Могу устранить самостоятельно</Text>
              </TouchableOpacity>
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => toggleModal(setIsRepModalVisible, repFade, repScale, false)}>
                  <Text style={styles.cancelBtnText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveBtn} 
                  onPress={() => {
                    Alert.alert("Отправлено", `Описание: ${reportText}\nСамостоятельно: ${canFixSelf ? 'Да' : 'Нет'}`);
                    toggleModal(setIsRepModalVisible, repFade, repScale, false);
                    setReportText('');
                    setCanFixSelf(false);
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
  const colorScheme = useColorScheme();

  return (
    <WaybillProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Модальное окно' }} />
        </Stack>
        <StatusBar style="dark" /> 
        <GlobalModals />
      </ThemeProvider>
    </WaybillProvider>
  );
}

// --- СТИЛИ ДЛЯ СВЕТЛЫХ МОДАЛОК ---
const styles = StyleSheet.create({
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  
  // Добавлен стиль для обертки клавиатуры
  keyboardAvoiding: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  
  modalContent: { width: '90%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, zIndex: 1001 },
  modalTitle: { color: '#1A1A1A', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  
  input: { width: '100%', backgroundColor: '#F8F9FB', color: '#1A1A1A', borderRadius: 16, padding: 16, fontSize: 15, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0' },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  checkboxRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 20, paddingLeft: 5 },
  checkboxLabel: { color: '#1A1A1A', fontSize: 15, marginLeft: 10, fontWeight: '500' },
  
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  
  cancelBtn: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 14 },
  cancelBtnText: { color: '#888', fontSize: 15, fontWeight: '600' },
  
  saveBtn: { flex: 1, backgroundColor: '#0075FF', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' }
});