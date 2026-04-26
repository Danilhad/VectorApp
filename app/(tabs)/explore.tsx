import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function WaybillsScreen() {
  // Временные данные для демонстрации списка путевых листов
  const historyData = [
    { id: 1, date: '25 апреля', car: 'Chery Tiggo 4 Pro', plate: 'О 656 УЕ', status: 'На проверке', statusCode: 'pending' },
    { id: 2, date: '24 апреля', car: 'Chery Tiggo 4 Pro', plate: 'О 656 УЕ', status: 'Одобрен', statusCode: 'approved' },
    { id: 3, date: '23 апреля', car: 'Chery Tiggo 4 Pro', plate: 'О 656 УЕ', status: 'Замечание', statusCode: 'rejected' },
  ];

  // Функция для выбора цвета статуса
  const getStatusColor = (code: string) => {
    if (code === 'approved') return '#4CAF50'; // Зеленый
    if (code === 'pending') return '#FF9800';  // Оранжевый
    return '#F44336'; // Красный
  };

  const getStatusIcon = (code: string) => {
    if (code === 'approved') return 'checkmark-circle';
    if (code === 'pending') return 'time';
    return 'alert-circle';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
    
    {/* Левая часть: Лого + ВЕКТОР (в одну строку) */}
    <View style={styles.brandingContainer}>
      <Image 
        source={require('@/assets/images/splash.png')} 
        style={styles.logo} 
        resizeMode="contain" 
      />
      <Text style={styles.headerBranding}>ВЕКТОР</Text>
    </View>

    {/* Правая часть: Название вкладки */}
    <Text style={styles.headerTitle}>Путевые листы</Text>
    
  </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Компактный блок профиля */}
        <View style={styles.profileBar}>
          <Image 
            source={require('@/assets/images/dino_scientist.png')} 
            style={styles.profileBarAvatar} 
          />
          <View style={styles.profileBarInfo}>
            <Text style={styles.profileBarName}>Хадиуллин Д. Н.</Text>
            <Text style={styles.profileBarRole}>ИНСТРУКТОР</Text>
          </View>
        </View>

        {/* Главная кнопка действия (переход к камере/созданию листа) */}
        <TouchableOpacity style={styles.newWaybillButton}>
          <View style={styles.newWaybillIconBox}>
            <Ionicons name="camera" size={24} color="#fff" />
          </View>
          <View style={styles.newWaybillContent}>
            <Text style={styles.newWaybillText}>Сдать путевой лист</Text>
            <Text style={styles.newWaybillSubtext}>Сфотографировать бумажный бланк</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" style={{ opacity: 0.7 }} />
        </TouchableOpacity>

        {/* Заголовок истории */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Архив за Апрель</Text>
          <Text style={styles.sectionCount}>21 лист</Text>
        </View>

        {/* Список путевых листов */}
        <View style={styles.historyList}>
          {historyData.map((item) => (
            <TouchableOpacity key={item.id} style={styles.historyCard}>
              <View style={styles.historyCardMain}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyCar}>{item.car} • {item.plate}</Text>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statusCode) + '15' }]}>
                <Ionicons name={getStatusIcon(item.statusCode)} size={16} color={getStatusColor(item.statusCode)} />
                <Text style={[styles.statusText, { color: getStatusColor(item.statusCode) }]}>
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA' 
  },
  
  header: { 
    flexDirection: 'row',          // Выстраивает левую и правую части в ряд
    alignItems: 'center',          // Центрирует элементы по вертикали
    justifyContent: 'space-between', // Разносит брендинг влево, а название вправо
    paddingHorizontal: 20, 
    paddingTop: 10, 
    marginBottom: 10,
    width: '100%',                 // Занимает всю ширину экрана
  },

  brandingContainer: {
    flexDirection: 'row',          // Выстраивает Лого и текст ВЕКТОР в ряд
    alignItems: 'center',          // Выравнивает их по одной линии
    gap: 10,                       // Расстояние между картинкой и текстом
  },

  logo: {
    width: 30,
    height: 30,
  },

  headerBranding: { 
    color: '#1A1A1A', 
    fontSize: 20, 
    fontWeight: '900', 
    letterSpacing: 0.5 
  },

  headerTitle: { 
    color: '#888', 
    fontSize: 14, 
    fontWeight: '500',
    textAlign: 'right',            // Дополнительная страховка для текста справа
  },

  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 120, 
    gap: 15 
  },
  
  // Компактный профиль
  profileBar: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  profileBarAvatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F0F0F0' },
  profileBarInfo: { marginLeft: 15, justifyContent: 'center' },
  profileBarName: { color: '#1A1A1A', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  profileBarRole: { color: '#888', fontSize: 12, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Главная кнопка
  newWaybillButton: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 15, elevation: 6 },
  newWaybillIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  newWaybillContent: { flex: 1 },
  newWaybillText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  newWaybillSubtext: { color: '#AAA', fontSize: 12, marginTop: 4 },

  // Секция списка
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingHorizontal: 5 },
  sectionTitle: { color: '#1A1A1A', fontSize: 18, fontWeight: '800' },
  sectionCount: { color: '#888', fontSize: 14, fontWeight: '600' },
  
  historyList: { gap: 10 },
  historyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  historyCardMain: { flex: 1 },
  historyDate: { color: '#1A1A1A', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  historyCar: { color: '#888', fontSize: 12, fontWeight: '500' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 4 },
  statusText: { fontSize: 12, fontWeight: '700' }
});