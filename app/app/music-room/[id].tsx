import {
  StyleSheet, View, Text, Pressable, ScrollView, Platform,
} from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

const currentUser = '김강래';

interface RoomUser {
  name: string;
  color: string;
}

export default function MusicRoomScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const params = useLocalSearchParams<{
    id: string; name: string; songs: string; artist: string;
    songKey: string; users: string; pageCount: string;
  }>();

  const roomName = params.name || '악보방';
  const songList = params.songs ? params.songs.split('|||') : ['악보'];
  const artist = params.artist || '';
  const songKey = params.songKey || 'C';
  const activeUsers: RoomUser[] = params.users
    ? JSON.parse(params.users)
    : [{ name: currentUser, color: Brand.primary }];
  const totalPages = parseInt(params.pageCount || '1');

  const [currentPage, setCurrentPage] = useState(0);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('cursor');
  const [penColor, setPenColor] = useState(Brand.primary);

  const tools = [
    { id: 'cursor', icon: 'mouse-pointer', label: '선택' },
    { id: 'pen', icon: 'pencil', label: '펜' },
    { id: 'highlight', icon: 'paint-brush', label: '형광펜' },
    { id: 'eraser', icon: 'eraser', label: '지우개' },
    { id: 'text', icon: 'font', label: '텍스트' },
  ];

  const penColors = [Brand.primary, Brand.pink, Brand.accent, Brand.orange, '#E84393', '#0984E3', '#2D3436'];

  return (
    <>
      <Stack.Screen
        options={{
          title: roomName,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 16 },
          headerBackTitle: '악보',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16, marginRight: 8 }}>
              <Pressable onPress={() => setShowMembers(!showMembers)}>
                <View style={styles.headerBadge}>
                  <FontAwesome name="users" size={16} color={colors.text} />
                  <View style={styles.headerBadgeCount}>
                    <Text style={styles.headerBadgeText}>{activeUsers.length}</Text>
                  </View>
                </View>
              </Pressable>
            </View>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Bar — Song Info + Key */}
        <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.topBarLeft}>
            <Badge label={`Key ${songKey}`} />
            <Text style={[styles.topBarArtist, { color: colors.textSecondary }]}>{artist}</Text>
          </View>
          <View style={styles.topBarRight}>
            <View style={styles.liveBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </View>

        {/* Song Form Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.songFormBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          contentContainerStyle={styles.songFormBarContent}
        >
          {songList.map((song, i) => (
            <Pressable
              key={i}
              onPress={() => setCurrentPage(i)}
              style={[
                styles.songFormTab,
                currentPage === i
                  ? { backgroundColor: Brand.primary, borderColor: Brand.primary }
                  : { backgroundColor: 'transparent', borderColor: colors.border },
              ]}
            >
              <Text style={[
                styles.songFormTabText,
                { color: currentPage === i ? '#fff' : colors.textSecondary },
              ]}>
                {song}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Members Panel (toggle) */}
        {showMembers && (
          <View style={[styles.membersPanel, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.membersPanelTitle, { color: colors.textSecondary }]}>
              접속중 ({activeUsers.length}명)
            </Text>
            <View style={styles.membersList}>
              {activeUsers.map((u, i) => (
                <View key={i} style={styles.memberItem}>
                  <Avatar name={u.name} color={u.color} size={32} />
                  <Text style={[styles.memberItemName, { color: colors.text }]}>{u.name}</Text>
                  {u.name === currentUser && (
                    <Text style={[styles.memberItemMe, { color: Brand.primary }]}>나</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* PDF Viewer Area (Placeholder) */}
        <View style={styles.viewerArea}>
          <View style={[styles.pdfPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.pdfHeader}>
              <View style={[styles.pdfStaffLine, { backgroundColor: colors.border }]} />
              <View style={[styles.pdfStaffLine, { backgroundColor: colors.border }]} />
              <View style={[styles.pdfStaffLine, { backgroundColor: colors.border }]} />
              <View style={[styles.pdfStaffLine, { backgroundColor: colors.border }]} />
              <View style={[styles.pdfStaffLine, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.pdfCenter}>
              <FontAwesome name="file-pdf-o" size={48} color={`${Brand.primary}40`} />
              <Text style={[styles.pdfTitle, { color: colors.text }]}>{songList[currentPage]}</Text>
              <Text style={[styles.pdfSubtitle, { color: colors.textSecondary }]}>
                {artist} · Key {songKey}
              </Text>
              <Text style={[styles.pdfHint, { color: colors.textSecondary }]}>
                PDF 악보가 여기에 표시됩니다
              </Text>
            </View>
            <View style={styles.pdfFooter}>
              <View style={[styles.pdfStaffLine, { backgroundColor: colors.border }]} />
              <View style={[styles.pdfStaffLine, { backgroundColor: colors.border }]} />
              <View style={[styles.pdfStaffLine, { backgroundColor: colors.border }]} />
              <View style={[styles.pdfStaffLine, { backgroundColor: colors.border }]} />
              <View style={[styles.pdfStaffLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Fake annotation dots */}
            <View style={[styles.annotDot, { backgroundColor: Brand.primary, top: '30%', left: '20%' }]} />
            <View style={[styles.annotDot, { backgroundColor: Brand.pink, top: '45%', left: '60%' }]} />
            <View style={[styles.annotDot, { backgroundColor: Brand.accent, top: '65%', left: '35%' }]} />
          </View>

          {/* Page Navigator */}
          <View style={[styles.pageNav, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              onPress={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              style={[styles.pageNavBtn, currentPage === 0 && { opacity: 0.3 }]}
            >
              <FontAwesome name="chevron-left" size={14} color={colors.text} />
            </Pressable>
            <Text style={[styles.pageNavText, { color: colors.text }]}>
              {currentPage + 1} / {songList.length}
            </Text>
            <Pressable
              onPress={() => setCurrentPage((p) => Math.min(songList.length - 1, p + 1))}
              disabled={currentPage === songList.length - 1}
              style={[styles.pageNavBtn, currentPage === songList.length - 1 && { opacity: 0.3 }]}
            >
              <FontAwesome name="chevron-right" size={14} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Drawing Toolbar */}
        <View style={[styles.toolbar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.toolbarTools}>
            {tools.map((tool) => (
              <Pressable
                key={tool.id}
                onPress={() => setSelectedTool(tool.id)}
                style={[
                  styles.toolBtn,
                  selectedTool === tool.id && { backgroundColor: `${Brand.primary}20` },
                ]}
              >
                <FontAwesome
                  name={tool.icon as any}
                  size={18}
                  color={selectedTool === tool.id ? Brand.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.toolLabel,
                  { color: selectedTool === tool.id ? Brand.primary : colors.textSecondary },
                ]}>
                  {tool.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Pen Color Picker (when pen/highlight selected) */}
          {(selectedTool === 'pen' || selectedTool === 'highlight') && (
            <View style={styles.colorPicker}>
              {penColors.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setPenColor(c)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    penColor === c && styles.colorDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header badge
  headerBadge: { position: 'relative' },
  headerBadgeCount: {
    position: 'absolute', top: -6, right: -8,
    backgroundColor: Brand.pink, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  headerBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  // Top Bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topBarArtist: { fontSize: 13, fontWeight: '500' },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,59,48,0.12)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50,
  },
  liveIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF3B30' },
  liveText: { color: '#FF3B30', fontSize: 11, fontWeight: '800' },

  // Song Form Bar
  songFormBar: { borderBottomWidth: 1, maxHeight: 50 },
  songFormBarContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  songFormTab: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  songFormTabText: { fontSize: 13, fontWeight: '600' },

  // Members Panel
  membersPanel: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  membersPanelTitle: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  membersList: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  memberItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberItemName: { fontSize: 13, fontWeight: '600' },
  memberItemMe: { fontSize: 11, fontWeight: '700' },

  // Viewer
  viewerArea: { flex: 1, padding: 16 },
  pdfPlaceholder: {
    flex: 1, borderRadius: 16, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative', overflow: 'hidden',
  },
  pdfHeader: { position: 'absolute', top: 30, left: 20, right: 20, gap: 12 },
  pdfFooter: { position: 'absolute', bottom: 30, left: 20, right: 20, gap: 12 },
  pdfStaffLine: { height: 1, width: '100%' },
  pdfCenter: { alignItems: 'center', gap: 8 },
  pdfTitle: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  pdfSubtitle: { fontSize: 14 },
  pdfHint: { fontSize: 12, marginTop: 8 },
  annotDot: {
    position: 'absolute', width: 12, height: 12, borderRadius: 6, opacity: 0.5,
  },

  // Page Nav
  pageNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 24, marginTop: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  pageNavBtn: { padding: 8 },
  pageNavText: { fontSize: 15, fontWeight: '700' },

  // Toolbar
  toolbar: {
    paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  toolbarTools: { flexDirection: 'row', justifyContent: 'space-around' },
  toolBtn: {
    alignItems: 'center', gap: 4, paddingVertical: 8,
    paddingHorizontal: 12, borderRadius: 10,
  },
  toolLabel: { fontSize: 10, fontWeight: '600' },
  colorPicker: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 12, marginTop: 10, paddingTop: 10,
  },
  colorDot: { width: 24, height: 24, borderRadius: 12 },
  colorDotActive: {
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
});
