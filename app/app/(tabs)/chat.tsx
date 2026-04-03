import { StyleSheet, ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { chatRooms } from '@/constants/MockData';

type FilterType = 'all' | 'day' | 'part' | 'general';

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filteredRooms = chatRooms
    .filter((room) => filter === 'all' || room.type === filter)
    .filter((room) => room.name.includes(search));

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'general', label: '전체방' },
    { key: 'day', label: '요일별' },
    { key: 'part', label: '파트별' },
  ];

  const typeIcons: Record<string, string> = {
    general: '📢',
    day: '📅',
    part: '🎵',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInput, { backgroundColor: colors.surfaceSecondary }]}>
          <FontAwesome name="search" size={14} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchText, { color: colors.text }]}
            placeholder="채팅방 검색"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterRow, { backgroundColor: colors.surface }]}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              filter === f.key
                ? { backgroundColor: Brand.primary }
                : { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f.key ? '#fff' : colors.textSecondary },
            ]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chat Room List */}
      <ScrollView style={styles.list}>
        {filteredRooms.map((room) => (
          <Pressable
            key={room.id}
            style={({ pressed }) => [
              styles.roomItem,
              { backgroundColor: pressed ? colors.surfaceSecondary : colors.surface, borderBottomColor: colors.border },
            ]}
          >
            <View style={[styles.roomAvatar, { backgroundColor: `${Brand.primary}20` }]}>
              <Text style={styles.roomAvatarText}>{typeIcons[room.type] || '💬'}</Text>
            </View>
            <View style={styles.roomInfo}>
              <View style={styles.roomHeader}>
                <Text style={[styles.roomName, { color: colors.text }]} numberOfLines={1}>
                  {room.name}
                </Text>
                <Text style={[styles.roomTime, { color: colors.textSecondary }]}>
                  {room.lastMessageTime}
                </Text>
              </View>
              <View style={styles.roomFooter}>
                <Text
                  style={[styles.roomMessage, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {room.lastMessage}
                </Text>
                {room.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{room.unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.memberInfo, { color: colors.textSecondary }]}>
                멤버 {room.memberCount}명
              </Text>
            </View>
          </Pressable>
        ))}

        {filteredRooms.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>💬</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              검색 결과가 없습니다
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab}>
        <FontAwesome name="plus" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    padding: 12,
    borderBottomWidth: 1,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchText: { flex: 1, fontSize: 15, padding: 0 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  list: { flex: 1 },
  roomItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    gap: 14,
  },
  roomAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomAvatarText: { fontSize: 24 },
  roomInfo: { flex: 1 },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  roomName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  roomTime: { fontSize: 12 },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  roomMessage: { fontSize: 13, flex: 1, marginRight: 8 },
  unreadBadge: {
    backgroundColor: Brand.pink,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  memberInfo: { fontSize: 11 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, fontWeight: '500' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
});
