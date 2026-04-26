import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import { findOrCreateChat, getAllStaff } from '../../services/dbService';

export default function NewChatScreen() {
  const router = useRouter();
  const { user, userData } = useAuth();
  
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Загружаем список всех сотрудников
  useEffect(() => {
    if (!user) return;

    const fetchStaff = async () => {
      try {
        const data = await getAllStaff(user.uid);
        setStaff(data);
      } catch (error) {
        console.error("Ошибка при загрузке сотрудников:", error);
        Alert.alert("Ошибка", "не удалось загрузить список сотрудников");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [user]);

  // Логика начала чата
  const handleStartChat = async (targetUser: any) => {
    if (!user || !userData || creating) return;

    setCreating(true);
    try {
      // Подготавливаем данные текущего пользователя и собеседника
      const currentUserData = {
        uid: user.uid,
        firstName: userData.firstName || '',
        lastName: userData.lastName || ''
      };

      // Вызываем сервис поиска/создания чата
      const chatId = await findOrCreateChat(currentUserData, targetUser);
      
      // Имя, которое будет отображаться в заголовке чата для ТЕКУЩЕГО пользователя
      const displayName = `${targetUser.lastName} ${targetUser.firstName}`.trim();

      // Переходим в чат
      router.replace({
        pathname: `/chat/${chatId}`,
        params: { chatName: displayName }
      });
    } catch (error) {
      console.error("Ошибка при создании чата:", error);
      Alert.alert("Ошибка", "Не удалось создать чат");
      setCreating(false);
    }
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const fullName = `${item.lastName || ''} ${item.firstName || ''} ${item.middleName || ''}`.trim();
    const initials = item.lastName ? item.lastName[0] : '?';

    return (
      <TouchableOpacity 
        style={styles.userCard} 
        onPress={() => handleStartChat(item)}
        disabled={creating}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{fullName}</Text>
          <Text style={styles.userMeta}>
            {item.position || 'Сотрудник'} • {item.car || 'ВЕКТОР'}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#E0E0E0" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новый чат</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Контент */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0075FF" />
          <Text style={styles.loadingText}>Загрузка контактов...</Text>
        </View>
      ) : staff.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={64} color="#E5E7EB" />
          <Text style={styles.emptyText}>Другие сотрудники не найдены</Text>
        </View>
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Индикатор при создании чата */}
      {creating && (
        <View style={styles.creatingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.creatingText}>Создание диалога...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  
  listContent: { padding: 20 },
  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F8F9FB' 
  },
  avatar: { 
    width: 52, 
    height: 52, 
    borderRadius: 18, 
    backgroundColor: '#F0F7FF', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#0075FF' },
  userInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  userMeta: { fontSize: 13, color: '#888', marginTop: 3 },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 },
  loadingText: { marginTop: 10, color: '#888', fontSize: 14 },
  emptyText: { marginTop: 15, fontSize: 16, color: '#AAA', textAlign: 'center' },

  creatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  creatingText: { color: '#FFF', marginTop: 15, fontWeight: '700', fontSize: 16 }
});