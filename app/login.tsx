import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Исправлено: добавлено ключевое слово async
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Ошибка", "Введите логин и пароль");
      return;
    }

    setLoading(true);
    try {
      // Теперь await будет работать корректно
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Ошибка доступа", 
        "Неверный логин или пароль. Обратитесь к администратору системы ВЕКТОР."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.brand}>ВЕКТОР</Text>
          <Text style={styles.subtitle}>Корпоративная сеть инструкторов</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Логин</Text>
          <TextInput 
            style={styles.input} 
            placeholder="admin@vector.ru" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            keyboardType="email-address"
          />

          <Text style={styles.label}>Пароль</Text>
          <TextInput 
            style={styles.input} 
            placeholder="••••••••" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Войти в систему</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Данное приложение предназначено только для сотрудников автошколы «ВЕКТОР»
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  inner: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  brand: { fontSize: 32, fontWeight: '900', color: '#1A1A1A', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 5, fontWeight: '500' },
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F8F9FB', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#EFEFEF', fontSize: 16 },
  button: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  buttonText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  footer: { position: 'absolute', bottom: 40, left: 30, right: 30, textAlign: 'center', color: '#AAA', fontSize: 12, lineHeight: 18 }
});