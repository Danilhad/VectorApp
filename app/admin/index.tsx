import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated, Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

const OFFICES = [
  "ул. Максима горького, 262",
  "ул. Белинского, 26",
  "ул. Казанское шоссе, 11",
  "ул. Коминтерна, 105",
  "ул. Родионова, 165",
  "ул. Карла Маркса, 20",
  "ул. Краснодонцев, 25"
];

// СПИСОК МАШИН
const CAR_OPTIONS = [
  "Chery Tiggo 4 PRO (МКПП)",
  "Chery Tiggo 4 PRO (АКПП)",
  "Lada Granta"
];

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('createUser');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    uid: '',
    lastName: '',
    firstName: '',
    middleName: '',
    office: OFFICES[0],
    phone: '',
    position: 'МПОВ',
    car: CAR_OPTIONS[0], // По умолчанию первая кнопка
    plate: '',
    mileage: 0
  });

  const handlePlateChange = (text: string) => {
    let cleanText = text.replace(/\s/g, '').toUpperCase();
    let formatted = '';
    for (let i = 0; i < cleanText.length; i++) {
      if (i === 1 || i === 4 || i === 6) formatted += ' ';
      formatted += cleanText[i];
    }
    setForm({ ...form, plate: formatted.substring(0, 12) });
  };

  const toggleMenu = () => {
    const toValue = isMenuOpen ? -MENU_WIDTH : 0;
    Animated.timing(slideAnim, { toValue, duration: 300, useNativeDriver: true }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCreateUser = async () => {
    if (!form.uid || !form.lastName || !form.plate) {
      Alert.alert("Ошибка", "Заполните UID, Фамилию и Госномер");
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, "users", form.uid), {
        ...form,
        lastUpdated: serverTimestamp()
      });
      Alert.alert("Успех", `Сотрудник ${form.lastName} добавлен`);
      setForm({ uid: '', lastName: '', firstName: '', middleName: '', office: OFFICES[0], phone: '', position: 'МПОВ', car: CAR_OPTIONS[0], plate: '', mileage: 0 });
    } catch (e) {
      Alert.alert("Ошибка", "Ошибка доступа к базе данных");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuIcon}>
          <Ionicons name="menu" size={30} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Админ-панель</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle-outline" size={30} color="#888" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        {activeTab === 'createUser' && (
          <View>
            <Text style={styles.sectionTitle}>Регистрация инструктора</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>UID (из Firebase Auth)</Text>
              <TextInput style={styles.input} placeholder="ID пользователя" value={form.uid} onChangeText={(v) => setForm({...form, uid: v})} />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>Фамилия</Text>
                <TextInput style={styles.input} value={form.lastName} onChangeText={(v) => setForm({...form, lastName: v})} />
              </View>
              <View style={[styles.inputGroup, {flex: 1, marginLeft: 10}]}>
                <Text style={styles.label}>Имя</Text>
                <TextInput style={styles.input} value={form.firstName} onChangeText={(v) => setForm({...form, firstName: v})} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Отчество</Text>
              <TextInput style={styles.input} value={form.middleName} onChangeText={(v) => setForm({...form, middleName: v})} />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>Телефон</Text>
                <TextInput style={styles.input} keyboardType="phone-pad" placeholder="+7..." value={form.phone} onChangeText={(v) => setForm({...form, phone: v})} />
              </View>
              <View style={[styles.inputGroup, {flex: 1, marginLeft: 10}]}>
                <Text style={styles.label}>Должность</Text>
                <TextInput style={styles.input} value={form.position} onChangeText={(v) => setForm({...form, position: v})} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Выберите офис</Text>
              <TouchableOpacity style={styles.pickerTrigger} onPress={() => setIsOfficeModalOpen(true)}>
                <Text style={styles.pickerTriggerText}>{form.office}</Text>
                <Ionicons name="location-outline" size={20} color="#0075FF" />
              </TouchableOpacity>
            </View>

            {/* ВЫБОР АВТОМОБИЛЯ (КНОПКИ) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Выберите автомобиль</Text>
              <View style={styles.carSelector}>
                {CAR_OPTIONS.map((car) => (
                  <TouchableOpacity 
                    key={car} 
                    style={[styles.carOption, form.car === car && styles.carOptionActive]}
                    onPress={() => setForm({...form, car: car})}
                  >
                    <Ionicons 
                      name={car.includes("Chery") ? "car-sport" : "car"} 
                      size={18} 
                      color={form.car === car ? "#0075FF" : "#888"} 
                    />
                    <Text style={[styles.carOptionText, form.car === car && styles.carOptionTextActive]}>
                      {car}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
               <View style={[styles.inputGroup, {flex: 1.5}]}>
                  <Text style={styles.label}>Госномер</Text>
                  <TextInput style={styles.inputPlate} placeholder="О 656 УЕ 152" value={form.plate} onChangeText={handlePlateChange} autoCapitalize="characters" />
               </View>
               <View style={[styles.inputGroup, {flex: 1, marginLeft: 10}]}>
                  <Text style={styles.label}>Нач. пробег</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={String(form.mileage)} onChangeText={(v) => setForm({...form, mileage: parseInt(v) || 0})} />
               </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateUser} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Создать сотрудника</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL & DRAWER (Остаются без изменений) */}
      <Modal visible={isOfficeModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите филиал</Text>
            {OFFICES.map((off) => (
              <TouchableOpacity key={off} style={styles.officeOption} onPress={() => { setForm({...form, office: off}); setIsOfficeModalOpen(false); }}>
                <Text style={[styles.officeOptionText, form.office === off && {color: '#0075FF', fontWeight: '800'}]}>{off}</Text>
                {form.office === off && <Ionicons name="checkmark-circle" size={20} color="#0075FF" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsOfficeModalOpen(false)}><Text style={styles.modalCloseBtnText}>Закрыть</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.drawerHeader}><Text style={styles.drawerBrand}>ВЕКТОР АДМИН</Text></View>
        <TouchableOpacity style={styles.drawerItem} onPress={() => { setActiveTab('createUser'); toggleMenu(); }}>
          <Ionicons name="person-add" size={24} color="#0075FF" /><Text style={styles.drawerItemText}>Новый инструктор</Text>
        </TouchableOpacity>
      </Animated.View>
      {isMenuOpen && <TouchableOpacity activeOpacity={1} onPress={toggleMenu} style={styles.overlay} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  menuIcon: { padding: 5 },
  topBarTitle: { fontSize: 18, fontWeight: '800' },
  mainContent: { padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 5, marginLeft: 5 },
  input: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#EEE' },
  inputPlate: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, fontSize: 18, fontWeight: '800', borderWidth: 1, borderColor: '#0075FF', color: '#1A1A1A' },
  row: { flexDirection: 'row' },
  
  // СТИЛИ ВЫБОРА МАШИНЫ
  carSelector: { gap: 8 },
  carOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#EEE', gap: 10 },
  carOptionActive: { borderColor: '#0075FF', backgroundColor: '#F0F7FF' },
  carOptionText: { fontSize: 14, fontWeight: '700', color: '#444' },
  carOptionTextActive: { color: '#0075FF' },

  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#EEE' },
  pickerTriggerText: { fontSize: 15, color: '#1A1A1A', fontWeight: '600' },
  submitBtn: { backgroundColor: '#0075FF', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, textAlign: 'center' },
  officeOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  officeOptionText: { fontSize: 15, color: '#444' },
  modalCloseBtn: { marginTop: 15, padding: 15, alignItems: 'center' },
  modalCloseBtnText: { color: '#888', fontWeight: '700' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: MENU_WIDTH, backgroundColor: '#FFF', zIndex: 1001, padding: 20 },
  drawerHeader: { paddingVertical: 30, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', marginBottom: 20 },
  drawerBrand: { fontSize: 20, fontWeight: '900' },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 15 },
  drawerItemText: { fontSize: 16, fontWeight: '700' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1000 }
});