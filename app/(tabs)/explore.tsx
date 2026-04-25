import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useWaybills } from '../WaybillContext';

const { width } = Dimensions.get('window');

// --- КОМПОНЕНТ КАРТОЧКИ ПУТЕВОГО ЛИСТА ---
const WaybillCard = ({ item, onPreview, onOpenMenu }) => {
  const menuBtnRef = useRef(null);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return { bg: '#E8F5E9', text: '#2E7D32', label: 'Принят' };
      case 'error': return { bg: '#FFEBEE', text: '#C62828', label: 'Ошибка' };
      case 'pending': return { bg: '#FFFDE7', text: '#F9A825', label: 'Проверка' };
      default: return { bg: '#F5F5F5', text: '#757575', label: 'Отправлен' };
    }
  };

  const status = getStatusStyle(item.status);

  return (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <TouchableOpacity 
          style={styles.cardImageContainer} 
          activeOpacity={0.8} 
          onPress={() => onPreview(item.uri)}
        >
          {item.uri ? (
            <Image source={{ uri: item.uri }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="document-text-outline" size={24} color="#BDC3C7" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.cardInfo}>
          <Text style={styles.cardFileName} numberOfLines={1}>{item.fileName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <TouchableOpacity 
          ref={menuBtnRef} 
          style={styles.moreButton} 
          onPress={() => menuBtnRef.current.measureInWindow((x, y) => onOpenMenu(item, x, y))}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#BDC3C7" />
        </TouchableOpacity>
      </View>

      {item.status === 'error' && item.comment && (
        <View style={styles.commentContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color="#C62828" />
          <Text style={styles.commentText}>{item.comment}</Text>
        </View>
      )}
    </View>
  );
};

export default function WaybillsScreen() {
  const { waybills, addWaybill, deleteWaybill } = useWaybills();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [previewUri, setPreviewUri] = useState(null);
  
  const menuAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openMenu = (item, x, y) => {
    setSelectedItem(item);
    setMenuPos({ x: x - 150, y: y + 30 }); 
    Animated.spring(menuAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => setSelectedItem(null));
  };

  const pickImage = async (isRetake = false) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      if (isRetake && selectedItem) {
        deleteWaybill(selectedItem.id);
      }
      
      const newBill = {
        id: Date.now().toString(),
        sender: "Хадиуллин Д.",
        // Автоматическое форматирование названия файла
        fileName: `Хадиуллин_${new Date().toLocaleDateString('ru-RU')}`,
        status: 'pending',
        uri: result.assets[0].uri,
      };
      
      addWaybill(newBill);
      closeMenu();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerBranding}>ВЕКТОР</Text>
        <Text style={styles.headerTitle}>Путевые листы</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>История загрузок</Text>
        </View>

        {waybills.map((item) => (
          <WaybillCard 
            key={item.id} 
            item={item} 
            onPreview={(uri) => { 
              setPreviewUri(uri); 
              Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start(); 
            }} 
            onOpenMenu={openMenu}
          />
        ))}
      </ScrollView>

      {/* Плавающая кнопка загрузки по центру */}
      <View style={styles.floatingActionContainer}>
        <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8} onPress={() => pickImage(false)}>
          <Ionicons name="camera" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Всплывающее меню */}
      {selectedItem && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={closeMenu} />
          <Animated.View style={[styles.compactMenu, { top: menuPos.y, left: menuPos.x, opacity: menuAnim, transform: [{ scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => pickImage(true)}>
              <Ionicons name="refresh-outline" size={18} color="#1A1A1A" />
              <Text style={styles.menuItemText}>Переснять</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { deleteWaybill(selectedItem.id); closeMenu(); }}>
              <Ionicons name="trash-outline" size={18} color="#C62828" />
              <Text style={[styles.menuItemText, { color: '#C62828' }]}>Удалить</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Полноэкранный просмотр */}
      {previewUri && (
        <Animated.View style={[styles.previewOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.closePreviewBtn} 
            onPress={() => Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setPreviewUri(null))}
          >
            <Ionicons name="close-circle" size={44} color="#FFF" />
          </TouchableOpacity>
          <Image source={{ uri: previewUri }} style={styles.fullImage} resizeMode="contain" />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    marginBottom: 15 
  },
  headerBranding: { color: '#1A1A1A', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { color: '#888', fontSize: 14, fontWeight: '500' },
  
  // Увеличил отступ снизу, чтобы плавающая кнопка не перекрывала последний лист
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  sectionHeader: { marginBottom: 15, paddingLeft: 5 },
  sectionLabel: { color: '#AAA', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },

  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.04, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 2,
    overflow: 'hidden'
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  cardImageContainer: { width: 60, height: 60, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F8F9FB' },
  cardImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 15, gap: 4 },
  cardFileName: { color: '#1A1A1A', fontSize: 15, fontWeight: '700' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  moreButton: { padding: 10 },
  
  commentContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: '#FFF8F8', 
    borderTopWidth: 1, 
    borderTopColor: '#FFEBEE',
    gap: 8
  },
  commentText: { color: '#C62828', fontSize: 12, fontWeight: '500', flex: 1 },

  // Плавающая центральная кнопка
  floatingActionContainer: { 
    position: 'absolute', 
    bottom: Platform.OS === 'ios' ? 40 : 25, 
    width: '100%', 
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraButton: { 
    width: 72, 
    height: 72, 
    borderRadius: 36, 
    backgroundColor: '#0075FF', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#0075FF',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8
  },

  menuOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 3000 },
  menuBackdrop: { ...StyleSheet.absoluteFillObject },
  compactMenu: { 
    position: 'absolute', 
    width: 170, 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    paddingVertical: 6, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 15, 
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  menuItemText: { color: '#1A1A1A', fontSize: 14, marginLeft: 12, fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 12 },

  previewOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 5000, justifyContent: 'center' },
  fullImage: { width: '100%', height: '80%' },
  closePreviewBtn: { position: 'absolute', top: 50, right: 20, zIndex: 5001 }
});