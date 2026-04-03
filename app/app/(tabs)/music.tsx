import { StyleSheet, ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { sheetMusic } from '@/constants/MockData';

const allKeys = ['전체', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];

export default function MusicScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [selectedKey, setSelectedKey] = useState('전체');
  const [search, setSearch] = useState('');

  const filtered = sheetMusic
    .filter((s) => selectedKey === '전체' || s.key === selectedKey)
    .filter((s) => s.title.includes(search) || s.artist.includes(search));

  const recentlyUsed = [...sheetMusic].sort((a, b) => b.usedCount - a.usedCount).slice(0, 4);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
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
        {/* Popular Songs */}
        <SectionHeader title="자주 사용하는 곡" actionLabel="더보기" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {recentlyUsed.map((song) => (
            <Pressable
              key={`pop-${song.id}`}
              style={[styles.popularCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.popularIcon, { backgroundColor: `${Brand.accent}20` }]}>
                <Text style={{ fontSize: 22 }}>🎵</Text>
              </View>
              <Text style={[styles.popularTitle, { color: colors.text }]} numberOfLines={1}>
                {song.title}
              </Text>
              <Text style={[styles.popularArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                {song.artist}
              </Text>
              <View style={styles.popularMeta}>
                <Badge label={`Key ${song.key}`} />
                <Text style={[styles.usedCount, { color: colors.textSecondary }]}>
                  {song.usedCount}회
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* All Songs */}
        <SectionHeader
          title={`악보 목록 (${filtered.length})`}
          actionLabel="+ 업로드"
        />
        {filtered.map((song) => (
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
                <Pressable style={[styles.transposeBtn, { borderColor: colors.border }]}>
                  <FontAwesome name="exchange" size={12} color={colors.textSecondary} />
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

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🎶</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              검색 결과가 없습니다
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  content: { padding: 16 },
  popularCard: {
    width: 150, padding: 14, borderRadius: 14,
    borderWidth: 1, marginRight: 12,
  },
  popularIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  popularTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  popularArtist: { fontSize: 12, marginBottom: 8 },
  popularMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  usedCount: { fontSize: 11 },
  songRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  songIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  songArtist: { fontSize: 12 },
  songMeta: { alignItems: 'flex-end', gap: 8 },
  transposeBtn: {
    width: 30, height: 30, borderRadius: 8,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, fontWeight: '500' },
});
