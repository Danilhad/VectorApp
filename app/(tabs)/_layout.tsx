import { Tabs } from 'expo-router';
import React from 'react';

// Этот файл теперь только определяет вкладки, но скрывает их стандартный вид.
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,     // Скрываем нативный заголовок
        tabBarStyle: { display: 'none' }, // Скрываем нативный таб-бар
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
        }}
      />
      
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Сообщения',
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Путевые листы',
        }}
      />
      
      <Tabs.Screen
        name="manager"
        options={{
          title: 'Журнал заявок',
        }}
      />
    </Tabs>
  );
}