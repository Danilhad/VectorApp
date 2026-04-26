import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { sendMessage, subscribeToMessages } from '../../services/dbService';

export default function ChatScreen() {
  const { id, chatName } = useLocalSearchParams<{ id: string, chatName?: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user || !id) return;
    const unsubscribe = subscribeToMessages(id, (fetchedMessages) => {
      setMessages(fetchedMessages);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, id]);

  const handleSend = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || !user || !id) return;
    setInputText('');
    try {
      await sendMessage(id, user.uid, trimmedText);
    } catch (error) {
      console.error("Ошибка при отправке:", error);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMyMessage = item.senderId === user?.uid;
    const timeString = item.createdAt?.toDate 
      ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "";

    return (
      <View style={[styles.messageWrapper, isMyMessage ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble]}>
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>
            {String(item.text || '')}
          </Text>
          {timeString ? (
            <Text style={[styles.timeText, isMyMessage ? styles.myTimeText : styles.theirTimeText]}>
              {timeString}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Оборачиваем ВСЁ в KeyboardAvoidingView. 
        Offset ставим в 0, так как мы сами контролируем всю площадь экрана.
      */}
      <KeyboardAvoidingView 
        style={styles.flex1} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
       keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {/* Шапка теперь без лишних отступов */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.headerProfile}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color="#0075FF" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>{chatName || "Служба поддержки"}</Text>
              <Text style={styles.headerStatus}>в сети</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#0075FF" /></View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Нижняя панель ввода */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle" size={30} color="#0075FF" />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Сообщение..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="arrow-up" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' }, // Основной фон белый для чистоты
  flex1: { flex: 1, backgroundColor: '#F8F9FB' }, // Фон чата чуть серый
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    height: 60, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  backButton: { padding: 5 },
  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' },
  headerTextContainer: { marginLeft: 10 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  headerStatus: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { padding: 15, paddingBottom: 20 },
  messageWrapper: { marginBottom: 12, flexDirection: 'row' },
  myMessageWrapper: { justifyContent: 'flex-end' },
  theirMessageWrapper: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '78%', padding: 12, borderRadius: 20 },
  myMessageBubble: { backgroundColor: '#0075FF', borderBottomRightRadius: 4 },
  theirMessageBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E8E8E8' },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: '#FFF' },
  theirMessageText: { color: '#1A1A1A' },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  myTimeText: { color: 'rgba(255,255,255,0.7)' },
  theirTimeText: { color: '#AAA' },

  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attachButton: { paddingHorizontal: 5 },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F2F3F5',
    borderRadius: 22,
    marginHorizontal: 8,
    paddingHorizontal: 15,
    minHeight: 40,
    justifyContent: 'center'
  },
  input: { 
    fontSize: 16, 
    color: '#1A1A1A', 
    maxHeight: 100, 
    paddingTop: Platform.OS === 'ios' ? 8 : 5, 
    paddingBottom: Platform.OS === 'ios' ? 8 : 5 
  },
  sendButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#0075FF', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  sendDisabled: { backgroundColor: '#E5E5E5' }
});