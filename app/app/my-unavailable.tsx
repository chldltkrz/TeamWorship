import {
  StyleSheet, View, Text, Pressable, ScrollView,
} from 'react-native';
import { useState, useMemo } from 'react';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { partPools } from '@/constants/MockData';
import { useSchedule, UnavailAlert } from '@/constants/ScheduleContext';

const currentUser = '김강래';
const days = ['일', '월', '화', '수', '목', '금', '토'];
const year = 2026;
const month = 3; // April 0-indexed

function getMonthCalendar() {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function makeDateStr(day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function MyUnavailableScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const weeks = useMemo(() => getMonthCalendar(), []);
  const { scheduleData, addUnavailAlerts } = useSchedule();

  // 내가 속한 모든 파트에서 불가일 수집
  const myPools = partPools.filter((p) => p.candidates.some((c) => c.name === currentUser));
  const myCandidate = myPools[0]?.candidates.find((c) => c.name === currentUser);

  const [unavailDates, setUnavailDates] = useState<Set<string>>(() => {
    const dates = new Set<string>();
    myPools.forEach((pool) => {
      const c = pool.candidates.find((c) => c.name === currentUser);
      c?.unavailableDates.forEach((d) => dates.add(d));
    });
    return dates;
  });

  const [saved, setSaved] = useState(false);

  const toggleDate = (day: number) => {
    const dateStr = makeDateStr(day);
    const next = new Set(unavailDates);
    if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
    setUnavailDates(next);
    setSaved(false);
  };

  const handleSave = () => {
    const datesArr = Array.from(unavailDates);
    // 모든 파트풀에서 내 불가일 업데이트
    myPools.forEach((pool) => {
      const c = pool.candidates.find((c) => c.name === currentUser);
      if (c) c.unavailableDates = datesArr;
    });

    // 스케줄에서 내가 배정된 날짜 중 불가일이 있는지 체크 → 알림 생성
    const alerts: UnavailAlert[] = [];
    datesArr.forEach((dateStr) => {
      const row = scheduleData.find((r) => r.date === dateStr);
      if (!row) return;
      row.services.forEach((svc, si) => {
        svc.slots.forEach((slot) => {
          if (!slot.members.some((m) => m.includes(currentUser))) return;
          // 대체 가능 멤버 찾기
          const pool = partPools.find((p) => p.role === slot.role);
          const suggestions = pool
            ? pool.candidates
                .filter((c) => c.name !== currentUser && !c.unavailableDates.includes(dateStr))
                .map((c) => c.name)
                .slice(0, 3)
            : [];

          const serviceLabel = svc.serviceLabel ? ` ${svc.serviceLabel}` : '';
          alerts.push({
            id: `unavail-${dateStr}-${si}-${slot.role}-${Date.now()}`,
            memberName: currentUser,
            date: dateStr,
            dayLabel: row.dayLabel,
            role: slot.role,
            roomId: `worship-${dateStr}-${si}`,
            roomName: `${row.dayLabel}${serviceLabel} 예배`,
            suggestions,
            resolved: false,
          });
        });
      });
    });

    if (alerts.length > 0) {
      addUnavailAlerts(alerts);
    }

    setSaved(true);
  };

  const sortedDates = Array.from(unavailDates).sort();

  return (
    <>
      <Stack.Screen
        options={{
          title: '불가 날짜 관리',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerBackTitle: '더보기',
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* Info */}
          <View style={[styles.infoBanner, { backgroundColor: `${Brand.primary}10`, borderColor: `${Brand.primary}25` }]}>
            <FontAwesome name="calendar-times-o" size={20} color={Brand.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>내 불가 날짜</Text>
              <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
                예배에 참여할 수 없는 날짜를 선택하세요.{'\n'}스케줄 자동생성 시 반영됩니다.
              </Text>
            </View>
          </View>

          {/* My Parts */}
          <View style={styles.partsRow}>
            <Text style={[styles.partsLabel, { color: colors.textSecondary }]}>내 파트:</Text>
            {myPools.map((p) => (
              <Badge key={p.role} label={p.role} />
            ))}
          </View>

          {/* Month Header */}
          <View style={styles.monthHeader}>
            <Text style={[styles.monthText, { color: colors.text }]}>2026년 4월</Text>
            <Text style={[styles.selectedCount, { color: unavailDates.size > 0 ? Brand.pink : colors.textSecondary }]}>
              {unavailDates.size}일 불가
            </Text>
          </View>

          {/* Calendar */}
          <Card>
            <View style={styles.calHeaderRow}>
              {days.map((day, i) => (
                <View key={i} style={styles.calHeaderCell}>
                  <Text style={[styles.calHeaderText, { color: i === 0 ? Brand.pink : colors.textSecondary }]}>
                    {i === 0 ? '주일' : day}
                  </Text>
                </View>
              ))}
            </View>

            {weeks.map((week, wi) => (
              <View key={wi} style={styles.calWeekRow}>
                {week.map((day, di) => {
                  if (day === null) return <View key={di} style={styles.calCell} />;
                  const dateStr = makeDateStr(day);
                  const isUnavail = unavailDates.has(dateStr);
                  return (
                    <Pressable
                      key={di}
                      onPress={() => toggleDate(day)}
                      style={[
                        styles.calCell,
                        isUnavail && { backgroundColor: Brand.pink, borderRadius: 12 },
                      ]}
                    >
                      <Text style={[
                        styles.calDayText,
                        { color: isUnavail ? '#fff' : di === 0 ? Brand.pink : colors.text },
                      ]}>
                        {day}
                      </Text>
                      {isUnavail && (
                        <Text style={styles.calUnavailText}>불가</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </Card>

          {/* Selected Dates Summary */}
          {sortedDates.length > 0 && (
            <>
              <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>선택된 불가 날짜</Text>
              <View style={styles.dateChips}>
                {sortedDates.map((d) => {
                  const dayNum = parseInt(d.split('-')[2]);
                  const dayOfWeek = new Date(parseInt(d.split('-')[0]), parseInt(d.split('-')[1]) - 1, dayNum).getDay();
                  return (
                    <Pressable
                      key={d}
                      onPress={() => toggleDate(dayNum)}
                      style={[styles.dateChip, { backgroundColor: `${Brand.pink}15`, borderColor: Brand.pink }]}
                    >
                      <Text style={[styles.dateChipText, { color: Brand.pink }]}>
                        {dayNum}일 ({days[dayOfWeek]})
                      </Text>
                      <FontAwesome name="times" size={10} color={Brand.pink} />
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            style={[styles.saveBtn, saved && { backgroundColor: Brand.accent }]}
          >
            <FontAwesome name={saved ? 'check' : 'save'} size={16} color="#fff" />
            <Text style={styles.saveBtnText}>
              {saved ? '저장 완료!' : '불가 날짜 저장'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  // Info
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    padding: 18, borderRadius: 14, borderWidth: 1, marginBottom: 16,
  },
  infoTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  infoDesc: { fontSize: 13, lineHeight: 20 },
  // Parts
  partsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  partsLabel: { fontSize: 13, fontWeight: '600' },
  // Month
  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  monthText: { fontSize: 18, fontWeight: '800' },
  selectedCount: { fontSize: 14, fontWeight: '700' },
  // Calendar
  calHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  calHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  calHeaderText: { fontSize: 12, fontWeight: '600' },
  calWeekRow: { flexDirection: 'row' },
  calCell: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, minHeight: 56,
  },
  calDayText: { fontSize: 16, fontWeight: '700' },
  calUnavailText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  // Summary
  summaryTitle: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 10 },
  dateChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
  },
  dateChipText: { fontSize: 13, fontWeight: '600' },
  // Save
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Brand.primary, paddingVertical: 18,
    borderRadius: 14, marginTop: 24, marginBottom: 40,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
