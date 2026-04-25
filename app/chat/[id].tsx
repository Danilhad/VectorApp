import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// "База данных" сообщений
const mockDatabase: Record<string, any[]> = {
  '1': [
    { id: '1', text: 'Коллеги, кто сегодня забирает конуса?', time: '08:00', isMe: false, sender: 'Иванов С.' },
    { id: '2', text: 'Я заберу, начинаю пораньше сегодня.', time: '08:05', isMe: true },
  ],
  '2': [
    { id: '1', text: 'Даниил, проверьте путевой лист от 24.04. Там ошибка в пробеге.', time: '09:00', isMe: false },
  ],
  '3': [
    { id: '1', text: 'Даня, привет! Хотел конуса перехватить у тебя в городе, если будешь рядом.', time: '10:10', isMe: false },
  ]
};

// Словарь аватарок: привязываем картинки к ID чата/пользователя
const AVATARS: Record<string, any> = {
  '2': require('@/assets/images/dino_scientist.png'),
  '3': require('@/assets/images/user1.jpg'), // Раскомментируй, когда добавишь фото для Колесникова
  '4': require('@/assets/images/user2.jpg'), // Для Иванова
};

export default function ChatWindow() {
  const { id, name, isGroup, participants } = useLocalSearchParams();
  const router = useRouter();
  
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState(mockDatabase[id as string] || []);
  const scrollViewRef = useRef<ScrollView>(null);

  const isGroupChat = isGroup === 'true';
  
  // Достаем аватарку из словаря по ID
  const avatarSource = AVATARS[id as string];

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    mockDatabase[id as string] = updatedMessages;
    setInputText('');
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Хедер */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerBranding}>ВЕКТОР</Text>
          <Text style={styles.headerSubtitle}>{name || 'Чат'}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* Плашка собеседника с проверкой аватарки */}
          <View style={styles.profileBar}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.profileAvatarImage} />
            ) : (
              <View style={[styles.profileAvatarPlaceholder, isGroupChat && { backgroundColor: '#EBF5FF' }]}>
                 <Ionicons name={isGroupChat ? "people" : "person"} size={22} color={isGroupChat ? "#007AFF" : "#AAA"} />
              </View>
            )}

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={[styles.profileStatus, !isGroupChat && { color: '#4CAF50' }]}>
                {isGroupChat ? `${participants} участников` : 'В сети'}
              </Text>
            </View>
          </View>

          {/* Сообщения */}
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageWrapper, msg.isMe ? styles.myWrapper : styles.theirWrapper]}>
              {isGroupChat && !msg.isMe && (
                <Text style={styles.senderName}>{msg.sender}</Text>
              )}
              <View style={[styles.bubble, msg.isMe ? styles.myBubble : styles.theirBubble]}>
                <Text style={[styles.messageText, msg.isMe ? styles.myText : styles.theirText]}>{msg.text}</Text>
                <Text style={[styles.timeText, msg.isMe ? styles.myTime : styles.theirTime]}>{msg.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Ввод сообщения */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Напишите сообщение..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, inputText.trim().length > 0 && { backgroundColor: '#007AFF' }]}
              onPress={handleSend}
              disabled={inputText.trim().length === 0}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10, marginBottom: 10 },
  backButton: { marginRight: 10 },
  headerContent: { flex: 1 },
  headerBranding: { color: '#1A1A1A', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  headerSubtitle: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  
  chatContent: { paddingHorizontal: 20, paddingBottom: 20, gap: 15 },
  profileBar: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  
  // Новые стили для картинки аватарки
  profileAvatarImage: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F0F0' },
  
  profileAvatarPlaceholder: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  profileInfo: { marginLeft: 12 },
  profileName: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  profileStatus: { fontSize: 11, color: '#888', fontWeight: '600' },

  messageWrapper: { maxWidth: '85%', marginBottom: 5 },
  myWrapper: { alignSelf: 'flex-end' },
  theirWrapper: { alignSelf: 'flex-start' },
  senderName: { fontSize: 11, fontWeight: '700', color: '#888', marginLeft: 12, marginBottom: 4 },
  bubble: { padding: 15, borderRadius: 22 },
  myBubble: { backgroundColor: '#1A1A1A', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  messageText: { fontSize: 15, lineHeight: 20 },
  myText: { color: '#FFF' },
  theirText: { color: '#1A1A1A' },
  timeText: { fontSize: 10, marginTop: 5, alignSelf: 'flex-end' },
  myTime: { color: 'rgba(255,255,255,0.6)' },
  theirTime: { color: '#AAA' },

  inputWrapper: { padding: 15, backgroundColor: '#F5F7FA' },
  inputContainer: { backgroundColor: '#FFF', borderRadius: 24, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 15, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A', maxHeight: 100, paddingTop: 6, paddingBottom: 6 },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginLeft: 10, marginBottom: 2 }
});