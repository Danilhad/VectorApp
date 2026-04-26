import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// Импортируем Firebase
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function ChatWindow() {
  const { id, name, isGroup } = useLocalSearchParams();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // 1. Слушаем сообщения из Firestore в реальном времени
  useEffect(() => {
    const messagesRef = collection(db, "chats", id as string, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [id]);

  // 2. Отправка сообщения в Firebase
  const handleSend = async () => {
    if (inputText.trim() === '') return;

    try {
      const messagesRef = collection(db, "chats", id as string, "messages");
      await addDoc(messagesRef, {
        text: inputText.trim(),
        createdAt: serverTimestamp(),
        isMe: true, // В реальном приложении здесь будет проверка по auth.currentUser.uid
        sender: "Хадиуллин Д. Н.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      
      setInputText('');
    } catch (error) {
      console.error("Ошибка при отправке:", error);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Хедер (дизайн остается прежним) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.headerStatus}>в сети</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}
      >
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.chatContent}>
          {messages.map((msg: any) => (
            <View key={msg.id} style={[styles.messageRow, msg.isMe ? styles.messageRowMe : styles.messageRowThem]}>
              <View style={[styles.bubble, msg.isMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.messageText, msg.isMe ? styles.textMe : styles.textThem]}>{msg.text}</Text>
                <Text style={[styles.timeText, msg.isMe ? styles.timeMe : styles.timeThem]}>{msg.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              placeholder="Сообщение..." 
              value={inputText} 
              onChangeText={setInputText} 
              multiline 
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="arrow-up" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
  backButton: { marginRight: 10 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerStatus: { fontSize: 12, color: '#007AFF' },
  chatContent: { padding: 15 },
  messageRow: { flexDirection: 'row', marginBottom: 12 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 18 },
  bubbleMe: { backgroundColor: '#1A1A1A' },
  bubbleThem: { backgroundColor: '#E9ECEF' },
  messageText: { fontSize: 15 },
  textMe: { color: '#FFF' },
  textThem: { color: '#1A1A1A' },
  timeText: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  timeMe: { color: 'rgba(255,255,255,0.6)' },
  timeThem: { color: '#888' },
  inputArea: { padding: 10, backgroundColor: '#FFF' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 15, paddingVertical: 8 },
  input: { flex: 1, fontSize: 16 },
  sendButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }
});