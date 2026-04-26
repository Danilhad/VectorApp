import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    PanResponder,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function ChatsScreen() {
  const router = useRouter();
  const [isNewChatModalVisible, setNewChatModalVisible] = useState(false);

  // --- Логика Анимации и Свайпа ---
  // Начинаем с позиции SCREEN_HEIGHT (окно за пределами экрана внизу)
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Функция открытия: сначала включаем модалку, потом выкатываем окно
  const openModal = () => {
    setNewChatModalVisible(true);
    Animated.timing(panY, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  // Функция закрытия: сначала укатываем окно вниз, потом выключаем модалку
  const closeModal = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setNewChatModalVisible(false));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          closeModal();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Данные (оставляем те же)
  const chats = [
    { id: '1', name: 'Общий чат ВЕКТОР', lastMessage: 'Коллеги, на мосту пробка!', time: '10:45', unread: 3, isGroup: true, participants: 8, avatar: null },
    { id: '2', name: 'Руководитель', lastMessage: 'Путевой лист одобрен', time: 'Вчера', unread: 0, isGroup: false, avatar: require('@/assets/images/dino_scientist.png') },
    { id: '3', name: 'Колесников А.', lastMessage: 'Конуса забрал.', time: 'Вт', unread: 0, isGroup: false, avatar: null },
  ];

  const NEW_CHAT_CONTACTS = [
    { id: '2', name: 'Руководитель', role: 'Администрация', avatar: require('@/assets/images/dino_scientist.png') },
    { id: '3', name: 'Колесников А.', role: 'Инструктор', avatar: null },
    { id: '4', name: 'Иванов С.', role: 'Инструктор', avatar: null },
    { id: '6', name: 'Маша', role: 'Логистика', avatar: null },
  ];

  const handleStartChat = (contact: any) => {
    closeModal();
    setTimeout(() => {
      router.push({ 
        pathname: "/chat/[id]", 
        params: { id: contact.id, name: contact.name, isGroup: 'false', participants: 2 } 
      });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Хедер и Профиль */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBranding}>ВЕКТОР</Text>
          <Text style={styles.headerTitle}>Чаты</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileBar}>
          <Image source={require('@/assets/images/dino_scientist.png')} style={styles.profileBarAvatar} />
          <View style={styles.profileBarInfo}>
            <Text style={styles.profileBarName}>Хадиуллин Д. Н.</Text>
            <Text style={styles.profileBarRole}>ИНСТРУКТОР</Text>
          </View>
        </View>

        <View style={styles.chatList}>
          {chats.map((chat) => (
            <TouchableOpacity key={chat.id} style={styles.chatCard} onPress={() => router.push({ pathname: "/chat/[id]", params: { id: chat.id, name: chat.name, isGroup: chat.isGroup ? 'true' : 'false' } })}>
              {chat.avatar ? <Image source={chat.avatar} style={styles.avatarImage} /> : <View style={[styles.avatarPlaceholder, chat.isGroup && styles.groupAvatar]}><Ionicons name={chat.isGroup ? "people" : "person"} size={24} color={chat.isGroup ? "#007AFF" : "#888"} /></View>}
              <View style={styles.chatInfo}>
                <View style={styles.chatHeaderRow}><Text style={styles.chatName}>{chat.name}</Text><Text style={styles.chatTime}>{chat.time}</Text></View>
                <View style={styles.chatMessageRow}><Text style={styles.lastMessage} numberOfLines={1}>{chat.lastMessage}</Text>{chat.unread > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadText}>{chat.unread}</Text></View>}</View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openModal}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* МОДАЛЬНОЕ ОКНО */}
      <Modal
        transparent={true}
        visible={isNewChatModalVisible}
        onRequestClose={closeModal}
        animationType="fade" // Фон плавно проявляется
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.overlayClose} activeOpacity={1} onPress={closeModal} />
          
          <Animated.View 
            style={[
              styles.modalContent, 
              { transform: [{ translateY: panY }] } // Окно вылетает снизу вверх
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalDragIndicator} />
            <Text style={styles.modalTitle}>Новое сообщение</Text>
            <Text style={styles.modalSubtitle}>Выберите сотрудника из списка</Text>
            
            <ScrollView style={styles.contactList} showsVerticalScrollIndicator={false}>
              {NEW_CHAT_CONTACTS.map((contact) => (
                <TouchableOpacity key={contact.id} style={styles.contactItem} onPress={() => handleStartChat(contact)}>
                  {contact.avatar ? <Image source={contact.avatar} style={styles.contactAvatarImage} /> : <View style={styles.contactIcon}><Ionicons name={contact.role === 'Администрация' ? "star" : "person-outline"} size={20} color="#1A1A1A" /></View>}
                  <View style={styles.contactInfo}><Text style={styles.contactName}>{contact.name}</Text><Text style={styles.contactRole}>{contact.role}</Text></View>
                  <Ionicons name="chevron-forward" size={18} color="#CCC" />
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120, gap: 15 },
  profileBar: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  profileBarAvatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F0F0F0' },
  profileBarInfo: { marginLeft: 15, justifyContent: 'center' },
  profileBarName: { color: '#1A1A1A', fontSize: 16, fontWeight: '800' },
  profileBarRole: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  chatList: { gap: 10 },
  chatCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#F8F9FB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  groupAvatar: { backgroundColor: '#EBF5FF' },
  avatarImage: { width: 50, height: 50, borderRadius: 16, marginRight: 15, backgroundColor: '#F0F0F0' },
  chatInfo: { flex: 1 },
  chatHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  chatTime: { fontSize: 12, color: '#AAA' },
  chatMessageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { fontSize: 13, color: '#666', flex: 1, marginRight: 10 },
  unreadBadge: { backgroundColor: '#007AFF', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  fab: { position: 'absolute', bottom: 30, alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  
  // МОДАЛКА
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  overlayClose: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25, 
    paddingBottom: 50, 
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20
  },
  modalDragIndicator: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  contactItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  contactIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F8F9FB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contactAvatarImage: { width: 42, height: 42, borderRadius: 12, marginRight: 15, backgroundColor: '#F0F0F0' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  contactRole: { fontSize: 12, color: '#888', marginTop: 3 }
});