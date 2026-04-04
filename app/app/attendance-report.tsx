import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useSchedule } from '@/constants/ScheduleContext';
import { partPools } from '@/constants/MockData';

function CircleChart({ size, percentage, color, label, count, total, bgColor }: {
  size: number; percentage: number; color: string; label: string;
  count: number; total: number; bgColor: string;
}) {
  return (
    <View style={[circleStyles.container, { width: size + 40 }]}>
      <View style={[circleStyles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: bgColor }]}>
        <View style={[circleStyles.ringFill, {
          width: size, height: size, borderRadius: size / 2,
          borderColor: color, borderLeftColor: percentage > 25 ? color : 'transparent',
          borderBottomColor: percentage > 50 ? color : 'transparent',
          borderRightColor: percentage > 75 ? color : 'transparent',
          transform: [{ rotate: `${(percentage / 100) * 360}deg` }],
        }]} />
        <View style={[circleStyles.inner, { width: size - 16, height: size - 16, borderRadius: (size - 16) / 2 }]}>
          <Text style={[circleStyles.percent, { color }]}>{percentage}%</Text>
        </View>
      </View>
      <Text style={[circleStyles.label, { color: '#9496A8' }]}>{label}</Text>
      <Text style={[circleStyles.detail, { color: '#E8E8F0' }]}>{count}/{total}</Text>
    </View>
  );
}

const circleStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8 },
  ring: { borderWidth: 8, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringFill: { position: 'absolute', borderWidth: 8 },
  inner: { position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: '#13152A' },
  percent: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 12, fontWeight: '600' },
  detail: { fontSize: 13, fontWeight: '700' },
});

export default function AttendanceReportScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { scheduleData, attendanceMap } = useSchedule();

  const allAttendance = Object.values(attendanceMap);
  const presentCount = allAttendance.filter((a) => a.status === 'present').length;
  const lateCount = allAttendance.filter((a) => a.status === 'late').length;
  const totalChecked = allAttendance.length;

  // 전체 배정 멤버 수 (모든 스케줄의 모든 슬롯)
  const totalAssigned = useMemo(() => {
    let count = 0;
    scheduleData.forEach((row) => {
      row.services.forEach((svc) => {
        svc.slots.forEach((slot) => {
          count += slot.members.filter(Boolean).length;
        });
      });
    });
    return count;
  }, [scheduleData]);

  const absentCount = totalAssigned - totalChecked;
  const attendanceRate = totalAssigned > 0 ? Math.round((totalChecked / totalAssigned) * 100) : 0;
  const presentRate = totalAssigned > 0 ? Math.round((presentCount / totalAssigned) * 100) : 0;
  const lateRate = totalAssigned > 0 ? Math.round((lateCount / totalAssigned) * 100) : 0;
  const absentRate = totalAssigned > 0 ? Math.round((absentCount / totalAssigned) * 100) : 0;

  // 멤버별 통계
  const memberStats = useMemo(() => {
    const map = new Map<string, { name: string; color: string; present: number; late: number; total: number }>();

    // 전체 배정 카운트
    scheduleData.forEach((row) => {
      row.services.forEach((svc) => {
        svc.slots.forEach((slot) => {
          slot.members.filter(Boolean).forEach((name) => {
            if (!map.has(name)) {
              const pool = partPools.find((p) => p.candidates.some((c) => c.name === name));
              const candidate = pool?.candidates.find((c) => c.name === name);
              map.set(name, { name, color: candidate?.color || Brand.primary, present: 0, late: 0, total: 0 });
            }
            map.get(name)!.total++;
          });
        });
      });
    });

    // 출석 카운트
    allAttendance.forEach((a) => {
      const entry = map.get(a.memberName);
      if (entry) {
        if (a.status === 'present') entry.present++;
        else if (a.status === 'late') entry.late++;
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const rateA = a.total > 0 ? (a.present + a.late) / a.total : 0;
      const rateB = b.total > 0 ? (b.present + b.late) / b.total : 0;
      return rateB - rateA;
    });
  }, [scheduleData, allAttendance]);

  return (
    <>
      <Stack.Screen
        options={{
          title: '출석 리포트',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerBackTitle: '더보기',
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* Circle Charts */}
          <Card>
            <Text style={[styles.chartTitle, { color: colors.text }]}>전체 출석 현황</Text>
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
              총 {totalAssigned}명 배정 · {totalChecked}명 출석
            </Text>
            <View style={styles.chartRow}>
              <CircleChart
                size={90} percentage={presentRate} color={Brand.accent}
                label="출석" count={presentCount} total={totalAssigned}
                bgColor={`${Brand.accent}25`}
              />
              <CircleChart
                size={90} percentage={lateRate} color={Brand.orange}
                label="지각" count={lateCount} total={totalAssigned}
                bgColor={`${Brand.orange}25`}
              />
              <CircleChart
                size={90} percentage={absentRate} color={Brand.pink}
                label="미출석" count={absentCount} total={totalAssigned}
                bgColor={`${Brand.pink}25`}
              />
            </View>
          </Card>

          {/* Overall Rate */}
          <Card>
            <View style={styles.overallRow}>
              <View style={[styles.overallRing, { borderColor: attendanceRate >= 80 ? Brand.accent : attendanceRate >= 50 ? Brand.orange : Brand.pink }]}>
                <Text style={[styles.overallPercent, { color: attendanceRate >= 80 ? Brand.accent : attendanceRate >= 50 ? Brand.orange : Brand.pink }]}>
                  {attendanceRate}%
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.overallLabel, { color: colors.text }]}>전체 출석률</Text>
                <Text style={[styles.overallDesc, { color: colors.textSecondary }]}>
                  출석 {presentCount} + 지각 {lateCount} / 전체 {totalAssigned}
                </Text>
              </View>
            </View>
          </Card>

          {/* No data hint */}
          {totalChecked === 0 && (
            <View style={[styles.hintBanner, { backgroundColor: `${Brand.primary}10`, borderColor: `${Brand.primary}25` }]}>
              <FontAwesome name="info-circle" size={16} color={Brand.primary} />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                채팅방에서 출석체크를 하면 여기에 반영됩니다
              </Text>
            </View>
          )}

          {/* Member Stats */}
          <SectionHeader title={`멤버별 통계 (${memberStats.length}명)`} />
          {memberStats.map((m) => {
            const checked = m.present + m.late;
            const rate = m.total > 0 ? Math.round((checked / m.total) * 100) : 0;
            return (
              <Card key={m.name}>
                <View style={styles.memberRow}>
                  <Avatar name={m.name} color={m.color} size={40} />
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]}>{m.name}</Text>
                    <View style={styles.memberStatRow}>
                      <Text style={[styles.memberStatItem, { color: Brand.accent }]}>출석 {m.present}</Text>
                      <Text style={[styles.memberStatItem, { color: Brand.orange }]}>지각 {m.late}</Text>
                      <Text style={[styles.memberStatItem, { color: colors.textSecondary }]}>배정 {m.total}</Text>
                    </View>
                  </View>
                  <View style={[styles.memberRate, { backgroundColor: rate >= 80 ? `${Brand.accent}15` : rate >= 50 ? `${Brand.orange}15` : `${Brand.pink}15` }]}>
                    <Text style={[styles.memberRateText, { color: rate >= 80 ? Brand.accent : rate >= 50 ? Brand.orange : Brand.pink }]}>
                      {rate}%
                    </Text>
                  </View>
                </View>
                {/* Mini bar */}
                <View style={[styles.miniBar, { backgroundColor: colors.surfaceSecondary }]}>
                  {m.present > 0 && (
                    <View style={[styles.miniBarFill, { flex: m.present, backgroundColor: Brand.accent }]} />
                  )}
                  {m.late > 0 && (
                    <View style={[styles.miniBarFill, { flex: m.late, backgroundColor: Brand.orange }]} />
                  )}
                  {m.total - checked > 0 && (
                    <View style={[styles.miniBarFill, { flex: m.total - checked, backgroundColor: colors.surfaceSecondary }]} />
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  // Chart
  chartTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  chartSubtitle: { fontSize: 13, marginBottom: 20 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  // Overall
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  overallRing: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  overallPercent: { fontSize: 20, fontWeight: '800' },
  overallLabel: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  overallDesc: { fontSize: 13 },
  // Hint
  hintBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  hintText: { fontSize: 13, flex: 1 },
  // Member
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  memberStatRow: { flexDirection: 'row', gap: 12 },
  memberStatItem: { fontSize: 12, fontWeight: '600' },
  memberRate: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  memberRateText: { fontSize: 16, fontWeight: '800' },
  miniBar: { flexDirection: 'row', height: 4, borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  miniBarFill: { height: 4 },
});
