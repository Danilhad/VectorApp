import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/authService';
import { useWaybills } from '../WaybillContext';

export default function HomeScreen() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { mileage, toggleModal, setIsMilModalVisible, milFade, milScale, setIsRepModalVisible, repFade, repScale } = useWaybills();

  const ADMIN_UID = "pmXlClLgaKdw8GWYzIslDWGOCjq1";

  // 1. Логика выбора изображения автомобиля
  const getCarImage = () => {
    if (userData?.car === "Lada Granta") {
      return require('@/assets/images/car_bg_granta.jpg');
    }
    // По умолчанию (включая Chery Tiggo 4 PRO) оставляем стандартный фон
    return require('@/assets/images/car_bg.jpg');
  };

  const handleLogout = () => {
    logoutUser().catch(e => console.error("Ошибка при выходе:", e));
  };

  // Форматируем имя
  const displayName = userData 
    ? `${userData.lastName || ''} ${userData.firstName || ''}`.trim() 
    : 'Загрузка...';

  // Логика номера
  const plateParts = userData?.plate?.split(' ') || [];
  const mainPlate = plateParts.length >= 3 
    ? `${plateParts[0]} ${plateParts[1]} ${plateParts[2]}` 
    : 'А 000 АА';
  const region = plateParts[3] || '152';

  // Функция для времени обновления (из предыдущего шага)
  const formatLastUpdated = () => {
    if (!userData?.lastUpdated || !userData.lastUpdated.toDate) {
      return 'ОБНОВЛЯЕТСЯ...'; 
    }
    const updateDate = userData.lastUpdated.toDate();
    const now = new Date();
    const isToday = updateDate.getDate() === now.getDate() &&
                    updateDate.getMonth() === now.getMonth() &&
                    updateDate.getFullYear() === now.getFullYear();

    if (isToday) {
      const time = updateDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `ОБНОВЛЕНО СЕГОДНЯ В ${time}`;
    }
    return `ОБНОВЛЕНО ${updateDate.toLocaleDateString()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
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
    <Text style={styles.headerTitle}>Главная</Text>
        {/* Кнопка админа: видна только тебе */}
        {user?.uid === ADMIN_UID && (
          <TouchableOpacity 
            style={styles.adminBtn} 
            onPress={() => router.push('/admin')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#0075FF" />
            <View style={styles.adminBadge} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView  contentContainerStyle={{ 
    paddingHorizontal: 20, 
    paddingBottom: 120 // 120px достаточно, чтобы всё было видно над овалом
  }}  showsVerticalScrollIndicator={false} >
        
        {/* КАРТОЧКА ПРОФИЛЯ */}
        <View style={styles.profileBar}>
          <View style={styles.avatarWrapper}>
             <Image source={require('@/assets/images/dino_scientist.png')} style={styles.profileBarAvatar} />
             <View style={styles.onlineBadge} />
          </View>
          <View style={styles.profileBarInfo}>
            <Text style={styles.profileBarName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.profileBarRole}>{userData?.position || 'Инструктор'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* СЕКЦИЯ АВТОМОБИЛЯ С ДИНАМИЧЕСКИМ ФОНОМ */}
        <View style={styles.carSection}>
          <View style={styles.carCard}>
            {/* Используем функцию для выбора источника изображения */}
            <Image 
              source={getCarImage()} 
              style={styles.carFullPhoto} 
              resizeMode="cover" 
            />
            <ImageBackground 
              source={require('@/assets/images/plate_bg.png')} 
              style={styles.plateImageBg} 
              imageStyle={{borderRadius: 6, resizeMode: 'stretch'}}
            >
              <View style={styles.plateContent}>
                <Text style={styles.plateText}>{mainPlate}</Text>
                <View style={styles.regionContainer}>
                  <Text style={styles.plateRegion}>{region}</Text>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* ТЕХНИЧЕСКИЙ КОНТРОЛЬ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Путевой лист</Text>
        </View>
        
        <View style={styles.statsCard}>
          <View style={styles.mileageWrapper}>
            <View style={styles.statsMileageInfo}>
              <Text style={styles.statsMileageInput}>{mileage.toLocaleString()} км</Text>
              <Text style={styles.statsMileageLabel}>{userData?.car || 'Автомобиль ВЕКТОР'}</Text>
              <Text style={styles.statsMileageUpdated}>{formatLastUpdated()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.mileageEditSquare} 
              onPress={() => toggleModal(setIsMilModalVisible, milFade, milScale, true)}
            >
              <Ionicons name="speedometer-outline" size={24} color="#0075FF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.malfunctionButton} 
            onPress={() => toggleModal(setIsRepModalVisible, repFade, repScale, true)}
          >
            <Ionicons name="alert-circle-outline" size={20} color="#FF3B30" />
            <Text style={styles.malfunctionText}>Сообщить о неисправности</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#0075FF" />
          <Text style={styles.infoBoxText}>
            Данные о пробеге автоматически передаются механику для дальнейшего контроля технического состояния.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  adminBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#E0EEFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  adminBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0075FF',
    borderWidth: 1.5,
    borderColor: '#FFF'
  },

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
  
  profileBar: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 15, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  avatarWrapper: { position: 'relative' },
  profileBarAvatar: { width: 45, height: 45, borderRadius: 18, backgroundColor: '#F0F0F0' },
  onlineBadge: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#4CD964', borderWidth: 2, borderColor: '#FFF' },
  profileBarInfo: { marginLeft: 15, flex: 1 },
  profileBarName: { color: '#1A1A1A', fontSize: 18, fontWeight: '800' },
  profileBarRole: { color: '#0075FF', fontSize: 12, fontWeight: '700', marginTop: 2, textTransform: 'uppercase' },
  logoutBtn: { padding: 10 },


  carSection: { alignItems: 'center', marginTop: 25, marginBottom: 35 },
  carCard: { width: '100%', height: 200, backgroundColor: '#FFFFFF', borderRadius: 28, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 },
  carFullPhoto: { width: '100%', height: '100%', borderRadius: 28 },
  plateImageBg: { position: 'absolute', bottom: -18, alignSelf: 'center', width: 170, height: 40, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  plateContent: { flexDirection: 'row', alignItems: 'center' },
  plateText: { color: '#1A1A1A', fontSize: 22, fontWeight: '800', marginRight: 10 },
  regionContainer: { borderLeftWidth: 0, borderLeftColor: '#333', paddingLeft: 5 },
  plateRegion: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', right: -5, top: -4 },

  sectionHeader: { marginBottom: 15, paddingLeft: 5 },
  sectionTitle: { color: '#1A1A1A', fontSize: 19, fontWeight: '900' },
  
  statsCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 15, gap: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  mileageWrapper: { flexDirection: 'row', backgroundColor: '#F8F9FB', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  statsMileageInfo: { flex: 1 },
  statsMileageInput: { color: '#1A1A1A', fontSize: 26, fontWeight: '900' },
  statsMileageLabel: { color: '#666', fontSize: 13, fontWeight: '600', marginTop: 4 },
  statsMileageUpdated: { color: '#4CD964', fontSize: 11, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  mileageEditSquare: { width: 50, height: 50, backgroundColor: '#FFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },

  malfunctionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, gap: 8, borderTopWidth: 1, borderTopColor: '#F5F5F5', marginTop: 5 },
  malfunctionText: { color: '#FF3B30', fontSize: 14, fontWeight: '700' },

  infoBox: { flexDirection: 'row', backgroundColor: '#E0EEFF', borderRadius: 18, padding: 15, marginTop: 25, gap: 12, alignItems: 'center' },
  infoBoxText: { color: '#0075FF', fontSize: 12, fontWeight: '600', flex: 1, lineHeight: 18 }
});