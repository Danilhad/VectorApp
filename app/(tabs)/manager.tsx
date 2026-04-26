import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet, Text, View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getInstructorReports } from '../../services/dbService';

export default function ManagerScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Подписываемся на историю заявок
    const unsubscribe = getInstructorReports(user.uid, (data) => {
      setReports(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const renderReportItem = ({ item }: { item: any }) => {
    // Определяем цвет статуса
    const statusColor = item.status === 'new' ? '#FF9500' : 
                        item.status === 'in_progress' ? '#007AFF' : '#4CD964';
    
    const statusText = item.status === 'new' ? 'Новая' : 
                       item.status === 'in_progress' ? 'В работе' : 'Исправлено';

    const date = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : '...';

    return (
      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportDate}>{date}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
        <Text style={styles.reportCar}>{item.car || 'Автомобиль не указан'}</Text>
        <Text style={styles.reportDesc} numberOfLines={3}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Журнал заявок</Text>
        <Text style={styles.headerSubtitle}>История тех. обслуживания</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#1A1A1A" /></View>
      ) : reports.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={60} color="#E5E7EB" />
          <Text style={styles.emptyText}>Вы еще не отправляли заявок о неисправностях</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 15, fontSize: 16 },
  listContent: { padding: 20 },
  reportCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reportDate: { fontSize: 12, color: '#AAA', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  reportCar: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 5 },
  reportDesc: { fontSize: 14, color: '#666', lineHeight: 20 }
});