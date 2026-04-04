import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import Colors, { Brand } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ScheduleProvider, useSchedule } from '@/constants/ScheduleContext';
import { partPools, monthlySchedule } from '@/constants/MockData';

const currentUser = '김강래';

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function useChatUnreadCount() {
  const { scheduleData } = useSchedule();
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const weekStart = toLocalDateStr(start);
  const weekEnd = toLocalDateStr(end);

  let count = 3; // 전체 공지방
  const thisWeek = scheduleData.filter((r) => r.date >= weekStart && r.date <= weekEnd);
  thisWeek.forEach((row, ri) => {
    row.services.forEach((svc) => {
      const allMembers = svc.slots.flatMap((s) => s.members);
      if (allMembers.some((m) => m.includes(currentUser))) {
        count += ri === 0 ? 5 : ri === 1 ? 2 : 0;
      }
    });
  });
  partPools.forEach((pool, pi) => {
    if (pool.candidates.some((c) => c.name === currentUser) && pi === 0) {
      count += 1;
    }
  });
  return count;
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  return (
    <ScheduleProvider>
      <TabLayoutInner />
    </ScheduleProvider>
  );
}

function TabLayoutInner() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const unreadCount = useChatUnreadCount();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      }}>
      <Tabs.Screen
        name="schedule"
        options={{
          title: '스케줄',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerTitle: '이번주 스케줄',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '채팅',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: Brand.pink, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="music"
        options={{
          title: '악보',
          tabBarIcon: ({ color }) => <TabBarIcon name="music" color={color} />,
          headerTitle: '악보 라이브러리',
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: '출석',
          tabBarIcon: ({ color }) => <TabBarIcon name="check-square-o" color={color} />,
          headerTitle: '출석 체크',
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '더보기',
          tabBarIcon: ({ color }) => <TabBarIcon name="user-circle" color={color} />,
          headerTitle: '마이페이지',
        }}
      />
    </Tabs>
  );
}
