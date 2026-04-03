import { StyleSheet, ScrollView, View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { attendanceRecords, members } from '@/constants/MockData';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

const statusConfig: Record<AttendanceStatus, { label: string; icon: string; color: string; bg: string }> = {
  present: { label: '출석', icon: 'check-circle', color: Brand.accent, bg: 'rgba(67,184,156,0.15)' },
  absent: { label: '결석', icon: 'times-circle', color: Brand.pink, bg: 'rgba(255,101,132,0.15)' },
  late: { label: '지각', icon: 'clock-o', color: Brand.orange, bg: 'rgba(245,166,35,0.15)' },
  excused: { label: '사유', icon: 'info-circle', color: '#0984E3', bg: 'rgba(9,132,227,0.15)' },
};

export default function AttendanceScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const [records, setRecords] = useState(attendanceRecords);

  const toggleStatus = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const order: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];
        const next = order[(order.indexOf(r.status) + 1) % order.length];
        return { ...r, status: next };
      })
    );
  };

  const stats = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    excused: records.filter((r) => r.status === 'excused').length,
  };

  const attendanceRate = Math.round((stats.present / records.length) * 100);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Date Header */}
      <View style={[styles.dateHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable style={styles.dateNav}>
          <FontAwesome name="chevron-left" size={14} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.dateCenter}>
          <Text style={[styles.dateText, { color: colors.text }]}>2026년 3월 29일 (주일)</Text>
          <Text style={[styles.dateSubText, { color: colors.textSecondary }]}>주일 1부 예배</Text>
        </View>
        <Pressable style={styles.dateNav}>
          <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Stats Ring */}
        <Card>
          <View style={styles.statsContainer}>
            <View style={[styles.ringOuter, { borderColor: colors.border }]}>
              <View style={[styles.ringInner, { backgroundColor: colors.surface }]}>
                <Text style={[styles.ringPercent, { color: Brand.accent }]}>{attendanceRate}%</Text>
                <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>출석률</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              {(Object.entries(stats) as [AttendanceStatus, number][]).map(([key, value]) => {
                const config = statusConfig[key];
                return (
                  <View key={key} style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: config.color }]} />
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{config.label}</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>{value}명</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Member List */}
        <SectionHeader
          title={`멤버 출석 (${records.length}명)`}
          actionLabel="전체 출석"
        />
        {records.map((record) => {
          const config = statusConfig[record.status];
          return (
            <Card key={record.id}>
              <View style={styles.memberRow}>
                <Avatar name={record.memberName} color={record.memberColor} size={40} />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: colors.text }]}>{record.memberName}</Text>
                  <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{record.memberRole}</Text>
                </View>
                <Pressable
                  onPress={() => toggleStatus(record.id)}
                  style={[styles.statusBtn, { backgroundColor: config.bg }]}
                >
                  <FontAwesome name={config.icon as any} size={16} color={config.color} />
                  <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </Pressable>
              </View>
            </Card>
          );
        })}

        {/* Weekly Stats */}
        <SectionHeader title="주간 출석 현황" actionLabel="상세 보기" />
        <Card>
          <View style={styles.weeklyChart}>
            {['월', '화', '수', '목', '금', '토', '주일'].map((day, i) => {
              const height = [0, 0, 60, 0, 40, 80, 100][i];
              return (
                <View key={day} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${height}%`,
                          backgroundColor: height > 0 ? Brand.primary : colors.surfaceSecondary,
                          opacity: height > 0 ? 1 : 0.3,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dateNav: { padding: 8 },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateText: { fontSize: 16, fontWeight: '700' },
  dateSubText: { fontSize: 12, marginTop: 2 },
  content: { padding: 16 },
  statsContainer: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  ringOuter: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 6, alignItems: 'center', justifyContent: 'center',
    borderColor: Brand.accent,
  },
  ringInner: { alignItems: 'center' },
  ringPercent: { fontSize: 22, fontWeight: '800' },
  ringLabel: { fontSize: 11 },
  statsGrid: { flex: 1, gap: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statLabel: { fontSize: 13, fontWeight: '500', width: 36 },
  statValue: { fontSize: 14, fontWeight: '700' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700' },
  memberRole: { fontSize: 12, marginTop: 1 },
  statusBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  statusText: { fontSize: 13, fontWeight: '600' },
  weeklyChart: { flexDirection: 'row', justifyContent: 'space-between', height: 120 },
  barCol: { alignItems: 'center', flex: 1, gap: 6 },
  barTrack: { flex: 1, width: 20, justifyContent: 'flex-end', borderRadius: 6, overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 11, fontWeight: '500' },
});
