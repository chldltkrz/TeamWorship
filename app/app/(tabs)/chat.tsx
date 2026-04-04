import { StyleSheet, ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { partPools } from '@/constants/MockData';
import { useSchedule } from '@/constants/ScheduleContext';
import type { ChatRoom, MonthlyScheduleRow } from '@/constants/Types';

// 현재 로그인 유저 (데모)
const currentUser = { name: '김강래', role: '예배인도' };

type FilterType = 'all' | 'worship' | 'part' | 'general';
type RoomType = 'worship' | 'part' | 'general';

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 이번 주 날짜 범위 계산
function getThisWeekRange(): [string, string] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return [toLocalDateStr(start), toLocalDateStr(end)];
}

// 채팅방 동적 생성
function generateChatRooms(scheduleData: MonthlyScheduleRow[], closedRooms: Set<string>): (ChatRoom & { type: RoomType; members: string[] })[] {
  const rooms: (ChatRoom & { type: RoomType; members: string[] })[] = [];
  const [weekStart, weekEnd] = getThisWeekRange();

  // 1) 전체 공지방
  rooms.push({
    id: 'general-1',
    name: '예배팀 전체',
    type: 'general',
    lastMessage: '이번 주 셋리스트 확인해주세요!',
    lastMessageTime: '오후 3:24',
    unreadCount: 3,
    memberCount: partPools.reduce((sum, p) => sum + p.candidates.length, 0),
    members: partPools.flatMap((p) => p.candidates.map((c) => c.name)),
  });

  // 2) 이번 주 내가 포함된 예배방 자동 생성
  const thisWeekSchedules = scheduleData.filter(
    (row) => row.date >= weekStart && row.date <= weekEnd
  );

  const worshipMessages = [
    '리허설 시간 확인해주세요',
    '악보 업로드했습니다',
    '이번 곡 키 변경됐어요',
    '오늘 사운드체크 몇시인가요?',
    '셋리스트 수정했습니다',
  ];

  thisWeekSchedules.forEach((row, ri) => {
    row.services.forEach((svc, si) => {
      const allMembers = svc.slots.flatMap((s) => s.members);
      const isMeIncluded = allMembers.some((m) => m.includes(currentUser.name));

      // 내가 포함된 예배방만 + 종료되지 않은 방만 생성
      const worshipRoomId = `worship-${row.date}-${si}`;
      if (!isMeIncluded) return;
      if (closedRooms.has(`room-svc-${row.date}-${si}`)) return;

      const serviceLabel = svc.serviceLabel ? ` ${svc.serviceLabel}` : '';
      const dayChar = row.dayLabel.match(/\((.)\)/)?.[1] || '';

      rooms.push({
        id: `worship-${row.date}-${si}`,
        name: `${row.dayLabel.replace(/\s/g, '')}${serviceLabel} 예배`,
        type: 'worship',
        lastMessage: worshipMessages[ri % worshipMessages.length],
        lastMessageTime: ri === 0 ? '방금 전' : ri === 1 ? '오전 10:30' : '어제',
        unreadCount: ri === 0 ? 5 : ri === 1 ? 2 : 0,
        memberCount: allMembers.length,
        members: allMembers,
      });
    });
  });

  // 3) 내가 속한 모든 파트 채팅방 자동 생성
  const partMessages: Record<string, string> = {
    '예배인도': '다음주 순서 확인 부탁드려요',
    '기타': '이번주 곡 코드 진행 공유합니다',
    '건반': '패드 세팅 어떻게 할까요?',
    '일렉': '이펙터 세팅 공유합니다',
    '베이스': '루트 노트 정리했어요',
    '드럼': '리듬 패턴 정리해봤습니다',
    '싱어': '화음 파트 나눠봤어요',
    '음향': '모니터 볼륨 조절 필요합니다',
    '온라인': '송출 세팅 확인해주세요',
  };

  partPools.forEach((pool, pi) => {
    const amIInPool = pool.candidates.some((c) => c.name === currentUser.name);
    if (!amIInPool) return;

    rooms.push({
      id: `part-${pool.role}`,
      name: `${pool.role} 파트`,
      type: 'part',
      lastMessage: partMessages[pool.role] || '새로운 메시지가 없습니다',
      lastMessageTime: pi === 0 ? '오후 2:15' : pi === 1 ? '어제' : '월요일',
      unreadCount: pi === 0 ? 1 : 0,
      memberCount: pool.candidates.length,
      members: pool.candidates.map((c) => c.name),
    });
  });

  return rooms;
}

const typeConfig: Record<RoomType, { icon: string; color: string }> = {
  general: { icon: '📢', color: Brand.primary },
  worship: { icon: '⛪', color: Brand.accent },
  part: { icon: '🎵', color: Brand.orange },
};

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const { scheduleData, closedRooms, unavailAlerts } = useSchedule();
  const router = useRouter();

  const allRooms = useMemo(() => generateChatRooms(scheduleData, closedRooms), [scheduleData, closedRooms]);

  const filteredRooms = allRooms
    .filter((room) => filter === 'all' || room.type === filter)
    .filter((room) => room.name.includes(search));

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: '전체', count: allRooms.length },
    { key: 'worship', label: '예배방', count: allRooms.filter((r) => r.type === 'worship').length },
    { key: 'part', label: '파트', count: allRooms.filter((r) => r.type === 'part').length },
    { key: 'general', label: '공지', count: allRooms.filter((r) => r.type === 'general').length },
  ];

  const totalUnread = allRooms.reduce((sum, r) => sum + r.unreadCount, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Current User Info */}
      <View style={[styles.userBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Avatar name={currentUser.name} color={Brand.primary} size={32} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{currentUser.name}</Text>
          <Text style={[styles.userRole, { color: colors.textSecondary }]}>{currentUser.role}</Text>
        </View>
        {totalUnread > 0 && (
          <View style={styles.totalUnread}>
            <Text style={styles.totalUnreadText}>{totalUnread}개 안읽음</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
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
      <View style={[styles.filterRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
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
            {f.count != null && f.count > 0 && (
              <Text style={[
                styles.filterCount,
                { color: filter === f.key ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
              ]}>
                {f.count}
              </Text>
            )}
          </Pressable>
        ))}
      </View>

      {/* Chat Room List */}
      <ScrollView style={styles.list}>
        {filteredRooms.map((room) => {
          const config = typeConfig[room.type];
          return (
            <Pressable
              key={room.id}
              onPress={() => router.push({ pathname: '/chat/[id]' as any, params: { id: room.id, name: room.name } })}
              style={({ pressed }) => [
                styles.roomItem,
                {
                  backgroundColor: pressed ? colors.surfaceSecondary : colors.surface,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={[styles.roomAvatar, { backgroundColor: `${config.color}18` }]}>
                <Text style={styles.roomAvatarText}>{config.icon}</Text>
              </View>
              <View style={styles.roomInfo}>
                <View style={styles.roomHeader}>
                  <View style={styles.roomNameRow}>
                    <Text style={[styles.roomName, { color: colors.text }]} numberOfLines={1}>
                      {room.name}
                    </Text>
                    {room.type === 'worship' && (
                      <View style={[styles.autoTag, { backgroundColor: `${Brand.accent}18` }]}>
                        <Text style={[styles.autoTagText, { color: Brand.accent }]}>자동</Text>
                      </View>
                    )}
                  </View>
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
                {/* Unavail Alert */}
                {(() => {
                  const roomAlerts = unavailAlerts.filter((a) => a.roomId === room.id && !a.resolved);
                  if (roomAlerts.length === 0) return null;
                  return (
                    <View style={[styles.alertBanner, { backgroundColor: `${Brand.orange}12` }]}>
                      <FontAwesome name="warning" size={11} color={Brand.orange} />
                      <Text style={[styles.alertText, { color: Brand.orange }]} numberOfLines={1}>
                        {roomAlerts[0].memberName} {roomAlerts[0].role} 불가 · 대체 필요
                      </Text>
                    </View>
                  );
                })()}
                {/* Member preview */}
                <View style={styles.memberPreview}>
                  {room.members.slice(0, 5).map((name, i) => (
                    <Text
                      key={`${room.id}-m-${i}`}
                      style={[
                        styles.memberName,
                        { color: name.includes(currentUser.name) ? Brand.primary : colors.textSecondary },
                      ]}
                    >
                      {name}{i < Math.min(4, room.members.length - 1) ? ', ' : ''}
                    </Text>
                  ))}
                  {room.members.length > 5 && (
                    <Text style={[styles.memberName, { color: colors.textSecondary }]}>
                      외 {room.members.length - 5}명
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}

        {filteredRooms.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>💬</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {search ? '검색 결과가 없습니다' : '해당 카테고리에 채팅방이 없습니다'}
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
  // User Bar
  userBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700' },
  userRole: { fontSize: 12 },
  totalUnread: {
    backgroundColor: Brand.pink, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  totalUnreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  // Search
  searchBar: { padding: 12 },
  searchInput: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, gap: 10,
  },
  searchText: { flex: 1, fontSize: 15, padding: 0 },
  // Filter
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 12,
    paddingVertical: 10, gap: 8, borderBottomWidth: 1,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  filterCount: { fontSize: 11, fontWeight: '700' },
  // List
  list: { flex: 1 },
  roomItem: {
    flexDirection: 'row', padding: 16,
    alignItems: 'center', borderBottomWidth: 1, gap: 14,
  },
  roomAvatar: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  roomAvatarText: { fontSize: 24 },
  roomInfo: { flex: 1 },
  roomHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 3,
  },
  roomNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 },
  roomName: { fontSize: 15, fontWeight: '700' },
  autoTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  autoTagText: { fontSize: 9, fontWeight: '800' },
  roomTime: { fontSize: 12 },
  roomFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  roomMessage: { fontSize: 13, flex: 1, marginRight: 8 },
  unreadBadge: {
    backgroundColor: Brand.pink, borderRadius: 10,
    minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  // Member preview
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginBottom: 4,
    alignSelf: 'flex-start',
  },
  alertText: { fontSize: 11, fontWeight: '600' },
  memberPreview: { flexDirection: 'row', flexWrap: 'wrap' },
  memberName: { fontSize: 11 },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, fontWeight: '500' },
  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Brand.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12,
  },
});
