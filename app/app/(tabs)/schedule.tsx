import { StyleSheet, ScrollView, View, Text, Pressable, Platform } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { monthlySchedule as defaultSchedule, partPools } from '@/constants/MockData';
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

// 자동 스케줄 생성 알고리즘
function autoGenerate(
  selectedDays: number[],
  servicesPerDay: Record<number, number>,
  year: number,
  month: number, // 0-indexed
): MonthlyScheduleRow[] {
  const result: MonthlyScheduleRow[] = [];
  const d = new Date(year, month, 1);

  // 파트별 라운드로빈 카운터
  const counters: Record<string, number> = {};
  partPools.forEach((p) => { counters[p.role] = 0; });

  while (d.getMonth() === month) {
    if (selectedDays.includes(d.getDay())) {
      const dateStr = toLocalDateStr(d);
      const dayChar = days[d.getDay()];
      const numServices = servicesPerDay[d.getDay()] || 1;

      const services: ServiceAssignment[] = [];
      for (let si = 0; si < numServices; si++) {
        const slots: { role: PartRole; members: string[] }[] = [];
        const usedInThisService = new Set<string>();

        for (const pool of partPools) {
          const available = pool.candidates.filter(
            (c) => !c.unavailableDates.includes(dateStr) && !usedInThisService.has(c.name)
          );
          if (available.length === 0) continue;

          // 싱어는 2명, 음향은 2명, 나머지 1명
          const count = (pool.role === '싱어' || pool.role === '음향') ? Math.min(2, available.length) : 1;
          const picked: string[] = [];

          for (let k = 0; k < count; k++) {
            const idx = (counters[pool.role] + si) % available.length;
            const member = available[idx % available.length];
            if (member && !picked.includes(member.name)) {
              picked.push(member.name);
              usedInThisService.add(member.name);
            }
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
                    {slot.members.join(', ')}
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
        {scheduleData.filter((r) => r.date >= toLocalDateStr(today)).slice(0, 4).map((row) => (
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
                  {row.services.length > 1 ? `주일 예배 (${row.services.length}부)` : '예배'}
                  {row.note ? ` · ${row.note}` : ''}
                </Text>
                <Text style={[styles.upcomingMeta, { color: colors.textSecondary }]}>
                  {row.services[0].slots.length}개 파트 배정
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
  selectedDays: number[];
  servicesPerDay: Record<number, number>;
  generated: boolean;
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

  const { selectedDays, servicesPerDay, generated } = state;

  const setSelectedDays = (fn: (prev: number[]) => number[]) => {
    onStateChange({ ...state, selectedDays: fn(state.selectedDays), generated: false });
  };
  const setServicesPerDay = (fn: (prev: Record<number, number>) => Record<number, number>) => {
    onStateChange({ ...state, servicesPerDay: fn(state.servicesPerDay), generated: false });
  };
  const setGenerated = (v: boolean) => {
    onStateChange({ ...state, generated: v });
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      const nextDays = selectedDays.filter((d) => d !== dayIndex);
      const nextServices = { ...servicesPerDay };
      delete nextServices[dayIndex];
      onStateChange({ ...state, selectedDays: nextDays, servicesPerDay: nextServices, generated: false });
    } else {
      onStateChange({
        ...state,
        selectedDays: [...selectedDays, dayIndex].sort((a, b) => a - b),
        servicesPerDay: { ...servicesPerDay, [dayIndex]: 1 },
        generated: false,
      });
    }
  };

  const cycleServiceCount = (dayIndex: number) => {
    onStateChange({
      ...state,
      servicesPerDay: {
        ...servicesPerDay,
        [dayIndex]: (servicesPerDay[dayIndex] || 1) >= 3 ? 1 : (servicesPerDay[dayIndex] || 1) + 1,
      },
      generated: false,
    });
  };

  // 선택한 요일로 해당 월의 날짜 계산
  const generateDates = useMemo(() => {
    const year = 2026;
    const month = 3; // April (0-indexed)
    const dates: { date: string; dayLabel: string; dayIndex: number }[] = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      if (selectedDays.includes(d.getDay())) {
        const dateStr = toLocalDateStr(d);
        dates.push({
          date: dateStr,
          dayLabel: `${d.getDate()}일 (${days[d.getDay()]})`,
          dayIndex: d.getDay(),
        });
      }
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, [selectedDays]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.content}>
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: `${Brand.primary}10`, borderColor: `${Brand.primary}30` }]}>
          <FontAwesome name="magic" size={20} color={Brand.primary} />
          <View style={styles.infoBannerText}>
            <Text style={[styles.infoBannerTitle, { color: colors.text }]}>스케줄 자동 생성</Text>
            <Text style={[styles.infoBannerDesc, { color: colors.textSecondary }]}>
              예배 요일을 선택하고, 파트별 후보자를 설정하면{'\n'}겹치지 않게 자동으로 배정합니다
            </Text>
          </View>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <Pressable style={styles.monthNav}>
            <FontAwesome name="chevron-left" size={14} color={colors.textSecondary} />
          </Pressable>
          <Text style={[styles.monthText, { color: colors.text }]}>2026년 4월</Text>
          <Pressable style={styles.monthNav}>
            <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Day Selector */}
        <SectionHeader title="예배 요일 선택" />
        <Card>
          <View style={styles.daySelector}>
            {days.map((day, i) => {
              const isActive = selectedDays.includes(i);
              return (
                <Pressable
                  key={i}
                  onPress={() => toggleDay(i)}
                  style={[
                    styles.daySelectorItem,
                    isActive
                      ? { backgroundColor: Brand.primary }
                      : { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Text style={[
                    styles.daySelectorText,
                    { color: isActive ? '#fff' : colors.textSecondary },
                    i === 0 && !isActive && { color: Brand.pink },
                  ]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Service count per day */}
          {selectedDays.length > 0 && (
            <View style={styles.serviceCountSection}>
              <Text style={[styles.serviceCountLabel, { color: colors.textSecondary }]}>
                요일별 예배 부수 (탭하여 변경)
              </Text>
              <View style={styles.serviceCountRow}>
                {selectedDays.map((di) => (
                  <Pressable
                    key={di}
                    onPress={() => cycleServiceCount(di)}
                    style={[styles.serviceCountChip, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.serviceCountDay, { color: Brand.primary }]}>{days[di]}</Text>
                    <Text style={[styles.serviceCountNum, { color: colors.text }]}>
                      {servicesPerDay[di] || 1}부
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Preview dates */}
          {generateDates.length > 0 && (
            <View style={[styles.previewDates, { borderTopColor: colors.border }]}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                생성될 일정 ({generateDates.length}개)
              </Text>
              <View style={styles.previewDateChips}>
                {generateDates.map((gd) => (
                  <View key={gd.date} style={[styles.previewDateChip, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.previewDateText, { color: colors.text }]}>{gd.dayLabel}</Text>
                    <Text style={[styles.previewServiceText, { color: colors.textSecondary }]}>
                      {servicesPerDay[gd.dayIndex] || 1}부
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

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
                      <Pressable style={[styles.editUnavailBtn, { borderColor: colors.border }]}>
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
            const result = autoGenerate(selectedDays, servicesPerDay, 2026, 3);
            onGenerate(result);
            setGenerated(true);
          }}
        >
          <FontAwesome name={generated ? 'check' : 'magic'} size={18} color="#fff" />
          <Text style={styles.generateBtnText}>
            {generated
              ? `${generateDates.length}개 일정이 생성되었습니다!`
              : `4월 스케줄 자동 생성 (${generateDates.length}개 일정)`}
          </Text>
        </Pressable>

        {generated && (
          <Text style={[styles.generatedHint, { color: colors.textSecondary }]}>
            주간 · 전체보기 탭에서 결과를 확인하세요
          </Text>
        )}
      </View>
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
  const [editingCell, setEditingCell] = useState<{
    date: string; si: number; role: PartRole;
  } | null>(null);

  const roles: PartRole[] = ['예배인도', '기타', '건반', '일렉', '베이스', '드럼', '싱어', '음향', '온라인'];

  const getMembers = (row: MonthlyScheduleRow, serviceIdx: number, role: PartRole): string => {
    const svc = row.services[serviceIdx];
    if (!svc) return '';
    const slot = svc.slots.find((s) => s.role === role);
    return slot ? slot.members.join(' ') : '·';
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
                    onPress={() => handleSelectMember(c.name)}
                    style={[
                      styles.pickerItem,
                      { borderColor: colors.border },
                      isCurrent && { backgroundColor: `${Brand.primary}15`, borderColor: Brand.primary },
                    ]}
                  >
                    <View style={[styles.dropdownDot, { backgroundColor: c.color }]} />
                    <Text style={[styles.pickerName, { color: colors.text }]}>{c.name}</Text>
                    {isUnavailable && (
                      <Text style={[styles.dropdownUnavail, { color: Brand.pink }]}>불가</Text>
                    )}
                    {isCurrent && (
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
  const [view, setView] = useState<ViewMode>('week');
  const [scheduleData, setScheduleData] = useState<MonthlyScheduleRow[]>(defaultSchedule);
  const [genState, setGenState] = useState<GenerateState>({
    selectedDays: [0, 3, 5],
    servicesPerDay: { 0: 2, 3: 1, 5: 1 },
    generated: false,
  });

  const handleGenerate = useCallback((data: MonthlyScheduleRow[]) => {
    setScheduleData(data);
  }, []);

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

  // Day Selector
  daySelector: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  daySelectorItem: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 12,
  },
  daySelectorText: { fontSize: 15, fontWeight: '700' },
  serviceCountSection: { marginTop: 16 },
  serviceCountLabel: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  serviceCountRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  serviceCountChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1,
  },
  serviceCountDay: { fontSize: 14, fontWeight: '800' },
  serviceCountNum: { fontSize: 14, fontWeight: '600' },
  previewDates: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  previewLabel: { fontSize: 12, fontWeight: '500', marginBottom: 10 },
  previewDateChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  previewDateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  previewDateText: { fontSize: 12, fontWeight: '600' },
  previewServiceText: { fontSize: 11 },

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
