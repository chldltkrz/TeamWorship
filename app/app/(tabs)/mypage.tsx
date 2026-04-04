import { StyleSheet, ScrollView, View, Text, Pressable } from 'react-native';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useSchedule } from '@/constants/ScheduleContext';
import { partPools } from '@/constants/MockData';

const currentUser = { name: '김강래', role: '예배인도' };
const isLeader = currentUser.role === '예배인도';

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function MyPageScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { scheduleData, attendanceMap, getAttendanceByDate } = useSchedule();
  const todayStr = toLocalDateStr(new Date());

  // 내가 배정된 예배 수
  const mySchedules = useMemo(() => {
    return scheduleData.filter((row) =>
      row.services.some((svc) =>
        svc.slots.some((slot) => slot.members.some((m) => m.includes(currentUser.name)))
      )
    );
  }, [scheduleData]);

  // 내 출석 기록
  const myAttendance = useMemo(() => {
    return Object.values(attendanceMap).filter((e) => e.memberName === currentUser.name);
  }, [attendanceMap]);

  const myLateCount = myAttendance.filter((a) => a.status === 'late').length;

  // 내가 속한 파트 목록
  const myParts = partPools.filter((p) =>
    p.candidates.some((c) => c.name === currentUser.name)
  );

  const router = useRouter();

  // 다음 예배
  const nextService = mySchedules.find((r) => r.date >= todayStr);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile */}
      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Avatar name={currentUser.name} color={Brand.primary} size={56} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{currentUser.name}</Text>
            <Text style={[styles.profileRole, { color: colors.textSecondary }]}>{currentUser.role}</Text>
            <View style={styles.profileBadges}>
              {myParts.map((p) => (
                <View key={p.role} style={[styles.partBadge, { backgroundColor: `${Brand.primary}15` }]}>
                  <Text style={[styles.partBadgeText, { color: Brand.primary }]}>{p.role}</Text>
                </View>
              ))}
            </View>
          </View>
          <Pressable style={[styles.editBtn, { borderColor: colors.border }]}>
            <FontAwesome name="pencil" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.quickStats}>
        <View style={[styles.quickStatItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.quickStatNumber, { color: Brand.primary }]}>{mySchedules.length}</Text>
          <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>배정된 예배</Text>
        </View>
        <View style={[styles.quickStatItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.quickStatNumber, { color: Brand.accent }]}>{myAttendance.length}</Text>
          <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>출석</Text>
        </View>
        <View style={[styles.quickStatItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.quickStatNumber, { color: Brand.orange }]}>{myLateCount}</Text>
          <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>지각</Text>
        </View>
      </View>

      {/* Next Service */}
      {nextService && (
        <Card>
          <View style={styles.nextServiceRow}>
            <View style={[styles.nextServiceIcon, { backgroundColor: `${Brand.accent}15` }]}>
              <FontAwesome name="calendar" size={18} color={Brand.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nextServiceLabel, { color: colors.textSecondary }]}>다음 예배</Text>
              <Text style={[styles.nextServiceTitle, { color: colors.text }]}>
                {nextService.dayLabel.replace('(일)', '(주일)')}{nextService.services.length > 1 ? ` (${nextService.services.length}부)` : ''}
              </Text>
              {nextService.note && (
                <Text style={[styles.nextServiceNote, { color: Brand.orange }]}>{nextService.note}</Text>
              )}
            </View>
            <Badge label={nextService.date === todayStr ? '오늘' : '예정'} variant={nextService.date === todayStr ? 'success' : 'default'} />
          </View>
        </Card>
      )}

      {/* My Parts Detail */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>내 파트</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {myParts.map((part, i) => (
            <View
              key={part.role}
              style={[
                styles.menuItem,
                i < myParts.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${Brand.primary}15` }]}>
                <FontAwesome name="music" size={16} color={Brand.primary} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{part.role} 파트</Text>
                <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>
                  {part.candidates.length}명 · {part.candidates.map((c) => c.name).join(', ')}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Menu Sections */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>예배팀 관리</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { icon: 'users', label: '멤버 관리', desc: '멤버 초대 및 역할 설정', color: Brand.primary, leaderOnly: true, route: '/member-manage' },
            { icon: 'calendar-plus-o', label: '스케줄 자동생성', desc: '월간 예배 스케줄 생성', color: Brand.primary, leaderOnly: true, action: 'schedule-generate' },
            { icon: 'bar-chart', label: '출석 리포트', desc: '멤버별 출석률 · 지각 통계', badge: 'NEW', color: Brand.accent, route: '/attendance-report' },
            { icon: 'file-text-o', label: '악보 라이브러리', desc: `${8}곡 등록됨`, color: Brand.primary, action: 'music-library' },
            { icon: 'flag', label: '기도 요청', desc: '기도 나눔 게시판', color: Brand.orange, route: '/prayer' },
          ].filter((item) => !item.leaderOnly || isLeader).map((item, i, arr) => (
            <Pressable
              key={item.label}
              onPress={() => {
                if (item.route) router.push(item.route as any);
                else if ((item as any).action === 'schedule-generate') router.push('/(tabs)/schedule?view=generate' as any);
                else if ((item as any).action === 'music-library') router.push('/(tabs)/music?tab=library' as any);
              }}
              style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
                i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <FontAwesome name={item.icon as any} size={16} color={item.color} />
              </View>
              <View style={styles.menuInfo}>
                <View style={styles.menuLabelRow}>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  {item.badge && (
                    <View style={[styles.newBadge, { backgroundColor: Brand.accent }]}>
                      <Text style={styles.newBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
              </View>
              <FontAwesome name="angle-right" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>설정</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { icon: 'bell', label: '알림 설정', desc: '푸시, 카카오톡, 이메일' },
            { icon: 'moon-o', label: '다크 모드', desc: '시스템 설정 따르기' },
            { icon: 'calendar-times-o', label: '불가 날짜 관리', desc: '내 불가일 설정', route: '/my-unavailable' },
            { icon: 'shield', label: '개인정보 & 보안', desc: '비밀번호, 로그인 관리' },
            { icon: 'download', label: '데이터 내보내기', desc: 'CSV, Excel 형식' },
          ].map((item, i, arr) => (
            <Pressable
              key={item.label}
              onPress={() => (item as any).route && router.push((item as any).route)}
              style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
                i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${Brand.primary}15` }]}>
                <FontAwesome name={item.icon as any} size={16} color={Brand.primary} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
              </View>
              <FontAwesome name="angle-right" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>지원</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { icon: 'question-circle', label: '도움말 & FAQ', desc: '사용 가이드' },
            { icon: 'envelope', label: '문의하기', desc: '피드백 및 버그 제보' },
            { icon: 'star', label: '앱 리뷰 남기기', desc: '스토어에서 평가하기' },
            { icon: 'info-circle', label: '앱 정보', desc: 'TeamWorship v1.0.0' },
          ].map((item, i, arr) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
                i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${Brand.primary}15` }]}>
                <FontAwesome name={item.icon as any} size={16} color={Brand.primary} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
              </View>
              <FontAwesome name="angle-right" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Logout */}
      <Pressable style={[styles.logoutBtn, { borderColor: colors.border }]}>
        <FontAwesome name="sign-out" size={16} color={Brand.pink} />
        <Text style={[styles.logoutText, { color: Brand.pink }]}>로그아웃</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  // Profile
  profileCard: { marginBottom: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '800' },
  profileRole: { fontSize: 13, marginTop: 2 },
  profileBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  partBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  partBadgeText: { fontSize: 11, fontWeight: '600' },
  editBtn: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  // Stats
  quickStats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickStatItem: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    borderRadius: 14, borderWidth: 1,
  },
  quickStatNumber: { fontSize: 22, fontWeight: '800' },
  quickStatLabel: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  // Next Service
  nextServiceRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  nextServiceIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  nextServiceLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  nextServiceTitle: { fontSize: 16, fontWeight: '700' },
  nextServiceNote: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  // Section
  section: { marginBottom: 20, marginTop: 4 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4,
  },
  // Menu
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 14,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  menuInfo: { flex: 1 },
  menuLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuLabel: { fontSize: 15, fontWeight: '600' },
  menuDesc: { fontSize: 12, marginTop: 1 },
  newBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  newBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 16, borderRadius: 14, borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontWeight: '600' },
});
