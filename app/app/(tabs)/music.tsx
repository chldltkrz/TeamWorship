import { StyleSheet, ScrollView, View, Text, Pressable, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { musicRooms as defaultMusicRooms } from '@/constants/MockData';
import type { SheetMusic, MusicRoom } from '@/constants/Types';
import { sheetMusic as defaultSheetMusic } from '@/constants/MockData';
import { useSchedule } from '@/constants/ScheduleContext';
import * as DocumentPicker from 'expo-document-picker';
import { Brand as BrandColors } from '@/constants/Colors';

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const currentUser = { name: '김강래', role: '예배인도' };
const isLeader = currentUser.role === '예배인도';

type TabType = 'rooms' | 'library';
const allKeys = ['전체', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];

export default function MusicScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('rooms');
  const [selectedKey, setSelectedKey] = useState('전체');
  const [search, setSearch] = useState('');

  // 악보 라이브러리 상태
  const [library, setLibrary] = useState<SheetMusic[]>(defaultSheetMusic);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [pendingService, setPendingService] = useState<{
    roomId: string; label: string; date: string; si: number; members: string[]; alreadyExists?: boolean;
  } | null>(null);

  // 협업방 상태
  const [rooms, setRooms] = useState<MusicRoom[]>(defaultMusicRooms);

  const [showAllPast, setShowAllPast] = useState(false);
  const [showAllUnlinked, setShowAllUnlinked] = useState(false);

  // 업로드 폼 상태
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadArtist, setUploadArtist] = useState('');
  const [uploadKey, setUploadKey] = useState('C');
  const [uploadBpm, setUploadBpm] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadFile, setUploadFile] = useState<{ name: string; size?: number } | null>(null);

  const navigateToRoom = (room: MusicRoom) => {
    router.push({
      pathname: '/music-room/[id]' as any,
      params: {
        id: room.id,
        name: room.name,
        songs: room.songForm.join('|||'),
        artist: room.songArtist,
        songKey: room.key,
        users: JSON.stringify(room.activeUsers),
        pageCount: String(room.pageCount),
      },
    });
  };

  const { scheduleData, closeRoom: contextCloseRoom, isRoomClosed } = useSchedule();
  const todayStr = toLocalDateStr(new Date());
  const activeRooms = rooms.filter((r) => !r.isClosed && !isRoomClosed(r.id) && r.date >= todayStr);
  const pastRooms = rooms.filter((r) => r.isClosed || isRoomClosed(r.id) || r.date < todayStr);

  const handleCloseRoom = (roomId: string) => {
    setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, isClosed: true } : r));
    contextCloseRoom(roomId); // Context에도 반영 → 채팅에서 참조
  };

  const filteredLibrary = library
    .filter((s) => selectedKey === '전체' || s.key === selectedKey)
    .filter((s) => s.title.includes(search) || s.artist.includes(search));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const file = result.assets[0];
      setUploadFile({ name: file.name, size: file.size });
      // 파일명에서 곡명 자동 추출 (확장자 제거)
      if (!uploadTitle) {
        const autoTitle = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        setUploadTitle(autoTitle);
      }
    }
  };

  const handleUpload = () => {
    if (!uploadTitle.trim() || !uploadFile) return;
    const newSong: SheetMusic = {
      id: `upload-${Date.now()}`,
      title: uploadTitle.trim(),
      artist: uploadArtist.trim() || '미상',
      key: uploadKey,
      bpm: uploadBpm ? parseInt(uploadBpm) : undefined,
      tags: uploadTags.split(/[,\s#]+/).filter(Boolean),
      addedAt: new Date().toISOString().split('T')[0],
      usedCount: 0,
    };
    setLibrary((prev) => [newSong, ...prev]);
    setUploadTitle(''); setUploadArtist(''); setUploadKey('C');
    setUploadBpm(''); setUploadTags(''); setUploadFile(null);
    setShowUpload(false);
  };

  const handleCreateRoom = () => {
    if (pendingService) {
      handleSelectService(pendingService);
      return;
    }
    setShowServicePicker(true);
  };

  // 이미 방이 생성된 예배의 ID 목록
  const existingRoomServiceIds = new Set(rooms.map((r) => r.id));

  // 아직 방이 없는 예배 목록
  const availableServices = scheduleData.flatMap((row) =>
    row.services.map((svc, si) => {
      const serviceLabel = svc.serviceLabel ? ` ${svc.serviceLabel}` : '';
      const roomId = `room-svc-${row.date}-${si}`;
      return {
        roomId,
        label: `${row.dayLabel}${serviceLabel} 예배`,
        date: row.date,
        si,
        members: svc.slots.flatMap((s) => s.members).filter(Boolean),
        alreadyExists: existingRoomServiceIds.has(roomId),
      };
    })
  ).filter((s) => !s.alreadyExists);

  const handleSelectService = (service: { roomId: string; label: string; date: string; si: number; members: string[] }) => {
    const selected = library.filter((s) => selectedIds.has(s.id));
    const firstSong = selected[0];

    const newRoom: MusicRoom = {
      id: service.roomId,
      name: service.label,
      date: service.date,
      songTitle: selected.map((s) => s.title).join(', '),
      songArtist: firstSong?.artist || '',
      key: firstSong?.key || 'C',
      activeUsers: [],
      pageCount: selected.length,
      currentPage: 1,
      hasAnnotations: false,
      songForm: selected.map((s) => s.title),
      isClosed: false,
      createdBy: currentUser.name,
      lastActivity: '방금 전',
    };

    setRooms((prev) => [newRoom, ...prev]);
    setSelectedIds(new Set());
    setShowServicePicker(false);
    setPendingService(null);
    setTab('rooms');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Switch */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => setTab('rooms')}
          style={[styles.tabItem, tab === 'rooms' && styles.tabItemActive]}
        >
          <FontAwesome name="users" size={14} color={tab === 'rooms' ? Brand.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: tab === 'rooms' ? Brand.primary : colors.textSecondary }]}>
            협업방
          </Text>
          {activeRooms.length > 0 && <View style={styles.liveDot} />}
        </Pressable>
        <Pressable
          onPress={() => setTab('library')}
          style={[styles.tabItem, tab === 'library' && styles.tabItemActive]}
        >
          <FontAwesome name="folder-open" size={14} color={tab === 'library' ? Brand.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: tab === 'library' ? Brand.primary : colors.textSecondary }]}>
            악보 라이브러리
          </Text>
        </Pressable>
      </View>

      <ScrollView>
        {tab === 'rooms' ? (
          /* ===== ROOMS TAB ===== */
          <View style={styles.content}>
            <Pressable style={[styles.collabBanner, { borderColor: colors.border }]}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerIcon}>🎵</Text>
                <View style={styles.bannerTextWrap}>
                  <Text style={[styles.bannerTitle, { color: colors.text }]}>실시간 악보 협업</Text>
                  <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
                    실시간 악보 공유 · 동기화 넘김 · 라이브 필기
                  </Text>
                </View>
                <FontAwesome name="external-link" size={14} color={colors.textSecondary} />
              </View>
            </Pressable>

            {/* 활성 방 */}
            {activeRooms.length > 0 && (
              <>
                <SectionHeader title={`활성 방 (${activeRooms.length})`} />
                {activeRooms.map((room) => (
                  <Card key={room.id}>
                    <View style={styles.roomHeader}>
                      <Badge label={room.date === todayStr ? '오늘' : room.name.split(' ')[0]} variant="success" />
                      <Text style={[styles.roomActivity, { color: colors.textSecondary }]}>{room.lastActivity}</Text>
                    </View>
                    <Text style={[styles.roomName, { color: colors.text }]}>{room.name}</Text>
                    <Text style={[styles.roomSong, { color: colors.textSecondary }]}>
                      {room.songTitle}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.songFormScroll}>
                      {room.songForm.map((section, i) => (
                        <View key={`${room.id}-form-${i}`} style={[styles.songFormChip, {
                          backgroundColor: i === room.currentPage ? `${Brand.primary}25` : colors.surfaceSecondary,
                          borderColor: i === room.currentPage ? Brand.primary : 'transparent',
                        }]}>
                          <Text style={[styles.songFormText, { color: i === room.currentPage ? Brand.primary : colors.textSecondary }]}>
                            {section}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                    <View style={styles.roomMeta}>
                      <View style={styles.roomInfo}>
                        <Badge label={`Key ${room.key}`} />
                        <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>{room.songForm.length}곡</Text>
                      </View>
                    </View>
                    <View style={styles.roomActions}>
                      <Pressable style={styles.joinBtn} onPress={() => navigateToRoom(room)}>
                        <FontAwesome name="sign-in" size={14} color="#fff" />
                        <Text style={styles.joinBtnText}>참여하기</Text>
                      </Pressable>
                      {isLeader && (
                        <Pressable
                          style={[styles.closeRoomBtn, { borderColor: Brand.pink }]}
                          onPress={() => handleCloseRoom(room.id)}
                        >
                          <FontAwesome name="stop-circle" size={14} color={Brand.pink} />
                          <Text style={[styles.closeRoomText, { color: Brand.pink }]}>종료</Text>
                        </Pressable>
                      )}
                    </View>
                  </Card>
                ))}
              </>
            )}

            {activeRooms.length === 0 && (
              <View style={[styles.emptyBanner, { backgroundColor: `${Brand.primary}08`, borderColor: `${Brand.primary}20` }]}>
                <FontAwesome name="inbox" size={24} color={colors.textSecondary} />
                <Text style={[styles.emptyBannerText, { color: colors.textSecondary }]}>
                  활성된 악보방이 없습니다. 아래에서 방을 만들어보세요.
                </Text>
              </View>
            )}

            {/* 지난 방 */}
            {pastRooms.length > 0 && (
              <>
                <SectionHeader title={`지난 방 (${pastRooms.length})`} />
                {pastRooms.slice(0, showAllPast ? undefined : 3).map((room) => (
                  <Pressable key={room.id} onPress={() => navigateToRoom(room)} style={{ opacity: 0.6 }}>
                    <Card>
                      <View style={styles.recentRow}>
                        <View style={[styles.recentIcon, { backgroundColor: `${colors.textSecondary}15` }]}>
                          <FontAwesome name="file-pdf-o" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={styles.recentInfo}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={[styles.roomName, { color: colors.text, fontSize: 15 }]}>{room.name}</Text>
                            <Badge label="종료" variant="danger" />
                          </View>
                          <Text style={[styles.roomSong, { color: colors.textSecondary }]}>
                            {room.songTitle} · Key {room.key}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </Pressable>
                ))}
                {pastRooms.length > 3 && !showAllPast && (
                  <Pressable onPress={() => setShowAllPast(true)} style={styles.showMoreBtn}>
                    <Text style={[styles.showMoreText, { color: Brand.primary }]}>
                      더보기 ({pastRooms.length - 3}개 더)
                    </Text>
                    <FontAwesome name="chevron-down" size={12} color={Brand.primary} />
                  </Pressable>
                )}
              </>
            )}

            {/* 아직 방이 없는 예배 */}
            {availableServices.length > 0 && (
              <>
                <SectionHeader title={`악보방 미생성 예배 (${availableServices.length})`} />
                {availableServices.slice(0, showAllUnlinked ? undefined : 3).map((svc) => (
                  <Card key={svc.roomId}>
                    <View style={styles.recentRow}>
                      <View style={[styles.recentIcon, { backgroundColor: `${Brand.orange}15` }]}>
                        <FontAwesome name="plus-circle" size={20} color={Brand.orange} />
                      </View>
                      <View style={styles.recentInfo}>
                        <Text style={[styles.roomName, { color: colors.text, fontSize: 15 }]}>{svc.label}</Text>
                        <Text style={[styles.roomSong, { color: colors.textSecondary }]}>
                          {svc.members.slice(0, 3).join(', ')}{svc.members.length > 3 ? ` 외 ${svc.members.length - 3}명` : ''}
                        </Text>
                      </View>
                      {isLeader && (
                        <Pressable
                          onPress={() => { setPendingService(svc); setTab('library'); }}
                          style={[styles.addRoomBtn, { borderColor: Brand.primary }]}
                        >
                          <Text style={[styles.addRoomBtnText, { color: Brand.primary }]}>곡 선택</Text>
                        </Pressable>
                      )}
                    </View>
                  </Card>
                ))}
                {availableServices.length > 3 && !showAllUnlinked && (
                  <Pressable onPress={() => setShowAllUnlinked(true)} style={styles.showMoreBtn}>
                    <Text style={[styles.showMoreText, { color: Brand.primary }]}>
                      더보기 ({availableServices.length - 3}개 더)
                    </Text>
                    <FontAwesome name="chevron-down" size={12} color={Brand.primary} />
                  </Pressable>
                )}
              </>
            )}

            <SectionHeader title="악보 협업 기능" />
            <View style={styles.featureGrid}>
              {[
                { icon: 'refresh', label: '실시간 동기화', desc: '페이지 넘김 자동 동기화' },
                { icon: 'pencil', label: '라이브 필기', desc: '악보 위에 실시간 메모' },
                { icon: 'exchange', label: '키 변환', desc: '원터치 트랜스포즈' },
                { icon: 'list-ol', label: '곡 구조', desc: 'Verse, Chorus 등 구간 표시' },
              ].map((f) => (
                <View key={f.label} style={[styles.featureItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <FontAwesome name={f.icon as any} size={18} color={Brand.primary} />
                  <Text style={[styles.featureLabel, { color: colors.text }]}>{f.label}</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* ===== LIBRARY TAB ===== */
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.keyRow} style={{ backgroundColor: colors.surface }}>
              {allKeys.map((key) => (
                <Pressable key={key} onPress={() => setSelectedKey(key)} style={[styles.keyChip,
                  selectedKey === key ? { backgroundColor: Brand.primary } : { backgroundColor: colors.surfaceSecondary },
                ]}>
                  <Text style={[styles.keyText, { color: selectedKey === key ? '#fff' : colors.textSecondary }]}>{key}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Selection Bar */}
            {selectedIds.size > 0 && (
              <View style={[styles.selectionBar, { backgroundColor: Brand.primary }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectionText}>{selectedIds.size}곡 선택됨</Text>
                  {pendingService && (
                    <Text style={styles.selectionSub}>→ {pendingService.label}</Text>
                  )}
                </View>
                {isLeader && (
                  <Pressable onPress={handleCreateRoom} style={styles.createRoomBtn}>
                    <FontAwesome name="users" size={13} color={Brand.primary} />
                    <Text style={styles.createRoomBtnText}>
                      {pendingService ? '바로 생성' : '방 만들기'}
                    </Text>
                  </Pressable>
                )}
                <Pressable onPress={() => { setSelectedIds(new Set()); setPendingService(null); }} style={styles.clearSelBtn}>
                  <FontAwesome name="times" size={14} color="rgba(255,255,255,0.7)" />
                </Pressable>
              </View>
            )}

            <View style={styles.content}>
              <SectionHeader
                title={`악보 목록 (${filteredLibrary.length})`}
                actionLabel="+ 업로드"
                onAction={() => setShowUpload(true)}
              />
              {filteredLibrary.map((song) => {
                const isSelected = selectedIds.has(song.id);
                return (
                  <Pressable key={song.id} onPress={() => toggleSelect(song.id)}>
                    <Card style={isSelected ? { borderColor: Brand.primary, backgroundColor: `${Brand.primary}08` } : undefined}>
                      <View style={styles.songRow}>
                        {/* Checkbox */}
                        <View style={[
                          styles.checkbox,
                          {
                            borderColor: isSelected ? Brand.primary : colors.border,
                            backgroundColor: isSelected ? Brand.primary : 'transparent',
                          },
                        ]}>
                          {isSelected && <FontAwesome name="check" size={12} color="#fff" />}
                        </View>
                        <View style={[styles.songIcon, { backgroundColor: `${Brand.primary}15` }]}>
                          <FontAwesome name="file-text-o" size={18} color={Brand.primary} />
                        </View>
                        <View style={styles.songInfo}>
                          <Text style={[styles.songTitle, { color: colors.text }]}>{song.title}</Text>
                          <Text style={[styles.songArtist, { color: colors.textSecondary }]}>
                            {song.artist}{song.bpm ? ` · ${song.bpm} BPM` : ''}
                          </Text>
                        </View>
                        <Badge label={song.key} />
                      </View>
                      {song.tags.length > 0 && (
                        <View style={styles.tagRow}>
                          {song.tags.map((tag) => (
                            <View key={tag} style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
                              <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </Card>
                  </Pressable>
                );
              })}

              {filteredLibrary.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 40, marginBottom: 8 }}>🎶</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>검색 결과가 없습니다</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Upload FAB (library tab, leader only) */}
      {tab === 'library' && isLeader && (
        <Pressable style={styles.fab} onPress={() => setShowUpload(true)}>
          <FontAwesome name="cloud-upload" size={22} color="#fff" />
        </Pressable>
      )}

      {/* ===== Upload Modal ===== */}
      <Modal visible={showUpload} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>악보 업로드</Text>
              <Pressable onPress={() => setShowUpload(false)}>
                <FontAwesome name="times" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* File pick area */}
            <Pressable onPress={pickFile} style={[styles.filePickArea, {
              borderColor: uploadFile ? Brand.accent : colors.border,
              backgroundColor: uploadFile ? `${Brand.accent}08` : 'transparent',
            }]}>
              {uploadFile ? (
                <>
                  <FontAwesome name="file-pdf-o" size={32} color={Brand.accent} />
                  <Text style={[styles.filePickText, { color: colors.text }]}>{uploadFile.name}</Text>
                  <Text style={[styles.filePickHint, { color: Brand.accent }]}>
                    {uploadFile.size ? `${(uploadFile.size / 1024).toFixed(1)} KB` : '파일 선택됨'} · 탭하여 변경
                  </Text>
                </>
              ) : (
                <>
                  <FontAwesome name="cloud-upload" size={32} color={Brand.primary} />
                  <Text style={[styles.filePickText, { color: colors.text }]}>악보 파일 선택</Text>
                  <Text style={[styles.filePickHint, { color: colors.textSecondary }]}>PDF, 이미지 파일 지원</Text>
                </>
              )}
            </Pressable>

            {/* Title */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>곡명 *</Text>
            <TextInput
              style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              placeholder="곡명을 입력하세요"
              placeholderTextColor={colors.textSecondary}
              value={uploadTitle}
              onChangeText={setUploadTitle}
            />

            {/* Artist */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>아티스트</Text>
            <TextInput
              style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              placeholder="아티스트명"
              placeholderTextColor={colors.textSecondary}
              value={uploadArtist}
              onChangeText={setUploadArtist}
            />

            {/* Key & BPM row */}
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Key</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.keyPickerRow}>
                    {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((k) => (
                      <Pressable
                        key={k}
                        onPress={() => setUploadKey(k)}
                        style={[styles.keyPickerItem,
                          uploadKey === k ? { backgroundColor: Brand.primary } : { backgroundColor: colors.surfaceSecondary },
                        ]}
                      >
                        <Text style={[styles.keyPickerText, { color: uploadKey === k ? '#fff' : colors.textSecondary }]}>{k}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <View style={{ width: 100 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>BPM</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                  placeholder="120"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={uploadBpm}
                  onChangeText={setUploadBpm}
                />
              </View>
            </View>

            {/* Tags */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>태그</Text>
            <TextInput
              style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              placeholder="#찬양 #느린 #경배 (쉼표 또는 공백으로 구분)"
              placeholderTextColor={colors.textSecondary}
              value={uploadTags}
              onChangeText={setUploadTags}
            />

            {/* Submit */}
            <Pressable
              onPress={handleUpload}
              style={[styles.uploadBtn, (!uploadTitle.trim() || !uploadFile) && { opacity: 0.4 }]}
              disabled={!uploadTitle.trim() || !uploadFile}
            >
              <FontAwesome name="cloud-upload" size={16} color="#fff" />
              <Text style={styles.uploadBtnText}>업로드</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ===== Service Picker Modal ===== */}
      <Modal visible={showServicePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>예배 선택</Text>
              <Pressable onPress={() => setShowServicePicker(false)}>
                <FontAwesome name="times" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.servicePickerDesc, { color: colors.textSecondary }]}>
              {selectedIds.size}곡을 연결할 예배를 선택하세요
            </Text>

            {/* Selected songs preview */}
            <View style={styles.selectedSongsPreview}>
              {library.filter((s) => selectedIds.has(s.id)).map((s) => (
                <View key={s.id} style={[styles.selectedSongChip, { backgroundColor: `${Brand.primary}15` }]}>
                  <FontAwesome name="music" size={10} color={Brand.primary} />
                  <Text style={[styles.selectedSongText, { color: Brand.primary }]}>{s.title}</Text>
                </View>
              ))}
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {availableServices.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>📋</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    모든 예배에 이미 방이 생성되어 있습니다
                  </Text>
                </View>
              ) : (
                availableServices.map((svc) => (
                  <Pressable
                    key={svc.roomId}
                    onPress={() => handleSelectService(svc)}
                    style={({ pressed }) => [
                      styles.servicePickerItem,
                      {
                        backgroundColor: pressed ? colors.surfaceSecondary : 'transparent',
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.servicePickerIcon, { backgroundColor: `${Brand.accent}15` }]}>
                      <Text style={{ fontSize: 20 }}>⛪</Text>
                    </View>
                    <View style={styles.servicePickerInfo}>
                      <Text style={[styles.servicePickerLabel, { color: colors.text }]}>{svc.label}</Text>
                      <Text style={[styles.servicePickerMeta, { color: colors.textSecondary }]}>
                        {svc.members.slice(0, 4).join(', ')}{svc.members.length > 4 ? ` 외 ${svc.members.length - 4}명` : ''}
                      </Text>
                    </View>
                    <FontAwesome name="plus-circle" size={22} color={Brand.primary} />
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: Brand.primary },
  tabText: { fontSize: 14, fontWeight: '700' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Brand.accent },
  content: { padding: 16 },

  // Collab Banner
  collabBanner: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 20, backgroundColor: 'rgba(108,99,255,0.06)' },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerIcon: { fontSize: 28 },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { fontSize: 15, fontWeight: '800' },
  bannerDesc: { fontSize: 12, marginTop: 2 },

  // Room Cards
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  roomLiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,59,48,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  liveIndicator: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF3B30' },
  liveText: { color: '#FF3B30', fontSize: 11, fontWeight: '800' },
  roomActivity: { fontSize: 12 },
  roomName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  roomSong: { fontSize: 13, marginBottom: 10 },
  songFormScroll: { marginBottom: 14 },
  songFormChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginRight: 6, borderWidth: 1 },
  songFormText: { fontSize: 12, fontWeight: '600' },
  roomMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  roomUsers: { flexDirection: 'row', alignItems: 'center' },
  userCount: { fontSize: 12, marginLeft: 10, fontWeight: '500' },
  roomInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pageInfo: { fontSize: 12, fontWeight: '600' },
  roomActions: { flexDirection: 'row', gap: 10 },
  joinBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Brand.primary, paddingVertical: 12, borderRadius: 12 },
  joinBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  closeRoomBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1,
  },
  closeRoomText: { fontSize: 14, fontWeight: '700' },
  emptyBanner: {
    alignItems: 'center', gap: 10, padding: 24,
    borderRadius: 14, borderWidth: 1, marginBottom: 16,
  },
  emptyBannerText: { fontSize: 13, textAlign: 'center' },
  showMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14,
  },
  showMoreText: { fontSize: 14, fontWeight: '600' },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  recentIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  recentInfo: { flex: 1 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureItem: { width: '48%', padding: 16, borderRadius: 14, borderWidth: 1, gap: 6, flexGrow: 1, flexBasis: '45%' },
  featureLabel: { fontSize: 13, fontWeight: '700' },
  featureDesc: { fontSize: 11 },

  // Library
  searchBar: { padding: 12, borderBottomWidth: 1 },
  searchInput: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, gap: 10 },
  searchText: { flex: 1, fontSize: 15, padding: 0 },
  keyRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  keyChip: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, marginRight: 2 },
  keyText: { fontSize: 13, fontWeight: '700' },

  // Selection Bar
  selectionBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  selectionText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  selectionSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  createRoomBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  createRoomBtnText: { color: Brand.primary, fontSize: 13, fontWeight: '700' },
  clearSelBtn: { padding: 6 },

  // Song Row
  songRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  songIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  songArtist: { fontSize: 12 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 10, marginLeft: 74 },
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
    elevation: 8, shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12,
  },

  // Upload Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  filePickArea: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 32, marginBottom: 20, gap: 8,
  },
  filePickText: { fontSize: 16, fontWeight: '700' },
  filePickHint: { fontSize: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  fieldInput: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  fieldRow: { flexDirection: 'row', gap: 16 },
  keyPickerRow: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  keyPickerItem: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  keyPickerText: { fontSize: 14, fontWeight: '700' },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Brand.primary, paddingVertical: 16,
    borderRadius: 14, marginTop: 24,
  },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Service Picker
  servicePickerDesc: { fontSize: 14, marginBottom: 16 },
  selectedSongsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  selectedSongChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  selectedSongText: { fontSize: 13, fontWeight: '600' },
  servicePickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, borderBottomWidth: 1,
  },
  servicePickerIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  servicePickerInfo: { flex: 1 },
  servicePickerLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  servicePickerMeta: { fontSize: 12 },

  // Add room btn
  addRoomBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1,
  },
  addRoomBtnText: { fontSize: 12, fontWeight: '700' },
});
