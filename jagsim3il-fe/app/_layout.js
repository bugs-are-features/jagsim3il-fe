import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../src/store/authStore';
import { useOnboardingStore } from '../src/store/onboardingStore';

// 인증 여부에 따른 라우팅 분기
// expo-router v6의 <Stack.Protected guard={...}>를 사용한다.
// guard가 false인 화면 그룹은 접근이 차단되고, 네비게이터가 마운트된 후
// 라우터가 알아서 사용 가능한 첫 화면으로 리다이렉트한다.
// (imperative router.replace를 첫 렌더에서 호출할 때 발생하던
//  "navigate before mounting the Root Layout" 오류를 피한다.)
export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useOnboardingStore((s) => s.hydrated);
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const hydrate = useOnboardingStore((s) => s.hydrate);

  // 앱 시작 시 AsyncStorage에서 온보딩 노출 여부를 한 번 읽어온다.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 온보딩 상태를 읽어오기 전에는 라우팅을 보류한다(화면 깜빡임 방지).
  if (!hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* 첫 실행 전용: 온보딩 */}
          <Stack.Protected guard={!hasSeenOnboarding}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>

          {/* 온보딩을 본 비로그인 사용자 전용 화면 */}
          <Stack.Protected guard={hasSeenOnboarding && !isAuthenticated}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
          </Stack.Protected>

          {/* 로그인 사용자 전용 화면 */}
          <Stack.Protected guard={hasSeenOnboarding && isAuthenticated}>
            <Stack.Screen name="index" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="room/[roomId]" />
          </Stack.Protected>
        </Stack>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
