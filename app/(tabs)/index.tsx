import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useWaybills } from '../WaybillContext';

const { width } = Dimensions.get('window');

// Компонент прогресс-бара для документов
const LightProgressBar = ({ progress, activeColor, timeLeft }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressActive, { width: `${progress}%`, backgroundColor: activeColor }]} />
      </View>
      <View style={styles.progressRow}>
        <Text style={[styles.progressPercent, { color: activeColor }]}>{progress}%</Text>
        <Text style={styles.progressTimeLeft}>{timeLeft}</Text>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { 
    mileage, 
    toggleModal, 
    setIsMilModalVisible, 
    milFade, 
    milScale, 
    setIsRepModalVisible, 
    repFade, 
    repScale 
  } = useWaybills();

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка приложения */}
      <View style={styles.header}>
        <Text style={styles.headerBranding}>ВЕКТОР</Text>
        <Text style={styles.headerTitle}>Технический контроль</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Компактный блок профиля */}
        <View style={styles.profileBar}>
          <Image 
            source={require('@/assets/images/dino_scientist.png')} 
            style={styles.profileBarAvatar} 
          />
          <View style={styles.profileBarInfo}>
            <Text style={styles.profileBarName}>Хадиуллин Д. Н.</Text>
            <Text style={styles.profileBarRole}>ИНСТРУКТОР</Text>
          </View>
        </View>

        {/* Секция автомобиля (Заменена на фото) */}
        <View style={styles.carSection}>
          <View style={styles.carCard}>
            <Image 
              source={require('@/assets/images/car_bg.jpg')} 
              style={styles.carFullPhoto} 
              resizeMode="cover" 
            />
            {/* Госномер поверх фото */}
            <ImageBackground 
              source={require('@/assets/images/plate_bg.png')} 
              style={styles.plateImageBg}
              imageStyle={styles.plateImageStyle}
            >
              <View style={styles.plateContent}>
                <Text style={styles.plateText}>О 656 УЕ</Text>
                <View style={styles.regionContainer}>
                  <Text style={styles.plateRegion}>62</Text>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Карточка статистики и документов */}
        <View style={styles.statsCard}>
          <View style={styles.mileageWrapper}>
            <View style={styles.statsMileageInfo}>
              <Text style={styles.statsMileageInput}>{mileage.toLocaleString()} км</Text>
              <Text style={styles.statsMileageLabel}>Обновление каждый четверг</Text>
              <Text style={styles.statsMileageUpdated}>Последнее: Вт, 21 апреля</Text>
            </View>
            <TouchableOpacity 
              style={styles.mileageEditSquare} 
              onPress={() => toggleModal(setIsMilModalVisible, milFade, milScale, true)}
            >
              <Ionicons name="create-outline" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsDoc}>
            <Text style={styles.statsDocLabel}>ОСАГО:</Text>
            <Text style={styles.statsDocExpiry}>Истекает: 15 июня 2026</Text>
            <LightProgressBar progress={65} activeColor="#4CAF50" timeLeft="245 дней" />
          </View>

          <View style={styles.statsDoc}>
            <Text style={styles.statsDocLabel}>ТО (Диагностическая карта):</Text>
            <Text style={styles.statsDocExpiry}>Истекает: 10 декабря 2026</Text>
            <LightProgressBar progress={40} activeColor="#FF9800" timeLeft="80 дней" />
          </View>
        </View>

        {/* Кнопка сообщения о неисправности */}
        <TouchableOpacity 
          style={styles.malfunctionButton} 
          onPress={() => toggleModal(setIsRepModalVisible, repFade, repScale, true)}
        >
          <View style={styles.malfunctionIconBox}>
            <Ionicons name="build" size={20} color="#fff" />
          </View>
          <View style={styles.malfunctionContent}>
            <Text style={styles.malfunctionText}>Сообщить о неисправности</Text>
            <Text style={styles.malfunctionSubtext}>Опишите проблему руководителю</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 },
  headerBranding: { color: '#1A1A1A', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { color: '#888', fontSize: 14, fontWeight: '500' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 15 },
  
  // Компактный профиль
  profileBar: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  profileBarAvatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F0F0F0' },
  profileBarInfo: { marginLeft: 15, justifyContent: 'center' },
  profileBarName: { color: '#1A1A1A', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  profileBarRole: { color: '#888', fontSize: 12, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Стили фото автомобиля
  carSection: { alignItems: 'center', marginTop: 5, marginBottom: 20 },
  carCard: { width: '100%', height: 220, backgroundColor: '#FFFFFF', borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 5, overflow: 'visible' },
  carFullPhoto: { width: '100%', height: '100%', borderRadius: 24 },
  
  // Госномер
  plateImageBg: { position: 'absolute', bottom: -22, alignSelf: 'center', width: 150, height: 33, justifyContent: 'center', alignItems: 'center', zIndex: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  plateImageStyle: { borderRadius: 6, resizeMode: 'stretch' },
  plateContent: { flexDirection: 'row', alignItems: 'center', paddingRight: 5 },
  plateText: { color: '#1A1A1A', fontSize: 20, fontWeight: '800', letterSpacing: 0.5, right: -6 },
  regionContainer: { marginLeft: 15, alignItems: 'center', justifyContent: 'center' },
  plateRegion: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', lineHeight: 20, top: -3, right: -3 },

  // Статистика и документы
  mileageWrapper: { flexDirection: 'row', backgroundColor: '#F8F9FB', borderRadius: 16, padding: 15, alignItems: 'center', justifyContent: 'space-between' },
  statsMileageInfo: { flex: 1 },
  statsMileageInput: { color: '#1A1A1A', fontSize: 22, fontWeight: '800' },
  statsMileageLabel: { color: '#666', fontSize: 12, marginTop: 4 },
  statsMileageUpdated: { color: '#999', fontSize: 11, marginTop: 2 },
  mileageEditSquare: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  statsCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, gap: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  statsDoc: { gap: 8 },
  statsDocLabel: { color: '#1A1A1A', fontSize: 14, fontWeight: '700' },
  statsDocExpiry: { color: '#888', fontSize: 12 },
  
  // Кнопка неисправности
  malfunctionButton: { backgroundColor: '#0075FF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 5, shadowColor: '#0075FF', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  malfunctionIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  malfunctionContent: { flex: 1 },
  malfunctionText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  malfunctionSubtext: { color: '#E0EFFF', fontSize: 11, marginTop: 2 },

  // Прогресс-бары
  progressContainer: { gap: 5, marginTop: 4 },
  progressBarBg: { width: '100%', height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' },
  progressActive: { height: '100%', borderRadius: 3 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressPercent: { fontSize: 12, fontWeight: '800' },
  progressTimeLeft: { color: '#999', fontSize: 11, fontWeight: '600' }
});