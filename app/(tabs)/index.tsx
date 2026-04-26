import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { useWaybills } from '../WaybillContext';

export default function HomeScreen() {
  const { mileage, toggleModal, setIsMilModalVisible, milFade, milScale, setIsRepModalVisible, repFade, repScale } = useWaybills();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) setUserData(userDoc.data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    // Выводим Alert мгновенно для проверки отклика кнопки
    Alert.alert(
      "Выход",
      "Завершить рабочую смену?",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Выйти", 
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              console.log("Успешный выход");
            } catch (err) {
              Alert.alert("Ошибка", "Не удалось выйти");
            }
          }
        }
      ]
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#1A1A1A" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerBranding}>ВЕКТОР</Text>
        <Text style={styles.headerTitle}>Личный кабинет</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileCard}>
          <Image source={require('@/assets/images/dino_scientist.png')} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData?.fullName || 'Инструктор'}</Text>
            <Text style={styles.userRole}>Нижний Новгород</Text>
          </View>
          
          {/* Кнопка выхода с увеличенной зоной нажатия */}
          <TouchableOpacity 
            onPress={handleLogout} 
            style={styles.logoutButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="log-out-outline" size={26} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Секция Автомобиля */}
        <View style={styles.carDisplay}>
          <Image source={require('@/assets/images/car_bg.jpg')} style={styles.carImg} />
          <View style={styles.plateOverlap}>
            <ImageBackground source={require('@/assets/images/plate_bg.png')} style={styles.plateBg} imageStyle={{borderRadius: 4}}>
              <Text style={styles.plateMain}>{userData?.plate?.split(' ').slice(0,2).join(' ') || 'А 000 АА'}</Text>
              <Text style={styles.plateRegion}>{userData?.plate?.split(' ')[2] || '152'}</Text>
            </ImageBackground>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.mileageBox}>
            <View>
              <Text style={styles.milValue}>{mileage.toLocaleString()} км</Text>
              <Text style={styles.milLabel}>{userData?.car || 'Автошкола Вектор'}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => toggleModal(setIsMilModalVisible, milFade, milScale, true)}>
              <Ionicons name="speedometer-outline" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.warnBtn} onPress={() => toggleModal(setIsRepModalVisible, repFade, repScale, true)}>
          <Ionicons name="alert-circle" size={20} color="#FFF" />
          <Text style={styles.warnText}>Сообщить о неисправности</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBranding: { fontWeight: '900', fontSize: 20, color: '#1A1A1A' },
  headerTitle: { color: '#888', fontWeight: '600' },
  scroll: { padding: 20 },
  profileCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 15 },
  profileInfo: { flex: 1, marginLeft: 15 },
  userName: { fontWeight: '800', fontSize: 17 },
  userRole: { color: '#007AFF', fontSize: 12, fontWeight: '700' },
  logoutButton: { padding: 5 },
  carDisplay: { height: 200, marginVertical: 20, borderRadius: 25, overflow: 'visible' },
  carImg: { width: '100%', height: '100%', borderRadius: 25 },
  plateOverlap: { position: 'absolute', bottom: -15, alignSelf: 'center' },
  plateBg: { width: 140, height: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingLeft: 5 },
  plateMain: { fontWeight: '800', fontSize: 18, letterSpacing: 1 },
  plateRegion: { fontWeight: '800', fontSize: 14, marginLeft: 8 },
  stats: { backgroundColor: '#FFF', borderRadius: 20, padding: 15 },
  mileageBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  milValue: { fontSize: 24, fontWeight: '900' },
  milLabel: { color: '#888', fontSize: 13 },
  editBtn: { backgroundColor: '#F0F0F0', padding: 12, borderRadius: 12 },
  warnBtn: { backgroundColor: '#FF3B30', marginTop: 15, padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  warnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});