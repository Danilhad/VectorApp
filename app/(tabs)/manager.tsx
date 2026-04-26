import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    Modal,
    PanResponder,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useWaybills } from '../WaybillContext';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const router = useRouter();
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

  // --- ЛОГИКА КОНУСОВ ---
  const MY_ID = 'user_me';
  const COLLEAGUES = [
    { id: '3', name: 'Колесников А.', schedule: 'Завтра: 08:00, Сормово' },
    { id: '4', name: 'Иванов С.', schedule: 'Завтра: 10:00, Автозавод' },
    { id: '5', name: 'Смирнов В.', schedule: 'Завтра: Выходной' },
  ];

  const [coneHolderId, setConeHolderId] = useState('set_up'); 
  const [isTransferModalVisible, setTransferModalVisible] = useState(false);

  // --- АНИМАЦИЯ И СВАЙП (как в чатах) ---
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const openTransferModal = () => {
    setTransferModalVisible(true);
    Animated.timing(panY, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const closeTransferModal = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setTransferModalVisible(false));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          closeTransferModal();
        } else {
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const passToColleague = (colleagueId: string) => {
    setConeHolderId(colleagueId);
    closeTransferModal();
  };

  const renderConeUI = () => {
    if (coneHolderId === 'set_up') {
      return (
        <View style={styles.coneCard}>
          <View style={styles.coneInfoRow}>
            <View style={[styles.coneStatusIcon, { backgroundColor: '#E0F2F1' }]}>
              <Ionicons name="flag" size={24} color="#009688" />
            </View>
            <View style={styles.coneDetails}>
              <Text style={styles.coneStatusLabel}>Текущий статус:</Text>
              <Text style={styles.coneHolder}>Выставлены на площадке</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.coneButtonPrimary} onPress={() => setConeHolderId(MY_ID)}>
            <Text style={styles.coneButtonText}>Заберу конуса</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (coneHolderId === MY_ID) {
      return (
        <View style={styles.coneCard}>
          <View style={styles.coneInfoRow}>
            <View style={[styles.coneStatusIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="car" size={24} color="#FF9800" />
            </View>
            <View style={styles.coneDetails}>
              <Text style={styles.coneStatusLabel}>Текущий статус:</Text>
              <Text style={styles.coneHolder}>У меня в машине</Text>
            </View>
          </View>
          <View style={styles.coneActions}>
            <TouchableOpacity style={styles.coneButtonPrimary} onPress={() => setConeHolderId('set_up')}>
              <Text style={styles.coneButtonText}>Выставил конуса</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.coneButtonSecondary} onPress={openTransferModal}>
              <Ionicons name="swap-horizontal-outline" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const holderInfo = COLLEAGUES.find(c => c.id === coneHolderId);
    return (
      <View style={styles.coneCard}>
        <View style={styles.coneInfoRow}>
          <View style={[styles.coneStatusIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="person" size={24} color="#2196F3" />
          </View>
          <View style={styles.coneDetails}>
            <Text style={styles.coneStatusLabel}>Текущий статус:</Text>
            <Text style={styles.coneHolder}>У коллеги ({holderInfo?.name})</Text>
          </View>
        </View>
        <View style={styles.coneActions}>
          <TouchableOpacity style={styles.coneButtonPrimary} onPress={() => setConeHolderId(MY_ID)}>
            <Text style={styles.coneButtonText}>Заберу конуса</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.coneButtonSecondary}
            onPress={() => router.push({ pathname: "/chat/[id]", params: { id: holderInfo?.id, name: holderInfo?.name, isGroup: 'false' } })}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <Text style={styles.headerBranding}>ВЕКТОР</Text>
        <Text style={styles.headerTitle}>Главная</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Компактный профиль */}
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

        {/* Секция автомобиля */}
        <View style={styles.carSection}>
          <View style={styles.carCard}>
            <Image 
              source={require('@/assets/images/car_bg.jpg')} 
              style={styles.carFullPhoto} 
              resizeMode="cover" 
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

        {/* Логистика конусов */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Логистика конусов</Text>
        </View>
        {renderConeUI()}

        {/* Карточка статистики (Твой Техконтроль) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Технический контроль</Text>
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

        {/* Кнопка неисправности */}
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

      {/* МОДАЛЬНОЕ ОКНО ПЕРЕДАЧИ КОНУСОВ С АНИМАЦИЕЙ */}
      <Modal
        transparent={true}
        visible={isTransferModalVisible}
        onRequestClose={closeTransferModal}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.overlayClose} activeOpacity={1} onPress={closeTransferModal} />
          
          <Animated.View 
            style={[
              styles.modalContent, 
              { transform: [{ translateY: panY }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalDragIndicator} />
            <Text style={styles.modalTitle}>Передать конуса</Text>
            <Text style={styles.modalSubtitle}>Выберите инструктора из списка</Text>
            
            <ScrollView style={styles.colleagueList} showsVerticalScrollIndicator={false}>
              {COLLEAGUES.map((colleague) => (
                <View key={colleague.id} style={styles.colleagueItem}>
                  <TouchableOpacity 
                    style={styles.colleagueMainAction}
                    onPress={() => passToColleague(colleague.id)}
                  >
                    <View style={styles.colleagueIcon}>
                      <Ionicons name="person-outline" size={20} color="#1A1A1A" />
                    </View>
                    <View style={styles.colleagueInfo}>
                      <Text style={styles.colleagueName}>{colleague.name}</Text>
                      <Text style={[styles.colleagueSchedule, colleague.schedule.includes('Выходной') && { color: '#F44336' }]}>
                        {colleague.schedule}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => {
                      closeTransferModal();
                      router.push({ pathname: "/chat/[id]", params: { id: colleague.id, name: colleague.name, isGroup: 'false' } });
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={22} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.modalCancelButton} onPress={closeTransferModal}>
              <Text style={styles.modalCancelText}>Отмена</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 },
  headerBranding: { color: '#1A1A1A', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { color: '#888', fontSize: 14, fontWeight: '500' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 15 },
  
  profileBar: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  profileBarAvatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F0F0F0' },
  profileBarInfo: { marginLeft: 15, justifyContent: 'center' },
  profileBarName: { color: '#1A1A1A', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  profileBarRole: { color: '#888', fontSize: 12, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  carSection: { alignItems: 'center', marginTop: 5, marginBottom: 20 },
  carCard: { width: '100%', height: 220, backgroundColor: '#FFFFFF', borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 5, overflow: 'visible' },
  carFullPhoto: { width: '100%', height: '100%', borderRadius: 24 },
  
  plateImageBg: { position: 'absolute', bottom: -22, alignSelf: 'center', width: 150, height: 33, justifyContent: 'center', alignItems: 'center', zIndex: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  plateImageStyle: { borderRadius: 6, resizeMode: 'stretch' },
  plateContent: { flexDirection: 'row', alignItems: 'center', paddingRight: 5 },
  plateText: { color: '#1A1A1A', fontSize: 20, fontWeight: '800', letterSpacing: 0.5, right: -6 },
  regionContainer: { marginLeft: 15, alignItems: 'center', justifyContent: 'center' },
  plateRegion: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', lineHeight: 20, top: -3, right: -3 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingHorizontal: 5 },
  sectionTitle: { color: '#1A1A1A', fontSize: 18, fontWeight: '800' },

  // Конуса
  coneCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  coneInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  coneStatusIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  coneDetails: { marginLeft: 15 },
  coneStatusLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  coneHolder: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginTop: 2 },
  coneActions: { flexDirection: 'row', gap: 10 },
  coneButtonPrimary: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  coneButtonSecondary: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#F8F9FB', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  coneButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  statsCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, gap: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  mileageWrapper: { flexDirection: 'row', backgroundColor: '#F8F9FB', borderRadius: 16, padding: 15, alignItems: 'center', justifyContent: 'space-between' },
  statsMileageInfo: { flex: 1 },
  statsMileageInput: { color: '#1A1A1A', fontSize: 22, fontWeight: '800' },
  statsMileageLabel: { color: '#666', fontSize: 12, marginTop: 4 },
  statsMileageUpdated: { color: '#999', fontSize: 11, marginTop: 2 },
  mileageEditSquare: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
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
  progressTimeLeft: { color: '#999', fontSize: 11, fontWeight: '600' },

  // МОДАЛКА
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  overlayClose: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50, maxHeight: '85%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
  modalDragIndicator: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  colleagueItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  colleagueMainAction: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  colleagueIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F8F9FB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  colleagueInfo: { flex: 1 },
  colleagueName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  colleagueSchedule: { fontSize: 12, color: '#888', marginTop: 3 },
  contactButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EBF5FF', justifyContent: 'center', alignItems: 'center' },
  modalCancelButton: { backgroundColor: '#F8F9FB', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 10 },
  modalCancelText: { color: '#1A1A1A', fontSize: 16, fontWeight: '700' }
});