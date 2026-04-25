import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Импорт роутера
import React, { useState } from 'react';
import {
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function MainDashboard() {
  const router = useRouter(); // Инициализация

  const announcements = [
    { id: 1, title: 'Обновление маршрутов', text: 'С 1 мая меняется схема движения на учебном маршруте №3 (Автозавод).', type: 'info' },
    { id: 2, title: 'Важно: Сдача отчетов', text: 'Просьба сдать оригиналы путевых листов за апрель до 28 числа.', type: 'urgent' },
  ];

  const MY_ID = 'user_me';

  // Синхронизировали ID с тестовыми чатами (3, 4, 5)
  const COLLEAGUES = [
    { 
      id: '3', 
      name: 'Колесников А.', 
      schedule: 'Завтра: 08:00, Сормово', 
      avatar: require('@/assets/images/user1.jpg') // Подключаем картинку
    },
    { 
      id: '4', 
      name: 'Иванов С.', 
      schedule: 'Завтра: 10:00, Автозавод', 
      avatar: require('@/assets/images/user2.jpg') 
    },
    { 
      id: '5', 
      name: 'Смирнов В.', 
      schedule: 'Завтра: Выходной', 
      avatar: null // У этого пользователя нет фото, сработает заглушка
    },
  ];

  const [coneHolderId, setConeHolderId] = useState('set_up'); 
  const [isTransferModalVisible, setTransferModalVisible] = useState(false);

  const takeCones = () => setConeHolderId(MY_ID);
  const setUpCones = () => setConeHolderId('set_up');
  const passToColleague = (colleagueId: string) => {
    setConeHolderId(colleagueId);
    setTransferModalVisible(false);
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
          <TouchableOpacity style={styles.coneButtonPrimary} onPress={takeCones}>
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
            <TouchableOpacity style={styles.coneButtonPrimary} onPress={setUpCones}>
              <Text style={styles.coneButtonText}>Выставил конуса</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.coneButtonSecondary} onPress={() => setTransferModalVisible(true)}>
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
          <TouchableOpacity style={styles.coneButtonPrimary} onPress={takeCones}>
            <Text style={styles.coneButtonText}>Заберу конуса</Text>
          </TouchableOpacity>
          {/* Переход в чат с держателем конусов */}
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
      <View style={styles.header}>
        <Text style={styles.headerBranding}>ВЕКТОР</Text>
        <Text style={styles.headerTitle}>Главная</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileBar}>
          <Image source={require('@/assets/images/dino_scientist.png')} style={styles.profileBarAvatar} />
          <View style={styles.profileBarInfo}>
            <Text style={styles.profileBarName}>Хадиуллин Д. Н.</Text>
            <Text style={styles.profileBarRole}>ИНСТРУКТОР</Text>
          </View>
        </View>

       

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Объявления</Text>
          <TouchableOpacity><Text style={styles.allLink}>Все</Text></TouchableOpacity>
        </View>
        <View style={styles.announcementsList}>
          {announcements.map((item) => (
            <View key={item.id} style={[styles.announcementCard, item.type === 'urgent' && styles.urgentCard]}>
              <View style={styles.announcementHeader}>
                <Ionicons name={item.type === 'urgent' ? "alert-circle" : "information-circle"} size={20} color={item.type === 'urgent' ? "#FF3B30" : "#007AFF"} />
                <Text style={[styles.announcementTitle, item.type === 'urgent' && styles.urgentText]}>{item.title}</Text>
              </View>
              <Text style={styles.announcementBody}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Логистика конусов</Text>
        </View>
        
        {renderConeUI()}

      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isTransferModalVisible}
        onRequestClose={() => setTransferModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalDragIndicator} />
            <Text style={styles.modalTitle}>Передать конуса</Text>
            <Text style={styles.modalSubtitle}>Выберите инструктора из списка</Text>
            
            <ScrollView style={styles.colleagueList}>
              {COLLEAGUES.map((colleague) => (
                <View key={colleague.id} style={styles.colleagueItem}>
                  <TouchableOpacity 
                    style={styles.colleagueMainAction}
                    onPress={() => passToColleague(colleague.id)}
                  >
                    {/* Если есть аватарка — показываем фото, если нет — стандартную иконку */}
{colleague.avatar ? (
  <Image 
    source={colleague.avatar} 
    style={styles.colleagueAvatarImage} 
  />
) : (
  <View style={styles.colleagueIcon}>
    <Ionicons name="person-outline" size={20} color="#1A1A1A" />
  </View>
)}
                    <View style={styles.colleagueInfo}>
                      <Text style={styles.colleagueName}>{colleague.name}</Text>
                      <Text style={[styles.colleagueSchedule, colleague.schedule.includes('Выходной') && { color: '#F44336' }]}>
                        {colleague.schedule}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Кнопка связи в модалке тоже ведет в чат */}
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => {
                      setTransferModalVisible(false); // Закрываем модалку перед переходом
                      router.push({ pathname: "/chat/[id]", params: { id: colleague.id, name: colleague.name, isGroup: 'false' } });
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={22} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setTransferModalVisible(false)}>
              <Text style={styles.modalCancelText}>Отмена</Text>
            </TouchableOpacity>
          </View>
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

  carSection: { alignItems: 'center', marginTop: 5, marginBottom: 15 },
  carCard: { width: '100%', height: 200, backgroundColor: '#FFFFFF', borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 5, overflow: 'visible' },
  carFullPhoto: { width: '100%', height: '100%', borderRadius: 24 },
  plateImageBg: { position: 'absolute', bottom: -22, alignSelf: 'center', width: 200, height: 44, justifyContent: 'center', alignItems: 'center', zIndex: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  plateImageStyle: { borderRadius: 6, resizeMode: 'stretch' },
  plateContent: { flexDirection: 'row', alignItems: 'center', paddingRight: 5 },
  plateText: { color: '#1A1A1A', fontSize: 30, fontWeight: '800', letterSpacing: 0.5 },
  regionContainer: { marginLeft: 15, alignItems: 'center', justifyContent: 'center' },
  plateRegion: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', lineHeight: 20, top: -3 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingHorizontal: 5 },
  sectionTitle: { color: '#1A1A1A', fontSize: 18, fontWeight: '800' },
  allLink: { color: '#007AFF', fontSize: 14, fontWeight: '600' },

  announcementsList: { gap: 10 },
  announcementCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  urgentCard: { borderLeftColor: '#FF3B30' },
  announcementHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  announcementTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  urgentText: { color: '#FF3B30' },
  announcementBody: { fontSize: 13, color: '#666', lineHeight: 18 },

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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40, maxHeight: '80%' },
  modalDragIndicator: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  colleagueList: { marginBottom: 20 },
  colleagueItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  colleagueMainAction: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  colleagueIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8F9FB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  colleagueInfo: { flex: 1 },
  colleagueName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  colleagueSchedule: { fontSize: 12, color: '#888', marginTop: 3 },
  contactButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EBF5FF', justifyContent: 'center', alignItems: 'center' },
  modalCancelButton: { backgroundColor: '#F8F9FB', borderRadius: 16, padding: 16, alignItems: 'center' },
  modalCancelText: { color: '#1A1A1A', fontSize: 16, fontWeight: '700' },
  colleagueAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 12, // Скругление как у иконки
    marginRight: 15,
  },
});