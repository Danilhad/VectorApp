import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
  
  const [patronymic, setPatronymic] = useState('I.');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerBranding}>ВЕКТОР</Text>
        <Text style={styles.headerTitle}>Технический контроль</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileSection}>
          <View style={styles.profileAvatarFrame}>
            <Image 
              source={require('@/assets/images/dino_scientist.png')} 
              style={styles.profileAvatar} 
            />
          </View>
          <View style={styles.profileFields}>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldInput}>Хадиуллин</Text>
              <Text style={styles.profileFieldLabel}>Фамилия</Text>
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldInput}>Даниил</Text>
              <Text style={styles.profileFieldLabel}>Имя</Text>
            </View>
             <View style={styles.profileField}>
              <Text style={styles.profileFieldInput}>Ниязович</Text>
              <Text style={styles.profileFieldLabel}>Отчество</Text>
            </View>
          </View>
        </View>

        <View style={styles.carSection}>
          <View style={styles.carCard}>
            <Image 
              source={require('@/assets/images/car_bg.jpg')} 
              style={styles.carBackgroundImage} 
              resizeMode="cover" 
            />
            <Image 
              source={require('@/assets/images/chery.png')} 
              style={styles.carImage} 
              resizeMode="contain" 
            />
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
  profileSection: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  profileAvatarFrame: { width: 75, height: 75, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F0F0F0', marginRight: 15 },
  profileAvatar: { width: '100%', height: '100%' },
  profileFields: { flex: 1, gap: 6 },
  profileField: { backgroundColor: '#F8F9FB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  profileFieldInput: { color: '#1A1A1A', fontSize: 14, fontWeight: '700', padding: 0 },
  profileFieldLabel: { color: '#AAA', fontSize: 9, textTransform: 'uppercase' },
  carSection: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
  carCard: { width: '100%', height: 200, backgroundColor: '#FFFFFF', borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 5, overflow: 'visible', justifyContent: 'center', alignItems: 'center' },
  carBackgroundImage: { position: 'absolute', width: '100%', height: '100%', opacity: 0.8, borderRadius: 24 },
  carImage: { width: '85%', height: '80%', zIndex: 1 },
  plateImageBg: { position: 'absolute', bottom: -22, width: 200, height: 44, justifyContent: 'center', alignItems: 'center', zIndex: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  plateImageStyle: { borderRadius: 6, resizeMode: 'stretch' },
  plateContent: { flexDirection: 'row', alignItems: 'center', paddingRight: 5 },
  plateText: { color: '#1A1A1A', fontSize: 30, fontWeight: '800', letterSpacing: 0.5 },
  regionContainer: { marginLeft: 15, alignItems: 'center', justifyContent: 'center' },
  plateRegion: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', lineHeight: 20, top: -3 },
  plateCountry: { fontSize: 7, fontWeight: '900', color: '#1A1A1A', marginTop: 0 },
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
  malfunctionButton: { backgroundColor: '#0075FF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 5, shadowColor: '#0075FF', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  malfunctionIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  malfunctionContent: { flex: 1 },
  malfunctionText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  malfunctionSubtext: { color: '#E0EFFF', fontSize: 11, marginTop: 2 },
  progressContainer: { gap: 5, marginTop: 4 },
  progressBarBg: { width: '100%', height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' },
  progressActive: { height: '100%', borderRadius: 3 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressPercent: { fontSize: 12, fontWeight: '800' },
  progressTimeLeft: { color: '#999', fontSize: 11, fontWeight: '600' }
});