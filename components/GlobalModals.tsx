import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useWaybills } from '../app/WaybillContext';

export const GlobalModals = () => {
  const { 
    handleSaveMileage, handleSendReport, reportText, setReportText,
    canFixSelf, setCanFixSelf, // Новые поля
    isMilModalVisible, milFade, milScale, isRepModalVisible, repFade, repScale, toggleModal,
    setIsMilModalVisible, setIsRepModalVisible
  } = useWaybills();
  
  const [milInput, setMilInput] = useState('');

  return (
    <>
      {/* МОДАЛКА ПРОБЕГА */}
      {isMilModalVisible && (
        <Animated.View style={[styles.modalOverlay, { opacity: milFade }]}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => toggleModal(setIsMilModalVisible, milFade, milScale, false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoiding}>
            <Animated.View style={[styles.modalContent, { transform: [{ scale: milScale }] }]}>
              <View style={styles.modalHeader}>
                <Ionicons name="speedometer-outline" size={24} color="#0075FF" />
                <Text style={styles.modalTitle}>Обновить пробег</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Введите текущий пробег"
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
                  onPress={async () => {
                    if (milInput) {
                      const success = await handleSaveMileage(parseInt(milInput));
                      if (success) {
                        toggleModal(setIsMilModalVisible, milFade, milScale, false);
                        setMilInput('');
                      }
                    }
                  }}
                >
                  <Text style={styles.saveBtnText}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {/* МОДАЛКА НЕИСПРАВНОСТИ */}
      {isRepModalVisible && (
        <Animated.View style={[styles.modalOverlay, { opacity: repFade }]}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => toggleModal(setIsRepModalVisible, repFade, repScale, false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoiding}>
            <Animated.View style={[styles.modalContent, { transform: [{ scale: repScale }] }]}>
              <View style={styles.modalHeader}>
                <Ionicons name="alert-circle-outline" size={24} color="#FF3B30" />
                <Text style={styles.modalTitle}>Неисправность</Text>
              </View>
              
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Опишите проблему подробно..."
                multiline
                value={reportText}
                onChangeText={setReportText}
              />

              {/* ГАЛОЧКА САМОСТОЯТЕЛЬНОГО РЕМОНТА */}
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setCanFixSelf(!canFixSelf)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={canFixSelf ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={canFixSelf ? "#4CD964" : "#CCC"} 
                />
                <Text style={styles.checkboxLabel}>Могу починить самостоятельно</Text>
              </TouchableOpacity>

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => toggleModal(setIsRepModalVisible, repFade, repScale, false)}>
                  <Text style={styles.cancelBtnText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveBtnRed} 
                  onPress={async () => {
                    if (reportText.trim()) {
                      const success = await handleSendReport(reportText);
                      if (success) {
                        Alert.alert("Отправлено", "Заявка принята в работу");
                        toggleModal(setIsRepModalVisible, repFade, repScale, false);
                        setReportText('');
                      }
                    }
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

const styles = StyleSheet.create({
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  keyboardAvoiding: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  modalTitle: { color: '#1A1A1A', fontSize: 20, fontWeight: '800' },
  input: { width: '100%', backgroundColor: '#F8F9FB', borderRadius: 16, padding: 16, marginBottom: 15, fontSize: 16, borderColors: '#EEE', borderWidth: 1 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, paddingLeft: 5 },
  checkboxLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 14 },
  cancelBtnText: { color: '#888', fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: '#0075FF', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnRed: { flex: 1, backgroundColor: '#FF3B30', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700' }
});