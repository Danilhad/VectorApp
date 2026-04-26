import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import 'react-native-reanimated';

import { GlobalModals } from '../components/GlobalModals';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { WaybillProvider } from './WaybillContext';

// Конфигурация локальных уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, 
    shouldPlaySound: true, 
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,
  }),
});

// Конфигурация вкладок
const CUSTOM_TABS = [
    { name: 'index', title: 'Главная', iconOutline: 'home-outline', iconFill: 'home', route: '/(tabs)/' },
    { name: 'chats', title: 'Сообщения', iconOutline: 'chatbubble-outline', iconFill: 'chatbubble', route: '/(tabs)/chats' },
    { name: 'explore', title: 'Путевые', iconOutline: 'document-text-outline', iconFill: 'document-text', route: '/(tabs)/explore' },
    { name: 'manager', title: 'Журнал', iconOutline: 'list-outline', iconFill: 'list', route: '/(tabs)/manager' },
];

function CustomFloatingTabBar({ currentTabRoute, onTabPress }) {
    return (
        <View style={styles.floatingTabBarOuter}>
            <BlurView 
                intensity={Platform.OS === 'ios' ? 80 : 100} 
                tint="light" 
                style={styles.floatingTabBarInner}
            >
                <View style={styles.tabItemsContainer}>
                    {CUSTOM_TABS.map((tab) => {
                        const isActive = currentTabRoute === tab.route;
                        return (
                            <TouchableOpacity 
                                key={tab.name} 
                                style={styles.tabItem} 
                                onPress={() => onTabPress(tab.route)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isActive ? tab.iconFill : tab.iconOutline}
                                    size={24}
                                    // Черный для активной, полупрозрачный серый для неактивной
                                    color={isActive ? '#1A1A1A' : 'rgba(0, 0, 0, 0.35)'} 
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inTabsGroup = segments[0] === '(tabs)';
    if (!user && inTabsGroup) {
      router.replace('/login');
    } else if (user && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0075FF" />
        <Text style={styles.loadingText}>Загрузка ВЕКТОР...</Text>
      </View>
    );
  }

  // Определяем активный роут для подсветки иконки
  const currentTabRoute = segments[0] === '(tabs)' ? `/(tabs)/${segments[1] || ''}` : '';

  return (
    <>
      <Stack key={user ? 'auth' : 'guest'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" options={{ presentation: 'modal' }} />
      </Stack>
      
      <StatusBar style="dark" />

      {/* Рендерим меню только если пользователь авторизован и находится во вкладках */}
      {user && segments[0] === '(tabs)' && (
          <CustomFloatingTabBar 
            currentTabRoute={currentTabRoute} 
            onTabPress={(route) => router.replace(route)} 
          />
      )}
      
      {user && <GlobalModals />}
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const requestPushPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') console.log('Уведомления отклонены');
    };
    requestPushPermissions();
  }, []);

  return (
    <AuthProvider>
      <WaybillProvider>
        <RootLayoutNav />
      </WaybillProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 15, color: '#888888', fontWeight: '600', fontSize: 14 },
  
  floatingTabBarOuter: {
    position: 'absolute',
    bottom: 35, // Фиксированный отступ снизу
    alignSelf: 'center',
    zIndex: 1000,
    // Тень для эффекта парения над контентом
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  floatingTabBarInner: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 40,
    // Полупрозрачный белый фон для усиления эффекта стекла
    backgroundColor: 'rgba(255, 255, 255, 0.45)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
  },
  tabItemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30, // Расстояние между иконками
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  }
});