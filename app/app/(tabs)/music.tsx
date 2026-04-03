import { StyleSheet, ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { sheetMusic, musicRooms } from '@/constants/MockData';

type TabType = 'rooms' | 'library';
const allKeys = ['전체', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];

export default function MusicScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [tab, setTab] = useState<TabType>('rooms');
  const [selectedKey, setSelectedKey] = useState('전체');
  const [search, setSearch] = useState('');

  const liveRooms = musicRooms.filter((r) => r.isLive);
  const recentRooms = musicRooms.filter((r) => !r.isLive);

  const filteredLibrary = sheetMusic
    .filter((s) => selectedKey === '전체' || s.key === selectedKey)
    .filter((s) => s.title.includes(search) || s.artist.includes(search));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Switch */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => setTab('rooms')}
          style={[styles.tabItem, tab === 'rooms' && styles.tabItemActive]}
        >
          <FontAwesome
            name="users"
            size={14}
            color={tab === 'rooms' ? Brand.primary : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: tab === 'rooms' ? Brand.primary : colors.textSecondary },
          ]}>
            협업방
          </Text>
          {liveRooms.length > 0 && (
            <View style={styles.liveDot} />
          )}
        </Pressable>
        <Pressable
          onPress={() => setTab('library')}
          style={[styles.tabItem, tab === 'library' && styles.tabItemActive]}
        >
          <FontAwesome
            name="folder-open"
            size={14}
            color={tab === 'library' ? Brand.primary : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: tab === 'library' ? Brand.primary : colors.textSecondary },
          ]}>
            악보 라이브러리
          </Text>
        </Pressable>
      </View>

      <ScrollView>
        {tab === 'rooms' ? (
          <View style={styles.content}>
            {/* Collab Banner */}
            <Pressable style={[styles.collabBanner, { borderColor: colors.border }]}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerIcon}>🎵</Text>
                <View style={styles.bannerTextWrap}>
                  <Text style={[styles.bannerTitle, { color: colors.text }]}>
                    실시간 악보 협업
                  </Text>
                  <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
                    실시간 악보 공유 · 동기화 넘김 · 라이브 필기
                  </Text>
                </View>
                <FontAwesome name="external-link" size={14} color={colors.textSecondary} />
              </View>
            </Pressable>

            {/* Live Rooms */}
            {liveRooms.length > 0 && (
              <>
                <SectionHeader title="실시간 세션" />
                {liveRooms.map((room) => (
                  <Card key={room.id}>
                    <View style={styles.roomHeader}>
                      <View style={styles.roomLiveBadge}>
                        <View style={styles.liveIndicator} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                      <Text style={[styles.roomActivity, { color: colors.textSecondary }]}>
                        {room.lastActivity}
                      </Text>
                    </View>

                    <Text style={[styles.roomName, { color: colors.text }]}>{room.name}</Text>
                    <Text style={[styles.roomSong, { color: colors.textSecondary }]}>
                      {room.songTitle} — {room.songArtist}
                    </Text>

                    {/* Song Form */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.songFormScroll}
                    >
                      {room.songForm.map((section, i) => (
                        <View
                          key={`${room.id}-form-${i}`}
                          style={[
                            styles.songFormChip,
                            {
                              backgroundColor: i === room.currentPage
                                ? `${Brand.primary}25`
                                : colors.surfaceSecondary,
                              borderColor: i === room.currentPage
                                ? Brand.primary
                                : 'transparent',
                            },
                          ]}
                        >
                          <Text style={[
                            styles.songFormText,
                            {
                              color: i === room.currentPage
                                ? Brand.primary
                                : colors.textSecondary,
                            },
                          ]}>
                            {section}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>

                    {/* Room Meta */}
                    <View style={styles.roomMeta}>
                      <View style={styles.roomUsers}>
                        {room.activeUsers.map((u, i) => (
                          <View key={`${room.id}-u-${i}`} style={{ marginLeft: i > 0 ? -6 : 0 }}>
                            <Avatar name={u.name} color={u.color} size={28} />
                          </View>
                        ))}
                        <Text style={[styles.userCount, { color: colors.textSecondary }]}>
                          {room.activeUsers.length}명 접속중
                        </Text>
                      </View>
                      <View style={styles.roomInfo}>
                        <Badge label={`Key ${room.key}`} />
                        <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>
                          {room.currentPage}/{room.pageCount}p
                        </Text>
                        {room.hasAnnotations && (
                          <FontAwesome name="pencil" size={12} color={Brand.accent} />
                        )}
                      </View>
                    </View>

                    {/* Join Button */}
                    <Pressable style={styles.joinBtn}>
                      <FontAwesome name="sign-in" size={14} color="#fff" />
                      <Text style={styles.joinBtnText}>세션 참여하기</Text>
                    </Pressable>
                  </Card>
                ))}
              </>
            )}

            {/* Recent Rooms */}
            <SectionHeader title="최근 악보방" actionLabel="+ 새 방 만들기" />
            {recentRooms.map((room) => (
              <Card key={room.id}>
                <View style={styles.recentRow}>
                  <View style={[styles.recentIcon, { backgroundColor: `${Brand.primary}12` }]}>
                    <FontAwesome name="file-pdf-o" size={20} color={Brand.primary} />
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={[styles.roomName, { color: colors.text, fontSize: 15 }]}>
                      {room.name}
                    </Text>
                    <Text style={[styles.roomSong, { color: colors.textSecondary }]}>
                      {room.songTitle} — {room.songArtist} · Key {room.key}
                    </Text>
                    <View style={styles.recentMeta}>
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        {room.pageCount}p
                      </Text>
                      {room.hasAnnotations && (
                        <Text style={[styles.metaText, { color: Brand.accent }]}>
                          필기 있음
                        </Text>
                      )}
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        {room.lastActivity}
                      </Text>
                    </View>
                  </View>
                  <FontAwesome name="angle-right" size={20} color={colors.textSecondary} />
                </View>
              </Card>
            ))}

            {/* Feature Highlights */}
            <SectionHeader title="악보 협업 기능" />
            <View style={styles.featureGrid}>
              {[
                { icon: 'refresh', label: '실시간 동기화', desc: '페이지 넘김 자동 동기화' },
                { icon: 'pencil', label: '라이브 필기', desc: '악보 위에 실시간 메모' },
                { icon: 'exchange', label: '키 변환', desc: '원터치 트랜스포즈' },
                { icon: 'list-ol', label: '곡 구조', desc: 'Verse, Chorus 등 구간 표시' },
              ].map((f) => (
                <View
                  key={f.label}
                  style={[styles.featureItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <FontAwesome name={f.icon as any} size={18} color={Brand.primary} />
                  <Text style={[styles.featureLabel, { color: colors.text }]}>{f.label}</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* ===== Library Tab ===== */
          <>
            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <View style={[styles.searchInput, { backgroundColor: colors.surfaceSecondary }]}>
                <FontAwesome name="search" size={14} color={colors.textSecondary} />
                <TextInput
                  style={[styles.searchText, { color: colors.text }]}
                  placeholder="곡명 또는 아티스트 검색"
                  placeholderTextColor={colors.textSecondary}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
            </View>

            {/* Key Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.keyRow}
              style={{ backgroundColor: colors.surface }}
            >
              {allKeys.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => setSelectedKey(key)}
                  style={[
                    styles.keyChip,
                    selectedKey === key
                      ? { backgroundColor: Brand.primary }
                      : { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Text style={[
                    styles.keyText,
                    { color: selectedKey === key ? '#fff' : colors.textSecondary },
                  ]}>
                    {key}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.content}>
              <SectionHeader
                title={`악보 목록 (${filteredLibrary.length})`}
                actionLabel="+ 업로드"
              />
              {filteredLibrary.map((song) => (
                <Card key={song.id}>
                  <View style={styles.songRow}>
                    <View style={[styles.songIcon, { backgroundColor: `${Brand.primary}15` }]}>
                      <FontAwesome name="file-text-o" size={18} color={Brand.primary} />
                    </View>
                    <View style={styles.songInfo}>
                      <Text style={[styles.songTitle, { color: colors.text }]}>{song.title}</Text>
                      <Text style={[styles.songArtist, { color: colors.textSecondary }]}>
                        {song.artist} · {song.bpm && `${song.bpm} BPM`}
                      </Text>
                    </View>
                    <View style={styles.songMeta}>
                      <Badge label={song.key} />
                      <Pressable style={[styles.openRoomBtn, { backgroundColor: `${Brand.primary}15` }]}>
                        <FontAwesome name="users" size={11} color={Brand.primary} />
                        <Text style={[styles.openRoomText, { color: Brand.primary }]}>방 열기</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.tagRow}>
                    {song.tags.map((tag) => (
                      <View key={tag} style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
                        <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              ))}

              {filteredLibrary.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 40, marginBottom: 8 }}>🎶</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    검색 결과가 없습니다
                  </Text>
                </View>
              )}
            </View>
          </>
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
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14,
  },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: Brand.primary },
  tabText: { fontSize: 14, fontWeight: '700' },
  liveDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  content: { padding: 16 },

  // Collab Banner
  collabBanner: {
    borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 20,
    backgroundColor: 'rgba(108,99,255,0.06)',
  },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerIcon: { fontSize: 28 },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { fontSize: 15, fontWeight: '800' },
  bannerDesc: { fontSize: 12, marginTop: 2 },

  // Room Cards
  roomHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  roomLiveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,59,48,0.12)', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 50,
  },
  liveIndicator: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF3B30',
  },
  liveText: { color: '#FF3B30', fontSize: 11, fontWeight: '800' },
  roomActivity: { fontSize: 12 },
  roomName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  roomSong: { fontSize: 13, marginBottom: 10 },

  // Song Form
  songFormScroll: { marginBottom: 14 },
  songFormChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8,
    marginRight: 6, borderWidth: 1,
  },
  songFormText: { fontSize: 12, fontWeight: '600' },

  // Room Meta
  roomMeta: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  roomUsers: { flexDirection: 'row', alignItems: 'center' },
  userCount: { fontSize: 12, marginLeft: 10, fontWeight: '500' },
  roomInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pageInfo: { fontSize: 12, fontWeight: '600' },

  // Join
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Brand.primary, paddingVertical: 12,
    borderRadius: 12,
  },
  joinBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Recent Rooms
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  recentIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  recentInfo: { flex: 1 },
  recentMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaText: { fontSize: 11, fontWeight: '500' },

  // Feature Grid
  featureGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  featureItem: {
    width: '48%', padding: 16, borderRadius: 14,
    borderWidth: 1, gap: 6, flexGrow: 1, flexBasis: '45%',
  },
  featureLabel: { fontSize: 13, fontWeight: '700' },
  featureDesc: { fontSize: 11 },

  // Library tab
  searchBar: { padding: 12, borderBottomWidth: 1 },
  searchInput: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, gap: 10,
  },
  searchText: { flex: 1, fontSize: 15, padding: 0 },
  keyRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  keyChip: {
    paddingHorizontal: 18, paddingVertical: 7,
    borderRadius: 20, marginRight: 2,
  },
  keyText: { fontSize: 13, fontWeight: '700' },
  songRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  songIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  songArtist: { fontSize: 12 },
  songMeta: { alignItems: 'flex-end', gap: 8 },
  openRoomBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  openRoomText: { fontSize: 11, fontWeight: '700' },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, fontWeight: '500' },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Brand.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12,
  },
});
