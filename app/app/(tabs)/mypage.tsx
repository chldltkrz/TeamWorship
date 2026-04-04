import { StyleSheet, ScrollView, View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';

interface MenuItem {
  icon: string;
  label: string;
  desc?: string;
  badge?: string;
  color?: string;
}

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: '예배팀',
    items: [
      { icon: 'users', label: '멤버 관리', desc: '멤버 초대 및 역할 설정' },
      { icon: 'calendar-plus-o', label: '일정 템플릿', desc: '반복 일정 설정' },
      { icon: 'bar-chart', label: '리포트', desc: '참여도 및 통계 보기', badge: 'NEW', color: Brand.accent },
      { icon: 'flag', label: '기도 요청', desc: '기도 나눔 게시판' },
    ],
  },
  {
    title: '설정',
    items: [
      { icon: 'bell', label: '알림 설정', desc: '푸시, 카카오톡, 이메일' },
      { icon: 'moon-o', label: '다크 모드', desc: '시스템 설정 따르기' },
      { icon: 'shield', label: '개인정보 & 보안', desc: '비밀번호, 로그인 관리' },
      { icon: 'download', label: '데이터 내보내기', desc: 'CSV, Excel 형식' },
    ],
  },
  {
    title: '지원',
    items: [
      { icon: 'question-circle', label: '도움말 & FAQ', desc: '사용 가이드' },
      { icon: 'envelope', label: '문의하기', desc: '피드백 및 버그 제보' },
      { icon: 'star', label: '앱 리뷰 남기기', desc: '스토어에서 평가하기' },
      { icon: 'info-circle', label: '앱 정보', desc: 'TeamWorship v1.0.0' },
    ],
  },
];

export default function MyPageScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile */}
      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Avatar name="김강래" color={Brand.primary} size={56} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>김강래</Text>
            <Text style={[styles.profileRole, { color: colors.textSecondary }]}>예배인도 · 주일팀 리더</Text>
            <View style={styles.profileBadge}>
              <View style={[styles.teamBadge, { backgroundColor: `${Brand.primary}20` }]}>
                <Text style={[styles.teamBadgeText, { color: Brand.primary }]}>주일 예배팀</Text>
              </View>
            </View>
          </View>
          <Pressable style={[styles.editBtn, { borderColor: colors.border }]}>
            <FontAwesome name="pencil" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Card>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={[styles.quickStatItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.quickStatNumber, { color: Brand.primary }]}>24</Text>
          <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>이번달 출석</Text>
        </View>
        <View style={[styles.quickStatItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.quickStatNumber, { color: Brand.accent }]}>96%</Text>
          <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>출석률</Text>
        </View>
        <View style={[styles.quickStatItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.quickStatNumber, { color: Brand.orange }]}>12</Text>
          <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>서빙 횟수</Text>
        </View>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {section.items.map((item, i) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.menuItem,
                  { backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
                  i < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${item.color || Brand.primary}15` }]}>
                  <FontAwesome name={item.icon as any} size={16} color={item.color || Brand.primary} />
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
                  {item.desc && (
                    <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                  )}
                </View>
                <FontAwesome name="angle-right" size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
          </Card>
        </View>
      ))}

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
  profileCard: { marginBottom: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '800' },
  profileRole: { fontSize: 13, marginTop: 2 },
  profileBadge: { flexDirection: 'row', marginTop: 6 },
  teamBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  teamBadgeText: { fontSize: 11, fontWeight: '600' },
  editBtn: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  quickStats: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickStatItem: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    borderRadius: 14, borderWidth: 1,
  },
  quickStatNumber: { fontSize: 22, fontWeight: '800' },
  quickStatLabel: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4,
  },
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
  newBadge: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4,
  },
  newBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 16, borderRadius: 14, borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontWeight: '600' },
});
