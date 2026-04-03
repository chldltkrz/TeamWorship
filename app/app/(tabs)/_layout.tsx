import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import Colors, { Brand } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

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
          tabBarBadge: 10,
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
