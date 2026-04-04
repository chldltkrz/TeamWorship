import { StyleSheet, ScrollView, View, Text, Pressable, Platform } from 'react-native';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { partPools } from '@/constants/MockData';
import { useSchedule } from '@/constants/ScheduleContext';
import type { PartRole, MonthlyScheduleRow, ServiceAssignment } from '@/constants/Types';

const days = ['일', '월', '화', '수', '목', '금', '토'];
const today = new Date();
type ViewMode = 'week' | 'generate' | 'full';

const roleColors: Record<string, string> = {
  '예배인도': '#6C63FF', '기타': '#43B89C', '건반': '#F5A623', '일렉': '#FF6584',
  '베이스': '#0984E3', '드럼': '#E84393', '싱어': '#FD79A8', '음향': '#00B894',
  'PPT': '#00B894', '온라인': '#636E72',
};

// 로컬 시간대 기준 YYYY-MM-DD
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekDates() {
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// 자동 스케줄 생성 알고리즘 (날짜 기반)
function autoGenerate(
  selectedDates: Set<string>,
  servicesPerDate: Record<string, number>,
  year: number,
  month: number,
): MonthlyScheduleRow[] {
  const result: MonthlyScheduleRow[] = [];
  const d = new Date(year, month, 1);

  const counters: Record<string, number> = {};
  partPools.forEach((p) => { counters[p.role] = 0; });

  while (d.getMonth() === month) {
    const dateStr = toLocalDateStr(d);
    if (selectedDates.has(dateStr)) {
      const dayChar = days[d.getDay()];
      const numServices = servicesPerDate[dateStr] || 1;

      // 이 날짜 전체에서 이미 배정된 사람 (부 간 중복 허용하되 같은 부 내에서는 겹치지 않게)
      const services: ServiceAssignment[] = [];
      for (let si = 0; si < numServices; si++) {
        const slots: { role: PartRole; members: string[] }[] = [];
        const usedInThisService = new Set<string>();

        for (const pool of partPools) {
          // 불가일인 사람 제외 + 이 부에서 이미 다른 파트에 배정된 사람 제외
          const available = pool.candidates.filter(
            (c) => !c.unavailableDates.includes(dateStr) && !usedInThisService.has(c.name)
          );
          if (available.length === 0) continue;

          // 싱어는 2명, 음향은 2명, 나머지 1명
          const count = (pool.role === '싱어' || pool.role === '음향') ? Math.min(2, available.length) : 1;
          const picked: string[] = [];

          for (let k = 0; k < count; k++) {
            // 아직 안 뽑힌 사람 중에서 라운드로빈
            const remaining = available.filter((c) => !picked.includes(c.name));
            if (remaining.length === 0) break;
            const idx = counters[pool.role] % remaining.length;
            const member = remaining[idx];
            picked.push(member.name);
            usedInThisService.add(member.name);
            counters[pool.role]++;
          }

          if (picked.length > 0) {
            slots.push({ role: pool.role, members: picked });
          }
        }

        services.push({
          serviceLabel: numServices > 1 ? `${si + 1}부` : undefined,
          slots,
        });
      }

      result.push({
        date: dateStr,
        dayLabel: `${d.getDate()}일 (${dayChar})`,
        services,
      });
    }
    d.setDate(d.getDate() + 1);
  }

  return result;
}

// ============ WEEK VIEW ============
function WeekView({ scheduleData }: { scheduleData: MonthlyScheduleRow[] }) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { unavailAlerts } = useSchedule();
  const [selectedDay, setSelectedDay] = useState(today.getDay());
  const weekDates = getWeekDates();

  const selectedDate = weekDates[selectedDay];
  const dateStr = toLocalDateStr(selectedDate);
  const monthRow = scheduleData.find((r) => r.date === dateStr);

  return (
    <ScrollView style={{ flex: 1 }}>
      {/* Week Selector */}
      <View style={[styles.weekRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {weekDates.map((date, i) => {
          const isSelected = i === selectedDay;
          const isToday = date.toDateString() === today.toDateString();
          const hasSchedule = scheduleData.some((r) => r.date === toLocalDateStr(date));
          return (
            <Pressable
              key={i}
              onPress={() => setSelectedDay(i)}
              style={[styles.dayItem, isSelected && { backgroundColor: Brand.primary, borderRadius: 14 }]}
            >
              <Text style={[styles.dayLabel, { color: isSelected ? '#fff' : colors.textSecondary }, i === 0 && !isSelected && { color: Brand.pink }]}>
                {days[i]}
              </Text>
              <Text style={[styles.dayNumber, { color: isSelected ? '#fff' : colors.text }]}>
                {date.getDate()}
              </Text>
              {isToday && !isSelected && <View style={styles.todayDot} />}
              {hasSchedule && !isSelected && <View style={[styles.scheduleDot, { backgroundColor: Brand.accent }]} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: Brand.primary }]}>{scheduleData.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>이번달 전체</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: Brand.accent }]}>
              {scheduleData.filter((r) => r.services.length > 1).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>주일 (2부)</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: Brand.orange }]}>
              {scheduleData.filter((r) => r.note).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>특별 일정</Text>
          </View>
        </View>

        {/* Selected Day Detail */}
        <SectionHeader title={`${selectedDate.getMonth() + 1}/${selectedDate.getDate()} (${days[selectedDay]}) 스케줄`} />

        {monthRow ? (
          monthRow.services.map((svc, si) => (
            <Card key={si}>
              {svc.serviceLabel && (
                <View style={styles.serviceLabelRow}>
                  <Badge label={svc.serviceLabel} variant="default" />
                  {monthRow.note && si === 0 && (
                    <Badge label={monthRow.note} variant="warning" />
                  )}
                </View>
              )}
              {!svc.serviceLabel && monthRow.note && (
                <View style={[styles.serviceLabelRow, { marginBottom: 10 }]}>
                  <Badge label={monthRow.note} variant="warning" />
                </View>
              )}
              {svc.slots.map((slot) => (
                <View key={slot.role} style={styles.slotRow}>
                  <View style={[styles.roleTag, { backgroundColor: `${roleColors[slot.role] || Brand.primary}18` }]}>
                    <Text style={[styles.roleText, { color: roleColors[slot.role] || Brand.primary }]}>
                      {slot.role}
                    </Text>
                  </View>
                  <Text style={[styles.slotMembers, { color: colors.text }]} numberOfLines={1}>
                    {slot.members.map((m) => {
                      const hasAlert = unavailAlerts.some((a) => a.memberName === m && a.date === dateStr && !a.resolved);
                      return hasAlert ? `⚠️ ${m}` : m;
                    }).join(', ')}
                  </Text>
                </View>
              ))}
            </Card>
          ))
        ) : (
          <Card>
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📭</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {days[selectedDay]}요일에 예정된 스케줄이 없습니다
              </Text>
            </View>
          </Card>
        )}

        {/* Upcoming */}
        <SectionHeader title="다가오는 일정" />
        {scheduleData.filter((r) => r.date > dateStr && r.date >= toLocalDateStr(today)).slice(0, 4).map((row) => (
          <Card key={row.date}>
            <View style={styles.upcomingRow}>
              <View style={[styles.upcomingDate, { backgroundColor: `${Brand.primary}20` }]}>
                <Text style={[styles.upcomingDateText, { color: Brand.primary }]}>
                  {parseInt(row.dayLabel)}
                </Text>
                <Text style={[styles.upcomingDayText, { color: Brand.primary }]}>
                  {row.dayLabel.match(/\((.)\)/)?.[1] || ''}
                </Text>
              </View>
              <View style={styles.upcomingInfo}>
                <Text style={[styles.upcomingTitle, { color: colors.text }]}>
                  {row.dayLabel.replace('(일)', '(주일)')}{row.services.length > 1 ? ` (${row.services.length}부)` : ''} 예배
                </Text>
                {row.note && (
                  <Text style={[styles.upcomingNote, { color: Brand.orange }]}>{row.note}</Text>
                )}
                <Text style={[styles.upcomingMeta, { color: colors.textSecondary }]}>
                  {row.services[0].slots.length}개 파트 · {row.services[0].slots.flatMap(s => s.members).filter(Boolean).length}명 배정
                </Text>
              </View>
              <FontAwesome name="angle-right" size={18} color={colors.textSecondary} />
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

// ============ AUTO GENERATE VIEW ============
interface GenerateState {
  selectedDates: Set<string>;       // 선택된 날짜 (YYYY-MM-DD)
  servicesPerDate: Record<string, number>; // 날짜별 부수
  generated: boolean;
}

// 월간 캘린더 데이터 생성
function getMonthCalendar(year: number, month: number) {
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

function GenerateView({
  onGenerate,
  state,
  onStateChange,
}: {
  onGenerate: (data: MonthlyScheduleRow[]) => void;
  state: GenerateState;
  onStateChange: (s: GenerateState) => void;
}) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<{ role: string; memberId: string; name: string } | null>(null);
  const [tempUnavail, setTempUnavail] = useState<Set<string>>(new Set());

  const { selectedDates, servicesPerDate, generated } = state;
  const year = 2026;
  const month = 3; // April (0-indexed)
  const weeks = useMemo(() => getMonthCalendar(year, month), []);

  const makeDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const toggleDate = (day: number) => {
    const dateStr = makeDateStr(day);
    const next = new Set(selectedDates);
    const nextServices = { ...servicesPerDate };
    if (next.has(dateStr)) {
      next.delete(dateStr);
      delete nextServices[dateStr];
    } else {
      next.add(dateStr);
      nextServices[dateStr] = 1;
    }
    onStateChange({ ...state, selectedDates: next, servicesPerDate: nextServices, generated: false });
  };

  const toggleWeekday = (dayIndex: number) => {
    // 해당 요일의 모든 날짜
    const datesOfDay: string[] = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      if (d.getDay() === dayIndex) datesOfDay.push(toLocalDateStr(d));
      d.setDate(d.getDate() + 1);
    }
    const allSelected = datesOfDay.every((dt) => selectedDates.has(dt));
    const next = new Set(selectedDates);
    const nextServices = { ...servicesPerDate };
    datesOfDay.forEach((dt) => {
      if (allSelected) { next.delete(dt); delete nextServices[dt]; }
      else { next.add(dt); if (!nextServices[dt]) nextServices[dt] = 1; }
    });
    onStateChange({ ...state, selectedDates: next, servicesPerDate: nextServices, generated: false });
  };

  const cycleServiceCount = (dateStr: string) => {
    const current = servicesPerDate[dateStr] || 1;
    onStateChange({
      ...state,
      servicesPerDate: { ...servicesPerDate, [dateStr]: current >= 3 ? 1 : current + 1 },
      generated: false,
    });
  };

  // 요일별 전체 선택 상태
  const weekdayStatus = (dayIndex: number) => {
    const d = new Date(year, month, 1);
    const dates: string[] = [];
    while (d.getMonth() === month) {
      if (d.getDay() === dayIndex) dates.push(toLocalDateStr(d));
      d.setDate(d.getDate() + 1);
    }
    const count = dates.filter((dt) => selectedDates.has(dt)).length;
    return { total: dates.length, selected: count, all: count === dates.length };
  };

  const selectedCount = selectedDates.size;

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.content}>
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: `${Brand.primary}10`, borderColor: `${Brand.primary}30` }]}>
          <FontAwesome name="magic" size={20} color={Brand.primary} />
          <View style={styles.infoBannerText}>
            <Text style={[styles.infoBannerTitle, { color: colors.text }]}>스케줄 자동 생성</Text>
            <Text style={[styles.infoBannerDesc, { color: colors.textSecondary }]}>
              예배 날짜를 선택하고 파트별 멤버를 설정하면{'\n'}겹치지 않게 자동으로 배정합니다
            </Text>
          </View>
        </View>

        {/* Month Header */}
        <View style={styles.monthSelector}>
          <Pressable style={styles.monthNav}>
            <FontAwesome name="chevron-left" size={14} color={colors.textSecondary} />
          </Pressable>
          <Text style={[styles.monthText, { color: colors.text }]}>2026년 4월</Text>
          <Pressable style={styles.monthNav}>
            <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Weekday Quick Select */}
        <View style={styles.weekdayQuickRow}>
          {days.map((day, i) => {
            const ws = weekdayStatus(i);
            return (
              <Pressable
                key={i}
                onPress={() => toggleWeekday(i)}
                style={[
                  styles.weekdayQuickBtn,
                  ws.all ? { backgroundColor: Brand.primary }
                    : ws.selected > 0 ? { backgroundColor: `${Brand.primary}40` }
                    : { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <Text style={[
                  styles.weekdayQuickText,
                  { color: ws.all || ws.selected > 0 ? '#fff' : colors.textSecondary },
                  i === 0 && ws.selected === 0 && { color: Brand.pink },
                ]}>
                  {i === 0 ? '주일' : day}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Calendar Grid */}
        <Card>
          {/* Calendar Header */}
          <View style={styles.calendarHeaderRow}>
            {days.map((day, i) => (
              <View key={i} style={styles.calendarHeaderCell}>
                <Text style={[
                  styles.calendarHeaderText,
                  { color: i === 0 ? Brand.pink : colors.textSecondary },
                ]}>
                  {i === 0 ? '주일' : day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Weeks */}
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.calendarWeekRow}>
              {week.map((day, di) => {
                if (day === null) return <View key={di} style={styles.calendarCell} />;
                const dateStr = makeDateStr(day);
                const isSelected = selectedDates.has(dateStr);
                const svcCount = servicesPerDate[dateStr] || 1;
                return (
                  <Pressable
                    key={di}
                    onPress={() => toggleDate(day)}
                    onLongPress={() => { if (isSelected) cycleServiceCount(dateStr); }}
                    style={[
                      styles.calendarCell,
                      isSelected && { backgroundColor: Brand.primary, borderRadius: 10 },
                    ]}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      { color: isSelected ? '#fff' : di === 0 ? Brand.pink : colors.text },
                    ]}>
                      {day}
                    </Text>
                    {isSelected && (
                      <Pressable onPress={() => cycleServiceCount(dateStr)}>
                        <Text style={styles.calendarSvcText}>{svcCount}부</Text>
                      </Pressable>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}

          <Text style={[styles.calendarHint, { color: colors.textSecondary }]}>
            탭: 날짜 선택/해제 · 부수 탭하여 변경 (1→2→3부)
          </Text>
        </Card>

        {/* Selected Summary */}
        {selectedCount > 0 && (
          <View style={[styles.selectedSummary, { backgroundColor: `${Brand.accent}10`, borderColor: `${Brand.accent}30` }]}>
            <FontAwesome name="calendar-check-o" size={16} color={Brand.accent} />
            <Text style={[styles.selectedSummaryText, { color: colors.text }]}>
              {selectedCount}개 예배일 선택됨
            </Text>
          </View>
        )}

        {/* Part Pools */}
        <SectionHeader title="파트별 멤버 관리" actionLabel="멤버 관리" />

        {partPools.map((pool) => {
          const isExpanded = expandedRole === pool.role;
          const unavailableCount = pool.candidates.filter((c) => c.unavailableDates.length > 0).length;

          return (
            <Card key={pool.role}>
              <Pressable
                onPress={() => setExpandedRole(isExpanded ? null : pool.role)}
                style={styles.poolHeader}
              >
                <View style={[styles.roleTag, { backgroundColor: `${roleColors[pool.role] || Brand.primary}18` }]}>
                  <Text style={[styles.roleText, { color: roleColors[pool.role] || Brand.primary }]}>
                    {pool.role}
                  </Text>
                </View>
                <View style={styles.poolHeaderRight}>
                  <Text style={[styles.poolCount, { color: colors.textSecondary }]}>
                    {pool.candidates.length}명
                  </Text>
                  {unavailableCount > 0 && (
                    <Badge label={`${unavailableCount}명 불가일 있음`} variant="warning" />
                  )}
                  <FontAwesome
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color={colors.textSecondary}
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <View style={styles.poolExpanded}>
                  {pool.candidates.map((c) => (
                    <View key={c.memberId} style={[styles.candidateRow, { borderTopColor: colors.border }]}>
                      <Avatar name={c.name} color={c.color} size={32} />
                      <View style={styles.candidateInfo}>
                        <Text style={[styles.candidateName, { color: colors.text }]}>{c.name}</Text>
                        {c.unavailableDates.length > 0 ? (
                          <Text style={[styles.candidateUnavail, { color: Brand.orange }]}>
                            불가: {c.unavailableDates.map((d) => d.split('-')[2] + '일').join(', ')}
                          </Text>
                        ) : (
                          <Text style={[styles.candidateAvail, { color: Brand.accent }]}>전체 가능</Text>
                        )}
                      </View>
                      <Pressable
                        onPress={() => {
                          setEditingMember({ role: pool.role, memberId: c.memberId, name: c.name });
                          setTempUnavail(new Set(c.unavailableDates));
                        }}
                        style={[styles.editUnavailBtn, { borderColor: colors.border }]}
                      >
                        <FontAwesome name="calendar-times-o" size={13} color={colors.textSecondary} />
                      </Pressable>
                      <Pressable style={[styles.removeBtn, { backgroundColor: `${Brand.pink}15` }]}>
                        <FontAwesome name="times" size={13} color={Brand.pink} />
                      </Pressable>
                    </View>
                  ))}
                  <Pressable style={[styles.addCandidateBtn, { borderColor: colors.border }]}>
                    <FontAwesome name="user-plus" size={12} color={Brand.primary} />
                    <Text style={[styles.addCandidateText, { color: Brand.primary }]}>멤버 추가</Text>
                  </Pressable>
                </View>
              )}
            </Card>
          );
        })}

        {/* Generate Button */}
        <Pressable
          style={[styles.generateBtn, generated && styles.generateBtnDone]}
          onPress={() => {
            const result = autoGenerate(selectedDates, servicesPerDate, 2026, 3);
            onGenerate(result);
            onStateChange({ ...state, generated: true });
          }}
        >
          <FontAwesome name={generated ? 'check' : 'magic'} size={18} color="#fff" />
          <Text style={styles.generateBtnText}>
            {generated
              ? `${selectedCount}개 일정이 생성되었습니다!`
              : `4월 스케줄 자동 생성 (${selectedCount}개 일정)`}
          </Text>
        </Pressable>

        {generated && (
          <Text style={[styles.generatedHint, { color: colors.textSecondary }]}>
            주간 · 전체보기 탭에서 결과를 확인하세요
          </Text>
        )}
      </View>

      {/* 불가일 캘린더 모달 */}
      {editingMember && (
        <View style={[styles.unavailModal, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.unavailContent, { backgroundColor: colors.surface }]}>
            <View style={styles.unavailHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.unavailTitle, { color: colors.text }]}>
                  {editingMember.name} 불가 날짜
                </Text>
                <Text style={[styles.unavailSubtitle, { color: colors.textSecondary }]}>
                  불가한 날짜를 탭하세요 ({tempUnavail.size}일 선택)
                </Text>
              </View>
              <Pressable onPress={() => setEditingMember(null)} style={{ padding: 4 }}>
                <FontAwesome name="times" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Mini Calendar */}
            <View style={styles.unavailCalHeader}>
              {days.map((day, i) => (
                <View key={i} style={styles.calendarHeaderCell}>
                  <Text style={[styles.calendarHeaderText, { color: i === 0 ? Brand.pink : colors.textSecondary }]}>
                    {i === 0 ? '주일' : day}
                  </Text>
                </View>
              ))}
            </View>
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.calendarWeekRow}>
                {week.map((day, di) => {
                  if (day === null) return <View key={di} style={styles.calendarCell} />;
                  const dateStr = makeDateStr(day);
                  const isUnavail = tempUnavail.has(dateStr);
                  return (
                    <Pressable
                      key={di}
                      onPress={() => {
                        const next = new Set(tempUnavail);
                        if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
                        setTempUnavail(next);
                      }}
                      style={[
                        styles.calendarCell,
                        isUnavail && { backgroundColor: Brand.pink, borderRadius: 10 },
                      ]}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        { color: isUnavail ? '#fff' : di === 0 ? Brand.pink : colors.text },
                        { fontSize: 14 },
                      ]}>
                        {day}
                      </Text>
                      {isUnavail && (
                        <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>불가</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {/* Confirm / Cancel */}
            <View style={styles.unavailActions}>
              <Pressable
                onPress={() => setEditingMember(null)}
                style={[styles.unavailCancelBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.unavailCancelText, { color: colors.textSecondary }]}>취소</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  // partPools에서 해당 멤버의 unavailableDates 업데이트
                  const pool = partPools.find((p) => p.role === editingMember.role);
                  const candidate = pool?.candidates.find((c) => c.memberId === editingMember.memberId);
                  if (candidate) {
                    candidate.unavailableDates = Array.from(tempUnavail);
                  }
                  setEditingMember(null);
                  onStateChange({ ...state, generated: false });
                }}
                style={styles.unavailConfirmBtn}
              >
                <FontAwesome name="check" size={14} color="#fff" />
                <Text style={styles.unavailConfirmText}>확인 ({tempUnavail.size}일)</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ============ FULL SCHEDULE TABLE VIEW ============
function FullScheduleView({
  scheduleData,
  onUpdate,
}: {
  scheduleData: MonthlyScheduleRow[];
  onUpdate: (data: MonthlyScheduleRow[]) => void;
}) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { unavailAlerts } = useSchedule();
  const [editingCell, setEditingCell] = useState<{
    date: string; si: number; role: PartRole;
  } | null>(null);

  const roles: PartRole[] = ['예배인도', '기타', '건반', '일렉', '베이스', '드럼', '싱어', '음향', '온라인'];

  const getMembers = (row: MonthlyScheduleRow, serviceIdx: number, role: PartRole): string => {
    const svc = row.services[serviceIdx];
    if (!svc) return '';
    const slot = svc.slots.find((s) => s.role === role);
    if (!slot) return '·';
    return slot.members.map((m) => {
      const hasAlert = unavailAlerts.some((a) => a.memberName === m && a.date === row.date && !a.resolved);
      return hasAlert ? `⚠️${m}` : m;
    }).join(' ');
  };

  const handleSelectMember = (memberName: string) => {
    if (!editingCell) return;
    const { date, si, role } = editingCell;
    const updated = scheduleData.map((row) => {
      if (row.date !== date) return row;
      const newServices = row.services.map((svc, idx) => {
        if (idx !== si) return svc;
        const slotExists = svc.slots.find((s) => s.role === role);
        if (slotExists) {
          return {
            ...svc,
            slots: svc.slots.map((s) =>
              s.role === role ? { ...s, members: memberName ? [memberName] : [] } : s
            ),
          };
        }
        if (!memberName) return svc;
        return {
          ...svc,
          slots: [...svc.slots, { role, members: [memberName] }],
        };
      });
      return { ...row, services: newServices };
    });
    onUpdate(updated);
    setEditingCell(null);
  };

  const editingPool = editingCell ? partPools.find((p) => p.role === editingCell.role) : null;
  const editingRow = editingCell ? scheduleData.find((r) => r.date === editingCell.date) : null;
  const editingCurrent = editingCell && editingRow
    ? getMembers(editingRow, editingCell.si, editingCell.role) : '';

  const dayBgColors: Record<string, string> = {
    '수': 'rgba(67,184,156,0.08)',
    '금': 'rgba(245,166,35,0.08)',
    '일': 'rgba(108,99,255,0.08)',
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={[styles.content, { paddingHorizontal: 8 }]}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableTitle, { color: colors.text }]}>2026년 4월 예배 일정</Text>
          <Text style={[styles.tableSubtitle, { color: colors.textSecondary }]}>수, 금, 주일</Text>
        </View>

        {/* Table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View>
            {/* Header Row */}
            <View style={[styles.tableRow, { backgroundColor: Brand.primary }]}>
              <View style={[styles.tableCell, styles.dateCellHeader]}>
                <Text style={styles.headerText}>날짜</Text>
              </View>
              {roles.map((role) => (
                <View key={role} style={[styles.tableCell, styles.roleCellHeader]}>
                  <Text style={styles.headerText} numberOfLines={1}>{role}</Text>
                </View>
              ))}
            </View>

            {/* Data Rows */}
            {scheduleData.map((row) => {
              const dayChar = row.dayLabel.match(/\((.)\)/)?.[1] || '';
              const bgColor = dayBgColors[dayChar] || 'transparent';
              const multiService = row.services.length > 1;

              return (
                <View key={row.date}>
                  {row.services.map((svc, si) => (
                    <View
                      key={`${row.date}-${si}`}
                      style={[
                        styles.tableRow,
                        {
                          backgroundColor: bgColor,
                          borderBottomColor: si < row.services.length - 1 ? 'transparent' : colors.border,
                        },
                      ]}
                    >
                      <View style={[styles.tableCell, styles.dateCell]}>
                        {si === 0 ? (
                          <>
                            <Text style={[styles.dateCellText, { color: colors.text }]}>
                              {row.dayLabel}
                            </Text>
                            {row.note && (
                              <Text style={[styles.dateCellNote, { color: Brand.orange }]} numberOfLines={1}>
                                {row.note}
                              </Text>
                            )}
                          </>
                        ) : (
                          <Text style={[styles.dateCellText, { color: colors.textSecondary, fontSize: 11 }]}>
                            ({svc.serviceLabel || `${si + 1}부`})
                          </Text>
                        )}
                      </View>
                      {roles.map((role) => {
                        const isEditing = editingCell?.date === row.date && editingCell?.si === si && editingCell?.role === role;
                        const currentMembers = getMembers(row, si, role);

                        return (
                          <View key={role} style={[styles.tableCell, styles.roleCell]}>
                            <Pressable
                              onPress={() => setEditingCell(isEditing ? null : { date: row.date, si, role })}
                              style={[
                                styles.editableCell,
                                isEditing && { backgroundColor: `${Brand.primary}20`, borderColor: Brand.primary },
                              ]}
                            >
                              <Text
                                style={[styles.cellText, { color: currentMembers === '·' ? colors.textSecondary : colors.text }]}
                                numberOfLines={2}
                              >
                                {currentMembers}
                              </Text>
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Member Picker Panel */}
        {editingCell && editingPool && (
          <View style={[styles.pickerPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.pickerHeader}>
              <View style={[styles.roleTag, { backgroundColor: `${roleColors[editingCell.role] || Brand.primary}18` }]}>
                <Text style={[styles.roleText, { color: roleColors[editingCell.role] || Brand.primary }]}>
                  {editingCell.role}
                </Text>
              </View>
              <Text style={[styles.pickerDate, { color: colors.textSecondary }]}>
                {editingRow?.dayLabel}{editingCell.si > 0 ? ` ${editingCell.si + 1}부` : ''}
              </Text>
              <Text style={[styles.pickerCurrent, { color: colors.text }]}>
                현재: {editingCurrent || '없음'}
              </Text>
              <Pressable onPress={() => setEditingCell(null)} style={styles.pickerClose}>
                <FontAwesome name="times" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.pickerList}>
              {editingPool.candidates.map((c) => {
                const isUnavailable = c.unavailableDates.includes(editingCell.date);
                const isCurrent = editingCurrent.includes(c.name);
                return (
                  <Pressable
                    key={c.memberId}
                    onPress={isUnavailable ? undefined : () => handleSelectMember(c.name)}
                    disabled={isUnavailable}
                    style={[
                      styles.pickerItem,
                      { borderColor: colors.border },
                      isCurrent && { backgroundColor: `${Brand.primary}15`, borderColor: Brand.primary },
                      isUnavailable && { opacity: 0.4, backgroundColor: `${Brand.pink}08` },
                    ]}
                  >
                    <View style={[styles.dropdownDot, { backgroundColor: isUnavailable ? '#999' : c.color }]} />
                    <Text style={[styles.pickerName, { color: isUnavailable ? colors.textSecondary : colors.text }]}>
                      {c.name}
                    </Text>
                    {isUnavailable && (
                      <Text style={[styles.dropdownUnavail, { color: Brand.pink }]}>불가</Text>
                    )}
                    {isCurrent && !isUnavailable && (
                      <FontAwesome name="check" size={12} color={Brand.primary} />
                    )}
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => handleSelectMember('')}
                style={[styles.pickerItem, { borderColor: colors.border }]}
              >
                <FontAwesome name="times-circle" size={14} color={colors.textSecondary} />
                <Text style={[styles.pickerName, { color: colors.textSecondary }]}>비우기</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legendRow}>
          {[
            { color: 'rgba(67,184,156,0.3)', label: '수요 예배' },
            { color: 'rgba(245,166,35,0.3)', label: '금요 예배' },
            { color: 'rgba(108,99,255,0.3)', label: '주일 예배' },
          ].map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>{l.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ============ MAIN SCREEN ============
export default function ScheduleScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const params = useLocalSearchParams<{ view?: string }>();
  const [view, setView] = useState<ViewMode>('week');

  useEffect(() => {
    if (params.view === 'generate') setView('generate');
    else if (params.view === 'full') setView('full');
  }, [params.view]);
  const { scheduleData, setScheduleData } = useSchedule();
  const [genState, setGenState] = useState<GenerateState>(() => {
    // 기본값: 수(3), 금(5), 일(0) 요일의 모든 날짜 선택
    const dates = new Set<string>();
    const svc: Record<string, number> = {};
    const d = new Date(2026, 3, 1);
    while (d.getMonth() === 3) {
      const day = d.getDay();
      if (day === 0 || day === 3 || day === 5) {
        const ds = toLocalDateStr(d);
        dates.add(ds);
        svc[ds] = day === 0 ? 2 : 1; // 주일 2부, 수/금 1부
      }
      d.setDate(d.getDate() + 1);
    }
    return { selectedDates: dates, servicesPerDate: svc, generated: false };
  });

  const handleGenerate = useCallback((data: MonthlyScheduleRow[]) => {
    setScheduleData(data);
  }, [setScheduleData]);

  const viewTabs: { key: ViewMode; icon: string; label: string }[] = [
    { key: 'week', icon: 'calendar', label: '주간' },
    { key: 'generate', icon: 'magic', label: '자동생성' },
    { key: 'full', icon: 'table', label: '전체보기' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* View Mode Tabs */}
      <View style={[styles.viewTabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {viewTabs.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setView(t.key)}
            style={[styles.viewTab, view === t.key && styles.viewTabActive]}
          >
            <FontAwesome
              name={t.icon as any}
              size={14}
              color={view === t.key ? Brand.primary : colors.textSecondary}
            />
            <Text style={[
              styles.viewTabText,
              { color: view === t.key ? Brand.primary : colors.textSecondary },
            ]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === 'week' && <WeekView scheduleData={scheduleData} />}
      {view === 'generate' && <GenerateView onGenerate={handleGenerate} state={genState} onStateChange={setGenState} />}
      {view === 'full' && <FullScheduleView scheduleData={scheduleData} onUpdate={setScheduleData} />}
    </View>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  container: { flex: 1 },

  // View Tabs
  viewTabs: { flexDirection: 'row', borderBottomWidth: 1 },
  viewTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12,
  },
  viewTabActive: { borderBottomWidth: 2, borderBottomColor: Brand.primary },
  viewTabText: { fontSize: 13, fontWeight: '700' },

  // Week Row
  weekRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1 },
  dayItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  dayLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  dayNumber: { fontSize: 16, fontWeight: '700' },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Brand.primary, marginTop: 4 },
  scheduleDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  content: { padding: 16 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 14, borderWidth: 1 },
  statNumber: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: '500' },

  // Slot Row (week detail)
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  roleTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, minWidth: 64, alignItems: 'center' },
  roleText: { fontSize: 11, fontWeight: '700' },
  slotMembers: { flex: 1, fontSize: 14, fontWeight: '500' },
  serviceLabelRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, fontWeight: '500' },

  // Upcoming
  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  upcomingDate: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  upcomingDateText: { fontSize: 18, fontWeight: '800', lineHeight: 20 },
  upcomingDayText: { fontSize: 11, fontWeight: '600' },
  upcomingInfo: { flex: 1 },
  upcomingTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  upcomingNote: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  upcomingMeta: { fontSize: 12 },

  // Generate View
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 18, borderRadius: 14, borderWidth: 1, marginBottom: 20,
  },
  infoBannerText: { flex: 1 },
  infoBannerTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  infoBannerDesc: { fontSize: 13, lineHeight: 20 },
  monthSelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 24, marginBottom: 20,
  },
  monthNav: { padding: 8 },
  monthText: { fontSize: 18, fontWeight: '800' },

  // Weekday Quick Select
  weekdayQuickRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  weekdayQuickBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10,
  },
  weekdayQuickText: { fontSize: 13, fontWeight: '700' },

  // Calendar
  calendarHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  calendarHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  calendarHeaderText: { fontSize: 12, fontWeight: '600' },
  calendarWeekRow: { flexDirection: 'row' },
  calendarCell: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 6, minHeight: 64,
  },
  calendarDayText: { fontSize: 16, fontWeight: '700' },
  calendarSvcText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.9)', marginTop: 3, paddingHorizontal: 6, paddingVertical: 2 },
  calendarHint: { fontSize: 11, textAlign: 'center', marginTop: 12 },

  // Selected Summary
  selectedSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 4,
  },
  selectedSummaryText: { fontSize: 14, fontWeight: '600' },

  // Unavail Modal
  unavailModal: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 100,
  },
  unavailContent: {
    borderRadius: 20, padding: 24, width: '100%', maxWidth: 400,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  unavailHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  unavailTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  unavailSubtitle: { fontSize: 13 },
  unavailCalHeader: { flexDirection: 'row', marginBottom: 4 },
  unavailActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  unavailCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1,
    alignItems: 'center',
  },
  unavailCancelText: { fontSize: 15, fontWeight: '600' },
  unavailConfirmBtn: {
    flex: 2, flexDirection: 'row', gap: 8, paddingVertical: 14,
    borderRadius: 12, backgroundColor: Brand.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  unavailConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Pool
  poolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  poolHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  poolCount: { fontSize: 13, fontWeight: '600' },
  poolExpanded: { marginTop: 14, gap: 0 },
  candidateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderTopWidth: 1,
  },
  candidateInfo: { flex: 1 },
  candidateName: { fontSize: 14, fontWeight: '600' },
  candidateUnavail: { fontSize: 11, marginTop: 2 },
  candidateAvail: { fontSize: 11, marginTop: 2 },
  editUnavailBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtn: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  addCandidateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderTopWidth: 1, marginTop: 4,
  },
  addCandidateText: { fontSize: 13, fontWeight: '600' },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Brand.primary, paddingVertical: 18,
    borderRadius: 14, marginTop: 24,
    shadowColor: Brand.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  generateBtnDone: { backgroundColor: Brand.accent },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  generatedHint: { textAlign: 'center', fontSize: 13, marginTop: 12, fontWeight: '500' },

  // Full Schedule Table
  tableHeader: { alignItems: 'center', marginBottom: 16 },
  tableTitle: { fontSize: 18, fontWeight: '800' },
  tableSubtitle: { fontSize: 13, marginTop: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  tableCell: { paddingVertical: 10, paddingHorizontal: 6, justifyContent: 'center' },
  dateCellHeader: { width: 90 },
  roleCellHeader: { width: 80, alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  dateCell: { width: 90, alignItems: 'center' },
  dateCellText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  dateCellNote: { fontSize: 9, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  roleCell: { width: 80, alignItems: 'center' },
  editableCell: {
    paddingVertical: 4, paddingHorizontal: 2, borderRadius: 6,
    borderWidth: 1, borderColor: 'transparent', minHeight: 28,
    justifyContent: 'center' as const, width: '100%',
  },
  cellText: { fontSize: 11, fontWeight: '500', textAlign: 'center' as const },
  dropdownDot: { width: 8, height: 8, borderRadius: 4 },
  dropdownUnavail: { fontSize: 10, fontWeight: '700' },
  pickerPanel: {
    marginTop: 16, borderRadius: 14, borderWidth: 1,
    padding: 16, overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 14, flexWrap: 'wrap',
  },
  pickerDate: { fontSize: 13, fontWeight: '600' },
  pickerCurrent: { fontSize: 13, fontWeight: '500', flex: 1 },
  pickerClose: { padding: 4 },
  pickerList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 10, borderWidth: 1,
  },
  pickerName: { fontSize: 14, fontWeight: '600' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 16, paddingBottom: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 11, fontWeight: '500' },
});
