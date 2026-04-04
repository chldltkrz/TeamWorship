import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Brand } from '@/constants/Colors';

import { useColorScheme } from '@/components/useColorScheme';
import { ScheduleProvider } from '@/constants/ScheduleContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const TeamWorshipDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Brand.primary,
    background: '#0B0D17',
    card: '#13152A',
    text: '#E8E8F0',
    border: 'rgba(108, 99, 255, 0.15)',
  },
};

const TeamWorshipLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Brand.primary,
    background: '#F6F6FA',
    card: '#FFFFFF',
    text: '#1A1D2E',
    border: '#E4E5ED',
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ScheduleProvider>
    <ThemeProvider value={colorScheme === 'dark' ? TeamWorshipDark : TeamWorshipLight}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="member-manage" options={{ headerShown: true }} />
        <Stack.Screen name="attendance-report" options={{ headerShown: true }} />
        <Stack.Screen name="prayer" options={{ headerShown: true }} />
        <Stack.Screen name="my-unavailable" options={{ headerShown: true }} />
        <Stack.Screen name="music-room/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: '설정' }} />
      </Stack>
    </ThemeProvider>
    </ScheduleProvider>
  );
}
