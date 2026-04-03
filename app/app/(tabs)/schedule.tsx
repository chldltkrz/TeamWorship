import { StyleSheet, ScrollView, View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { schedules } from '@/constants/MockData';

const days = ['일', '월', '화', '수', '목', '금', '토'];
const today = new Date();

function getWeekDates() {
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function ScheduleScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [selectedDay, setSelectedDay] = useState(today.getDay());
  const weekDates = getWeekDates();

  const filteredSchedules = schedules.filter((s) => {
    const d = new Date(s.date);
    return d.getDay() === selectedDay;
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Week Selector */}
      <View style={[styles.weekRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {weekDates.map((date, i) => {
          const isSelected = i === selectedDay;
          const isToday = date.toDateString() === today.toDateString();
          return (
            <Pressable
              key={i}
              onPress={() => setSelectedDay(i)}
              style={[
                styles.dayItem,
                isSelected && { backgroundColor: Brand.primary, borderRadius: 14 },
              ]}
            >
              <Text style={[
                styles.dayLabel,
                { color: isSelected ? '#fff' : colors.textSecondary },
                i === 0 && { color: isSelected ? '#fff' : Brand.pink },
              ]}>
                {days[i]}
              </Text>
              <Text style={[
                styles.dayNumber,
                { color: isSelected ? '#fff' : colors.text },
              ]}>
                {date.getDate()}
              </Text>
              {isToday && !isSelected && (
                <View style={styles.todayDot} />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: Brand.primary }]}>{schedules.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>이번주 전체</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: Brand.accent }]}>
              {schedules.filter(s => s.status === 'confirmed').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>확정</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: Brand.orange }]}>
              {schedules.filter(s => s.status === 'pending').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>조율중</Text>
          </View>
        </View>

        {/* Schedule List */}
        <SectionHeader
          title={`${days[selectedDay]}요일 스케줄`}
          actionLabel="+ 추가"
        />

        {filteredSchedules.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>📭</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {days[selectedDay]}요일에 예정된 스케줄이 없습니다
              </Text>
            </View>
          </Card>
        ) : (
          filteredSchedules.map((schedule) => (
            <Card key={schedule.id}>
              <View style={styles.scheduleHeader}>
                <View>
                  <Text style={[styles.scheduleTitle, { color: colors.text }]}>
                    {schedule.title}
                  </Text>
                  <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>
                    {schedule.time}
                  </Text>
                </View>
                <Badge
                  label={schedule.status === 'confirmed' ? '확정' : '조율중'}
                  variant={schedule.status === 'confirmed' ? 'success' : 'warning'}
                />
              </View>
              <View style={styles.memberRow}>
                {schedule.members.map((member, i) => (
                  <View key={member.id} style={[styles.memberChip, { marginLeft: i > 0 ? -8 : 0 }]}>
                    <Avatar name={member.name} color={member.color} size={32} />
                  </View>
                ))}
                <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
                  {schedule.members.length}명 참여
                </Text>
              </View>
            </Card>
          ))
        )}

        {/* Upcoming */}
        <SectionHeader title="다가오는 일정" actionLabel="전체 보기" />
        {schedules.slice(0, 3).map((schedule) => (
          <Card key={`upcoming-${schedule.id}`}>
            <View style={styles.upcomingRow}>
              <View style={[styles.upcomingDate, { backgroundColor: `${Brand.primary}20` }]}>
                <Text style={[styles.upcomingDateText, { color: Brand.primary }]}>
                  {new Date(schedule.date).getDate()}
                </Text>
                <Text style={[styles.upcomingDayText, { color: Brand.primary }]}>
                  {days[new Date(schedule.date).getDay()]}
                </Text>
              </View>
              <View style={styles.upcomingInfo}>
                <Text style={[styles.scheduleTitle, { color: colors.text }]}>
                  {schedule.title}
                </Text>
                <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>
                  {schedule.time} · {schedule.members.length}명
                </Text>
              </View>
              <Badge
                label={schedule.status === 'confirmed' ? '확정' : '조율중'}
                variant={schedule.status === 'confirmed' ? 'success' : 'warning'}
              />
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  weekRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  dayNumber: { fontSize: 16, fontWeight: '700' },
  todayDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: Brand.primary,
    marginTop: 4,
  },
  content: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    borderRadius: 14, borderWidth: 1,
  },
  statNumber: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  scheduleHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 14,
  },
  scheduleTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  scheduleTime: { fontSize: 13 },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
  memberChip: {},
  memberCount: { fontSize: 13, marginLeft: 12, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, fontWeight: '500' },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  upcomingDate: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  upcomingDateText: { fontSize: 18, fontWeight: '800', lineHeight: 20 },
  upcomingDayText: { fontSize: 11, fontWeight: '600' },
  upcomingInfo: { flex: 1 },
});
