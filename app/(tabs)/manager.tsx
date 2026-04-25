import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useWaybills } from '../WaybillContext';

const { width, height } = Dimensions.get('window');

// --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ДАТ ---
const getDateHeader = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp || Date.now());
  
  const isToday = now.toDateString() === date.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

  if (isToday) return 'Сегодня';
  if (isYesterday) return 'Вчера';
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
};

export default function ManagerScreen() {
  const { waybills, updateStatus } = useWaybills();
  
  // Разделение на Новые и Историю
  const pendingBills = waybills.filter(b => b.status === 'pending');
  const historyBills = waybills.filter(b => b.status !== 'pending');

  // Группировка истории по датам
  const groupedHistory = historyBills.reduce((groups, bill) => {
    const header = getDateHeader(bill.timestamp);
    if (!groups[header]) groups[header] = [];
    groups[header].push(bill);
    return groups;
  }, {});

  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState('');
  const [zoomImage, setZoomImage] = useState(null);
  const modalFade = useRef(new Animated.Value(0)).current;

  const openRejectModal = (item) => {
    setSelectedItem(item);
    Animated.timing(modalFade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  const closeRejectModal = () => {
    Animated.timing(modalFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setSelectedItem(null);
      setComment('');
    });
  };

  const handleConfirmReject = () => {
    if (selectedItem) {
      updateStatus(selectedItem.id, 'error', comment);
      closeRejectModal();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerBranding}>ВЕКТОР</Text>
        <Text style={styles.headerTitle}>Проверка листов</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* СЕКЦИЯ: НОВЫЕ */}
        <View style={styles.sectionHeaderBox}>
          <Text style={styles.sectionLabel}>Ожидают проверки</Text>
          {pendingBills.length > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{pendingBills.length}</Text></View>
          )}
        </View>

        {pendingBills.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#E5E7EB" />
            <Text style={styles.emptyText}>Все листы проверены</Text>
          </View>
        ) : (
          pendingBills.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.sender[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.sender}</Text>
                  <Text style={styles.userDate}>{item.fileName}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.imagePreview} 
                activeOpacity={0.9} 
                onPress={() => setZoomImage(item.uri)}
              >
                {item.uri ? (
                  <Image source={{ uri: item.uri }} style={styles.fullImg} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderImg}><Ionicons name="image-outline" size={32} color="#BDC3C7" /></View>
                )}
                <View style={styles.zoomBadge}>
                  <Ionicons name="search" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => openRejectModal(item)}>
                  <Text style={styles.rejectBtnText}>Отклонить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => updateStatus(item.id, 'approved')}>
                  <Text style={styles.approveBtnText}>Принять</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* СЕКЦИЯ: ИСТОРИЯ С ГРУППИРОВКОЙ */}
        <Text style={[styles.sectionLabel, { marginTop: 20, marginBottom: 15 }]}>История проверок</Text>
        
        {Object.keys(groupedHistory).length === 0 ? (
          <Text style={[styles.emptyText, { textAlign: 'left', marginLeft: 5 }]}>История пуста</Text>
        ) : (
          Object.keys(groupedHistory).map(dateHeader => (
            <View key={dateHeader} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{dateHeader}</Text>
              
              {groupedHistory[dateHeader].map(item => (
                <View key={item.id} style={styles.historyCard}>
                  <TouchableOpacity 
                    style={styles.historyHeader} 
                    activeOpacity={0.7} 
                    onPress={() => setZoomImage(item.uri)}
                  >
                    <Ionicons 
                      name={item.status === 'approved' ? 'checkmark-circle' : 'close-circle'} 
                      size={24} 
                      color={item.status === 'approved' ? '#2E7D32' : '#C62828'} 
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.historyName}>{item.sender}</Text>
                      <Text style={styles.historyDate}>{item.fileName}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#BDC3C7" />
                  </TouchableOpacity>

                  {/* Комментарий при отклонении */}
                  {item.status === 'error' && item.comment && (
                    <View style={styles.historyCommentBox}>
                      <Ionicons name="chatbubble-ellipses-outline" size={16} color="#C62828" />
                      <Text style={styles.historyCommentText}>{item.comment}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* ПРОСМОТР ФОТО С ЗУМОМ (Темный фон для просмотра) */}
      <Modal visible={!!zoomImage} transparent={false} animationType="fade">
        <View style={styles.zoomContainer}>
          <TouchableOpacity style={styles.closeZoom} onPress={() => setZoomImage(null)}>
            <Ionicons name="close-circle" size={44} color="#FFF" />
          </TouchableOpacity>
          <ScrollView maximumZoomScale={4} minimumZoomScale={1} centerContent={true} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
            <Image source={{ uri: zoomImage }} style={styles.fullZoomImage} resizeMode="contain" />
          </ScrollView>
        </View>
      </Modal>

      {/* МОДАЛКА ОТКЛОНЕНИЯ (Светлая тема) */}
      {selectedItem && (
        <Animated.View style={[styles.modalOverlay, { opacity: modalFade }]}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeRejectModal} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Причина отклонения</Text>
            <TextInput 
              style={styles.input}
              placeholder="Укажите, что исправить..."
              placeholderTextColor="#999"
              multiline
              value={comment}
              onChangeText={setComment}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeRejectModal}>
                <Text style={styles.cancelBtnText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleConfirmReject}>
                <Text style={styles.submitBtnText}>Отправить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, marginBottom: 15 },
  headerBranding: { color: '#1A1A1A', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { color: '#888', fontSize: 14, fontWeight: '500' },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  sectionHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingLeft: 5 },
  sectionLabel: { color: '#AAA', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  badge: { backgroundColor: '#FF3B30', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  // Карточка проверки
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#1A1A1A', fontSize: 16, fontWeight: '800' },
  userName: { color: '#1A1A1A', fontSize: 16, fontWeight: '700' },
  userDate: { color: '#888', fontSize: 12, marginTop: 2 },
  
  imagePreview: { width: '100%', height: 180, backgroundColor: '#F8F9FB', borderRadius: 16, overflow: 'hidden', marginBottom: 15 },
  fullImg: { width: '100%', height: '100%' },
  placeholderImg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  zoomBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 10 },
  
  // Кнопки действий
  actionRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { backgroundColor: '#FFEBEE' },
  rejectBtnText: { color: '#C62828', fontSize: 15, fontWeight: '700' },
  approveBtn: { backgroundColor: '#E8F5E9' },
  approveBtnText: { color: '#2E7D32', fontSize: 15, fontWeight: '700' },

  // Группировка истории
  dateGroup: { marginBottom: 20 },
  dateHeader: { color: '#888', fontSize: 13, fontWeight: '700', marginBottom: 12, marginLeft: 5 },
  
  historyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, overflow: 'hidden' },
  historyHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  historyName: { color: '#1A1A1A', fontSize: 15, fontWeight: '700' },
  historyDate: { color: '#888', fontSize: 12, marginTop: 2 },
  
  historyCommentBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8F8', padding: 12, borderTopWidth: 1, borderTopColor: '#FFEBEE', gap: 8 },
  historyCommentText: { color: '#C62828', fontSize: 13, fontWeight: '500', flex: 1 },

  // Состояния
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: '#AAA', fontSize: 14, fontWeight: '500', marginTop: 10 },

  // Просмотр фото
  zoomContainer: { flex: 1, backgroundColor: '#000' },
  closeZoom: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullZoomImage: { width: width, height: height },
  
  // Модалка отклонения
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20, zIndex: 1000 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 25, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalTitle: { color: '#1A1A1A', fontSize: 18, fontWeight: '800', marginBottom: 20 },
  input: { backgroundColor: '#F8F9FB', color: '#1A1A1A', borderRadius: 16, padding: 16, height: 100, textAlignVertical: 'top', fontSize: 15, marginBottom: 20, borderWidth: 1, borderColor: '#F0F0F0' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, backgroundColor: '#F5F5F5' },
  cancelBtnText: { color: '#888', fontSize: 15, fontWeight: '600' },
  submitBtn: { flex: 1, backgroundColor: '#FF3B30', borderRadius: 14, padding: 16, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 }
});