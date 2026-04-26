import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Подключаем наш сервис и профиль
import { useAuth } from '../../contexts/AuthContext';
import { deleteChat, subscribeToUserChats } from '../../services/dbService';

export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Состояния для контекстного меню
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    // Защита: если пользователя нет, ничего не делаем
    if (!user) return;

    // Подписываемся на обновления чатов
    const unsubscribe = subscribeToUserChats(user.uid, (fetchedChats) => {
      setChats(fetchedChats);
      setLoading(false);
    });

    // Отписываемся, когда уходим с экрана
    return () => unsubscribe();
  }, [user]);

  // Обработчик долгого нажатия
  const handleLongPress = (chatId: string) => {
    setSelectedChatId(chatId);
    setMenuVisible(true);
  };

  // Обработчик удаления
  const handleDeleteChat = () => {
    if (!selectedChatId) return;
    
    Alert.alert(
      "Удалить чат?",
      "Вы уверены, что хотите безвозвратно удалить эту переписку?",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Удалить", 
          style: "destructive", 
          onPress: async () => {
            const success = await deleteChat(selectedChatId);
            if (success) {
              setMenuVisible(false);
              setSelectedChatId(null);
            } else {
              Alert.alert("Ошибка", "Не удалось удалить чат");
            }
          } 
        }
      ]
    );
  };

  // Как выглядит один чат в списке
  const renderChatItem = ({ item }: { item: any }) => {
    // 1. Пытаемся достать персональное имя из объекта chatNames
    // 2. Если объекта нет (старые чаты), берем старое chatName
    // 3. Если вообще ничего нет, пишем "Чат"
    const chatTitle = item.chatNames?.[user.uid] || item.chatName || "Чат";
    
    let timeString = "";
    if (item.updatedAt?.toDate) {
      timeString = item.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
      <TouchableOpacity 
        style={styles.chatCard} 
        onPress={() => router.push({
          pathname: `/chat/${item.id}`,
          // ПЕРЕДАЕМ ПЕРСОНАЛИЗИРОВАННОЕ ИМЯ В РОУТЕР
          params: { chatName: chatTitle } 
        })}
        onLongPress={() => handleLongPress(item.id)}
        delayLongPress={300}
      >
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="chatbubbles-outline" size={24} color="#0075FF" />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            {/* ОТОБРАЖАЕМ ПЕРСОНАЛИЗИРОВАННОЕ ИМЯ */}
            <Text style={styles.chatName} numberOfLines={1}>{chatTitle}</Text>
            <Text style={styles.chatTime}>{timeString}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage || "Нет сообщений"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Сообщения</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0075FF" />
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={60} color="#E5E7EB" />
          <Text style={styles.emptyText}>У вас пока нет активных диалогов</Text>
        </View>
      ) : (
        <FlatList
  data={chats}
  renderItem={renderChatItem}
  // Добавь этот стиль, чтобы контент можно было прокрутить выше меню
  contentContainerStyle={{ 
    paddingHorizontal: 20, 
    paddingBottom: 120 // 120px достаточно, чтобы всё было видно над овалом
  }}
  showsVerticalScrollIndicator={false}
/>
      )}

      {/* КРУГЛАЯ КНОПКА "НОВЫЙ ЧАТ" ПО ЦЕНТРУ */}
      <TouchableOpacity 
        style={styles.fabCenter} 
        onPress={() => router.push('/chat/new')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={35} color="#FFF" />
      </TouchableOpacity>

      {/* КОНТЕКСТНОЕ МЕНЮ (МОДАЛКА) */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)} // Закрываем при клике мимо
        >
          {/* Останавливаем всплытие клика, чтобы нажатие на само меню не закрывало его */}
          <TouchableOpacity activeOpacity={1} style={styles.contextMenu}>
            
            {/* Пустышка: Добавить в папку */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => { Alert.alert("В разработке", "Функция папок"); setMenuVisible(false); }}
            >
              <Text style={styles.menuText}>Добавить в папку</Text>
              <Ionicons name="folder-open-outline" size={22} color="#1A1A1A" />
            </TouchableOpacity>
            
            <View style={styles.divider} />

            {/* Пустышка: Закрепить */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => { Alert.alert("В разработке", "Функция закрепления чата"); setMenuVisible(false); }}
            >
              <Text style={styles.menuText}>Закрепить</Text>
              <Ionicons name="pin-outline" size={22} color="#1A1A1A" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Пустышка: Отметить непрочитанным */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => { Alert.alert("В разработке", "Отметка сообщений"); setMenuVisible(false); }}
            >
              <Text style={styles.menuText}>Отметить непрочитанным</Text>
              <Ionicons name="chatbubble-outline" size={22} color="#1A1A1A" />
            </TouchableOpacity>
            
            <View style={styles.divider} />

            {/* Пустышка: Отключить уведомления */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => { Alert.alert("В разработке", "Отключение уведомлений"); setMenuVisible(false); }}
            >
              <Text style={styles.menuText}>Отключить уведомления</Text>
              <Ionicons name="notifications-off-outline" size={22} color="#1A1A1A" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Рабочая кнопка удаления */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleDeleteChat}
            >
              <Text style={styles.menuTextRed}>Удалить чат</Text>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, paddingTop: 10, backgroundColor: '#F5F7FA' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 15, fontSize: 16, color: '#888', textAlign: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 160 }, // Увеличен отступ снизу из-за кнопки
  chatCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 12, 
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 
  },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  chatInfo: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  chatName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 10 },
  chatTime: { fontSize: 12, color: '#888', fontWeight: '500' },
  lastMessage: { fontSize: 14, color: '#666', lineHeight: 20 },
  
  fabCenter: {
    position: 'absolute',
    bottom: 125,              
    alignSelf: 'center',      
    width: 64,                
    height: 64,
    borderRadius: 32,         
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },

  // СТИЛИ КОНТЕКСТНОГО МЕНЮ (MODAL)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Полупрозрачный темный фон
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contextMenu: {
    width: 280,
    backgroundColor: '#FFF', // Светлая тема как в остальном приложении
    borderRadius: 16,
    overflow: 'hidden', 
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  menuTextRed: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 15,
  }
});