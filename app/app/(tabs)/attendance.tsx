import { StyleSheet, ScrollView, View, Text, Pressable } from 'react-native';
import { useState, useMemo } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useSchedule } from '@/constants/ScheduleContext';
import { partPools } from '@/constants/MockData';

const days = ['일', '월', '화', '수', '목', '금', '토'];

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AttendanceScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { scheduleData, attendanceMap, getAttendanceByDate } = useSchedule();

  const today = new Date();
  const todayStr = toLocalDateStr(today);

  // 오늘 또는 가장 가까운 예배 날짜 찾기
  const [selectedDate, setSelectedDate] = useState(() => {
    const todayRow = scheduleData.find((r) => r.date === todayStr);
    if (todayRow) return todayStr;
    const upcoming = scheduleData.find((r) => r.date >= todayStr);
    return upcoming?.date || todayStr;
  });

  const selectedRow = scheduleData.find((r) => r.date === selectedDate);
  const todayAttendance = getAttendanceByDate(selectedDate);

  // 해당 날짜의 모든 멤버 (스케줄 기반)
  const allMembersForDate = useMemo(() => {
    if (!selectedRow) return [];
    const members: { name: string; role: string; roomId: string; roomName: string; color: string }[] = [];
    selectedRow.services.forEach((svc, si) => {
      const serviceLabel = svc.serviceLabel ? ` ${svc.serviceLabel}` : '';
      const roomId = `worship-${selectedDate}-${si}`;
      const roomName = `${selectedRow.dayLabel}${serviceLabel} 예배`;
      svc.slots.forEach((slot) => {
        slot.members.forEach((name) => {
          if (!name) return;
          const pool = partPools.find((p) => p.candidates.some((c) => c.name === name));
          const candidate = pool?.candidates.find((c) => c.name === name);
          members.push({
            name,
            role: slot.role,
            roomId,
            roomName,
            color: candidate?.color || Brand.primary,
          });
        });
      });
    });
    return members;
  }, [selectedRow, selectedDate]);

  const checkedInNames = new Set(todayAttendance.map((a) => a.memberName));
  const totalMembers = allMembersForDate.length;
  const checkedCount = allMembersForDate.filter((m) => checkedInNames.has(m.name)).length;
  const lateCount = todayAttendance.filter((a) => a.status === 'late').length;
  const presentCount = checkedCount - lateCount;
  const attendanceRate = totalMembers > 0 ? Math.round((checkedCount / totalMembers) * 100) : 0;

  // 최근 예배 날짜들
  const recentDates = scheduleData.filter((r) => r.date <= todayStr).slice(-5).reverse();
  const upcomingDates = scheduleData.filter((r) => r.date > todayStr).slice(0, 3);
  const dateTabs = [...recentDates, ...upcomingDates]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((v, i, arr) => arr.findIndex((x) => x.date === v.date) === i);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Date Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRow}
        style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        {dateTabs.map((row) => {
          const isSelected = row.date === selectedDate;
          const isToday = row.date === todayStr;
          const dateAttendance = getAttendanceByDate(row.date);
          const hasAttendance = dateAttendance.length > 0;
          return (
            <Pressable
              key={row.date}
              onPress={() => setSelectedDate(row.date)}
              style={[
                styles.dateTab,
                isSelected && { backgroundColor: Brand.primary, borderColor: Brand.primary },
              ]}
            >
              <Text style={[styles.dateTabDay, { color: isSelected ? '#fff' : colors.textSecondary }]}>
                {row.dayLabel.match(/\((.)\)/)?.[1] || ''}
              </Text>
              <Text style={[styles.dateTabNum, { color: isSelected ? '#fff' : colors.text }]}>
                {parseInt(row.dayLabel)}
              </Text>
              {isToday && !isSelected && <View style={[styles.todayDot, { backgroundColor: Brand.primary }]} />}
              {hasAttendance && !isSelected && <View style={[styles.todayDot, { backgroundColor: Brand.accent }]} />}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.content}>
        {/* Stats */}
        <Card>
          <View style={styles.statsContainer}>
            <View style={[styles.ringOuter, { borderColor: attendanceRate > 0 ? Brand.accent : colors.border }]}>
              <Text style={[styles.ringPercent, { color: attendanceRate > 0 ? Brand.accent : colors.textSecondary }]}>
                {attendanceRate}%
              </Text>
              <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>출석률</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: Brand.accent }]} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>출석</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{presentCount}명</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: Brand.orange }]} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>지각</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{lateCount}명</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: Brand.pink }]} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>미출석</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{totalMembers - checkedCount}명</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Info */}
        {totalMembers === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📋</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                이 날짜에 예배 스케줄이 없습니다
              </Text>
            </View>
          </Card>
        ) : (
          <>
            <View style={[styles.infoBar, { backgroundColor: `${Brand.primary}10`, borderColor: `${Brand.primary}25` }]}>
              <FontAwesome name="info-circle" size={14} color={Brand.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                출석체크는 각 예배 채팅방에서 할 수 있습니다
              </Text>
            </View>

            {/* Member List by Service */}
            {selectedRow?.services.map((svc, si) => {
              const serviceLabel = svc.serviceLabel ? ` ${svc.serviceLabel}` : '';
              const roomId = `worship-${selectedDate}-${si}`;

              return (
                <View key={si}>
                  {selectedRow.services.length > 1 && (
                    <SectionHeader title={`${serviceLabel.trim() || '예배'} 출석 현황`} />
                  )}
                  {svc.slots.map((slot) =>
                    slot.members.filter(Boolean).map((memberName) => {
                      const key = `${memberName}-${roomId}`;
                      const entry = attendanceMap[key];
                      const isChecked = !!entry;
                      const isLate = entry?.status === 'late';
                      const pool = partPools.find((p) => p.candidates.some((c) => c.name === memberName));
                      const candidate = pool?.candidates.find((c) => c.name === memberName);

                      const statusColor = isChecked ? (isLate ? Brand.orange : Brand.accent) : Brand.pink;
                      const statusLabel = isChecked ? (isLate ? '지각' : '출석') : '미출석';
                      const statusIcon = isChecked ? (isLate ? 'warning' : 'check-circle') : 'clock-o';

                      return (
                        <Card key={`${si}-${slot.role}-${memberName}`}>
                          <View style={styles.memberRow}>
                            <Avatar name={memberName} color={candidate?.color || Brand.primary} size={40} />
                            <View style={styles.memberInfo}>
                              <Text style={[styles.memberName, { color: colors.text }]}>{memberName}</Text>
                              <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{slot.role}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                              <FontAwesome name={statusIcon as any} size={16} color={statusColor} />
                              <Text style={[styles.statusText, { color: statusColor }]}>
                                {statusLabel}
                              </Text>
                            </View>
                          </View>
                          {isChecked && entry && (
                            <Text style={[styles.checkedTime, { color: isLate ? Brand.orange : colors.textSecondary }]}>
                              {entry.checkedAt}에 채팅방에서 {isLate ? '지각 출석' : '출석'}
                            </Text>
                          )}
                        </Card>
                      );
                    })
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* Recent Check-ins */}
        {todayAttendance.length > 0 && (
          <>
            <SectionHeader title="출석 기록" />
            {todayAttendance.map((entry, i) => (
              <Card key={i}>
                <View style={styles.logRow}>
                  <FontAwesome name="check" size={14} color={Brand.accent} />
                  <Text style={[styles.logText, { color: colors.text }]}>
                    <Text style={{ fontWeight: '700' }}>{entry.memberName}</Text>
                    {'  '}
                    <Text style={{ color: colors.textSecondary }}>{entry.roomName} · {entry.checkedAt}</Text>
                  </Text>
                </View>
              </Card>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Date Row
  dateRow: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  dateTab: {
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1, borderColor: 'transparent', minWidth: 52,
  },
  dateTabDay: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  dateTabNum: { fontSize: 18, fontWeight: '800' },
  todayDot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
  content: { padding: 16 },
  // Stats
  statsContainer: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  ringOuter: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 6, alignItems: 'center', justifyContent: 'center',
  },
  ringPercent: { fontSize: 22, fontWeight: '800' },
  ringLabel: { fontSize: 11 },
  statsGrid: { flex: 1, gap: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statLabel: { fontSize: 13, fontWeight: '500', width: 44 },
  statValue: { fontSize: 14, fontWeight: '700' },
  // Info bar
  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 16,
  },
  infoText: { fontSize: 13, flex: 1 },
  // Member
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700' },
  memberRole: { fontSize: 12, marginTop: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  statusText: { fontSize: 13, fontWeight: '600' },
  checkedTime: { fontSize: 11, marginTop: 8, marginLeft: 52 },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, fontWeight: '500' },
  // Log
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logText: { fontSize: 14, flex: 1 },
});
