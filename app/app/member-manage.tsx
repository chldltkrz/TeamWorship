import {
  StyleSheet, View, Text, Pressable, ScrollView, TextInput, Modal,
} from 'react-native';
import { useState, useMemo } from 'react';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { partPools } from '@/constants/MockData';
import type { PartRole } from '@/constants/Types';

const roleColors: Record<string, string> = {
  '예배인도': '#6C63FF', '기타': '#43B89C', '건반': '#F5A623', '일렉': '#FF6584',
  '베이스': '#0984E3', '드럼': '#E84393', '싱어': '#FD79A8', '음향': '#00B894',
  'PPT': '#00B894', '온라인': '#636E72',
};

const allRoles: PartRole[] = ['예배인도', '기타', '건반', '일렉', '베이스', '드럼', '싱어', '음향', '온라인'];
const memberColors = ['#6C63FF', '#43B89C', '#F5A623', '#FF6584', '#0984E3', '#E84393', '#FD79A8', '#00B894', '#636E72', '#A5A0FF', '#0B73C5', '#D45D8A'];

export default function MemberManageScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRoles, setAddRoles] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('전체');
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  // 전체 멤버 목록 (파트풀에서 추출, 중복 제거)
  const allMembers = useMemo(() => {
    const map = new Map<string, { name: string; color: string; roles: string[] }>();
    partPools.forEach((pool) => {
      pool.candidates.forEach((c) => {
        if (map.has(c.name)) {
          map.get(c.name)!.roles.push(pool.role);
        } else {
          map.set(c.name, { name: c.name, color: c.color, roles: [pool.role] });
        }
      });
    });
    return Array.from(map.values());
  }, [renderKey]);

  const filteredMembers = allMembers
    .filter((m) => filterRole === '전체' || m.roles.includes(filterRole))
    .filter((m) => m.name.includes(search));

  const toggleAddRole = (role: string) => {
    const next = new Set(addRoles);
    if (next.has(role)) next.delete(role); else next.add(role);
    setAddRoles(next);
  };

  const handleAddMember = () => {
    const name = addName.trim();
    if (!name || addRoles.size === 0) return;

    const color = memberColors[Math.floor(Math.random() * memberColors.length)];
    const newId = `new-${Date.now()}`;

    addRoles.forEach((role) => {
      const pool = partPools.find((p) => p.role === role);
      if (pool) {
        const exists = pool.candidates.some((c) => c.name === name);
        if (!exists) {
          pool.candidates.push({
            memberId: newId + '-' + role,
            name,
            color,
            unavailableDates: [],
          });
        }
      }
    });

    setAddName('');
    setAddRoles(new Set());
    setShowAddModal(false);
  };

  const handleToggleRole = (memberName: string, role: string, memberColor: string) => {
    const pool = partPools.find((p) => p.role === role);
    if (!pool) return;
    const idx = pool.candidates.findIndex((c) => c.name === memberName);
    if (idx !== -1) {
      // 이미 있으면 제거
      pool.candidates.splice(idx, 1);
    } else {
      // 없으면 추가
      pool.candidates.push({
        memberId: `edit-${Date.now()}-${role}`,
        name: memberName,
        color: memberColor,
        unavailableDates: [],
      });
    }
    setRenderKey((k) => k + 1);
  };

  const handleRemoveMember = (memberName: string) => {
    partPools.forEach((pool) => {
      const idx = pool.candidates.findIndex((c) => c.name === memberName);
      if (idx !== -1) pool.candidates.splice(idx, 1);
    });
    setEditingMember(null);
    setRenderKey((k) => k + 1);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '멤버 관리',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerBackTitle: '더보기',
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[styles.searchInput, { backgroundColor: colors.surfaceSecondary }]}>
            <FontAwesome name="search" size={14} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchText, { color: colors.text }]}
              placeholder="멤버 검색"
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Role Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          contentContainerStyle={styles.filterBarContent}
        >
          {['전체', ...allRoles].map((role) => {
            const isActive = filterRole === role;
            const count = role === '전체' ? allMembers.length : allMembers.filter((m) => m.roles.includes(role)).length;
            return (
              <Pressable
                key={role}
                onPress={() => setFilterRole(role)}
                style={[styles.filterChip, isActive ? { backgroundColor: Brand.primary } : { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.filterText, { color: isActive ? '#fff' : colors.textSecondary }]}>
                  {role} {count}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Member List */}
        <ScrollView style={styles.list}>
          <View style={styles.listContent}>
            <Text style={[styles.listCount, { color: colors.textSecondary }]}>
              {filteredMembers.length}명
            </Text>

            {filteredMembers.map((member) => {
              const isEditing = editingMember === member.name;
              return (
                <Card key={member.name} style={isEditing ? { borderColor: Brand.primary } : undefined}>
                  <Pressable
                    onPress={() => setEditingMember(isEditing ? null : member.name)}
                    style={styles.memberRow}
                  >
                    <Avatar name={member.name} color={member.color} size={44} />
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                      <View style={styles.memberRoles}>
                        {member.roles.map((role) => (
                          <View key={role} style={[styles.roleBadge, { backgroundColor: `${roleColors[role] || Brand.primary}18` }]}>
                            <Text style={[styles.roleBadgeText, { color: roleColors[role] || Brand.primary }]}>{role}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <FontAwesome
                      name={isEditing ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={colors.textSecondary}
                    />
                  </Pressable>

                  {/* 파트 편집 패널 */}
                  {isEditing && (
                    <View style={[styles.editPanel, { borderTopColor: colors.border }]}>
                      <Text style={[styles.editPanelLabel, { color: colors.textSecondary }]}>
                        파트 변경 (탭하여 추가/제거)
                      </Text>
                      <View style={styles.editRoleGrid}>
                        {allRoles.map((role) => {
                          const hasRole = member.roles.includes(role);
                          return (
                            <Pressable
                              key={role}
                              onPress={() => handleToggleRole(member.name, role, member.color)}
                              style={[
                                styles.editRoleItem,
                                {
                                  backgroundColor: hasRole ? `${roleColors[role]}20` : colors.surfaceSecondary,
                                  borderColor: hasRole ? roleColors[role] : colors.border,
                                },
                              ]}
                            >
                              {hasRole && <FontAwesome name="check" size={10} color={roleColors[role]} />}
                              <Text style={[
                                styles.editRoleText,
                                { color: hasRole ? roleColors[role] : colors.textSecondary },
                              ]}>
                                {role}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      <Pressable
                        onPress={() => handleRemoveMember(member.name)}
                        style={[styles.deleteMemberBtn, { borderColor: Brand.pink }]}
                      >
                        <FontAwesome name="trash-o" size={14} color={Brand.pink} />
                        <Text style={[styles.deleteMemberText, { color: Brand.pink }]}>멤버 삭제</Text>
                      </Pressable>
                    </View>
                  )}
                </Card>
              );
            })}

            {filteredMembers.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>👥</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {search ? '검색 결과가 없습니다' : '멤버가 없습니다'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add FAB */}
        <Pressable style={styles.fab} onPress={() => setShowAddModal(true)}>
          <FontAwesome name="user-plus" size={20} color="#fff" />
          <Text style={styles.fabText}>멤버 추가</Text>
        </Pressable>

        {/* Add Member Modal */}
        <Modal visible={showAddModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>멤버 추가</Text>
                <Pressable onPress={() => { setShowAddModal(false); setAddName(''); setAddRoles(new Set()); }}>
                  <FontAwesome name="times" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Name */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>이름 *</Text>
              <TextInput
                style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                placeholder="이름을 입력하세요"
                placeholderTextColor={colors.textSecondary}
                value={addName}
                onChangeText={setAddName}
              />

              {/* Role Selection */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>역할 선택 * (복수 선택 가능)</Text>
              <View style={styles.roleGrid}>
                {allRoles.map((role) => {
                  const isSelected = addRoles.has(role);
                  return (
                    <Pressable
                      key={role}
                      onPress={() => toggleAddRole(role)}
                      style={[
                        styles.roleSelectItem,
                        {
                          backgroundColor: isSelected ? `${roleColors[role]}20` : colors.surfaceSecondary,
                          borderColor: isSelected ? roleColors[role] : colors.border,
                        },
                      ]}
                    >
                      {isSelected && (
                        <FontAwesome name="check" size={10} color={roleColors[role]} />
                      )}
                      <Text style={[
                        styles.roleSelectText,
                        { color: isSelected ? roleColors[role] : colors.textSecondary },
                      ]}>
                        {role}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Selected Preview */}
              {addName.trim() && addRoles.size > 0 && (
                <View style={[styles.previewCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                  <Avatar name={addName} color={memberColors[0]} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.previewName, { color: colors.text }]}>{addName.trim()}</Text>
                    <Text style={[styles.previewRoles, { color: colors.textSecondary }]}>
                      {Array.from(addRoles).join(', ')}
                    </Text>
                  </View>
                </View>
              )}

              {/* Submit */}
              <Pressable
                onPress={handleAddMember}
                style={[styles.submitBtn, (!addName.trim() || addRoles.size === 0) && { opacity: 0.4 }]}
                disabled={!addName.trim() || addRoles.size === 0}
              >
                <FontAwesome name="user-plus" size={16} color="#fff" />
                <Text style={styles.submitBtnText}>멤버 추가</Text>
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
  // Search
  searchBar: { padding: 12, borderBottomWidth: 1 },
  searchInput: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, gap: 10,
  },
  searchText: { flex: 1, fontSize: 15, padding: 0 },
  // Filter
  filterBar: { borderBottomWidth: 1, maxHeight: 56 },
  filterBarContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: '600' },
  // List
  list: { flex: 1 },
  listContent: { padding: 16 },
  listCount: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  // Member Row
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  memberRoles: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  // Edit Panel
  editPanel: { marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  editPanelLabel: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  editRoleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  editRoleItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1.5,
  },
  editRoleText: { fontSize: 13, fontWeight: '600' },
  deleteMemberBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 14, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1,
  },
  deleteMemberText: { fontSize: 14, fontWeight: '600' },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, fontWeight: '500' },
  // FAB
  fab: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    height: 56, borderRadius: 16,
    backgroundColor: Brand.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    elevation: 8, shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  fieldInput: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
  },
  // Role Grid
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleSelectItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1.5,
  },
  roleSelectText: { fontSize: 14, fontWeight: '600' },
  // Preview
  previewCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 20,
  },
  previewName: { fontSize: 15, fontWeight: '700' },
  previewRoles: { fontSize: 12, marginTop: 2 },
  // Submit
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Brand.primary, paddingVertical: 16,
    borderRadius: 14, marginTop: 24,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
