import {
  StyleSheet, View, Text, Pressable, ScrollView, TextInput, Modal,
} from 'react-native';
import { useState } from 'react';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

const currentUser = '김강래';

interface PrayerItem {
  id: string;
  author: string;
  authorColor: string;
  content: string;
  date: string;
  isAnswered: boolean;
}

const defaultPrayers: PrayerItem[] = [
  { id: '1', author: '김강래', authorColor: '#6C63FF', content: '이번 부활절 예배가 은혜로운 시간이 되도록 기도해주세요 🙏', date: '4월 3일', isAnswered: false },
  { id: '2', author: '최이삭', authorColor: '#43B89C', content: '가족 건강을 위해 기도 부탁드립니다', date: '4월 2일', isAnswered: false },
  { id: '3', author: '소유진', authorColor: '#0984E3', content: '취업 면접이 있어요. 좋은 결과 있길 기도해주세요!', date: '4월 1일', isAnswered: true },
  { id: '4', author: '이승완', authorColor: '#E84393', content: '팀 화합을 위해 기도합니다', date: '3월 30일', isAnswered: false },
  { id: '5', author: '임성수', authorColor: '#F5A623', content: '부모님 건강 회복을 위해 기도 부탁드립니다', date: '3월 28일', isAnswered: true },
];

export default function PrayerScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [prayers, setPrayers] = useState<PrayerItem[]>(defaultPrayers);
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'answered'>('all');

  const filtered = prayers.filter((p) => {
    if (filter === 'active') return !p.isAnswered;
    if (filter === 'answered') return p.isAnswered;
    return true;
  });

  const handleAdd = () => {
    if (!newContent.trim()) return;
    const now = new Date();
    setPrayers((prev) => [{
      id: `prayer-${Date.now()}`,
      author: currentUser,
      authorColor: '#6C63FF',
      content: newContent.trim(),
      date: `${now.getMonth() + 1}월 ${now.getDate()}일`,
      isAnswered: false,
    }, ...prev]);
    setNewContent('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setPrayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleAnswered = (id: string) => {
    setPrayers((prev) => prev.map((p) => p.id === id ? { ...p, isAnswered: !p.isAnswered } : p));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '기도 요청',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerBackTitle: '더보기',
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Filter */}
        <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {[
            { key: 'all' as const, label: '전체', count: prayers.length },
            { key: 'active' as const, label: '기도중', count: prayers.filter((p) => !p.isAnswered).length },
            { key: 'answered' as const, label: '응답', count: prayers.filter((p) => p.isAnswered).length },
          ].map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterChip, filter === f.key ? { backgroundColor: Brand.primary } : { backgroundColor: colors.surfaceSecondary }]}
            >
              <Text style={[styles.filterText, { color: filter === f.key ? '#fff' : colors.textSecondary }]}>
                {f.label} {f.count}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView style={styles.list}>
          <View style={styles.listContent}>
            {filtered.map((prayer) => (
              <Card key={prayer.id} style={prayer.isAnswered ? { opacity: 0.6 } : undefined}>
                <View style={styles.prayerHeader}>
                  <Avatar name={prayer.author} color={prayer.authorColor} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.prayerAuthor, { color: colors.text }]}>{prayer.author}</Text>
                    <Text style={[styles.prayerDate, { color: colors.textSecondary }]}>{prayer.date}</Text>
                  </View>
                  {prayer.isAnswered && (
                    <View style={[styles.answeredBadge, { backgroundColor: `${Brand.accent}15` }]}>
                      <FontAwesome name="check" size={10} color={Brand.accent} />
                      <Text style={[styles.answeredText, { color: Brand.accent }]}>응답</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.prayerContent, { color: colors.text }]}>{prayer.content}</Text>

                {/* Actions — 작성자만 */}
                {prayer.author === currentUser && (
                  <View style={styles.prayerActions}>
                    <Pressable
                      onPress={() => handleToggleAnswered(prayer.id)}
                      style={[styles.actionBtn, { borderColor: colors.border }]}
                    >
                      <FontAwesome
                        name={prayer.isAnswered ? 'undo' : 'check-circle'}
                        size={13}
                        color={prayer.isAnswered ? colors.textSecondary : Brand.accent}
                      />
                      <Text style={[styles.actionText, { color: prayer.isAnswered ? colors.textSecondary : Brand.accent }]}>
                        {prayer.isAnswered ? '기도중으로' : '응답 완료'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(prayer.id)}
                      style={[styles.actionBtn, { borderColor: Brand.pink }]}
                    >
                      <FontAwesome name="trash-o" size={13} color={Brand.pink} />
                      <Text style={[styles.actionText, { color: Brand.pink }]}>삭제</Text>
                    </Pressable>
                  </View>
                )}
              </Card>
            ))}

            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>🙏</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {filter === 'answered' ? '응답된 기도가 없습니다' : '기도 요청이 없습니다'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Button */}
        <Pressable style={styles.fab} onPress={() => setShowAdd(true)}>
          <FontAwesome name="plus" size={18} color="#fff" />
          <Text style={styles.fabText}>기도 요청</Text>
        </Pressable>

        {/* Add Modal */}
        <Modal visible={showAdd} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>기도 요청 올리기</Text>
                <Pressable onPress={() => { setShowAdd(false); setNewContent(''); }}>
                  <FontAwesome name="times" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>

              <TextInput
                style={[styles.prayerInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                placeholder="기도 제목을 나눠주세요..."
                placeholderTextColor={colors.textSecondary}
                value={newContent}
                onChangeText={setNewContent}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Pressable
                onPress={handleAdd}
                style={[styles.submitBtn, !newContent.trim() && { opacity: 0.4 }]}
                disabled={!newContent.trim()}
              >
                <FontAwesome name="paper-plane" size={16} color="#fff" />
                <Text style={styles.submitBtnText}>올리기</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Filter
  filterBar: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
    gap: 8, borderBottomWidth: 1,
  },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: '600' },
  // List
  list: { flex: 1 },
  listContent: { padding: 16 },
  // Prayer Card
  prayerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  prayerAuthor: { fontSize: 15, fontWeight: '700' },
  prayerDate: { fontSize: 12, marginTop: 1 },
  answeredBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  answeredText: { fontSize: 11, fontWeight: '700' },
  prayerContent: { fontSize: 15, lineHeight: 24, marginBottom: 4 },
  prayerActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
  },
  actionText: { fontSize: 13, fontWeight: '600' },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, fontWeight: '500' },
  // FAB
  fab: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    height: 56, borderRadius: 16, backgroundColor: Brand.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    elevation: 8, shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  prayerInput: {
    borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 16,
    lineHeight: 24, minHeight: 120,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Brand.primary, paddingVertical: 16,
    borderRadius: 14, marginTop: 20,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
