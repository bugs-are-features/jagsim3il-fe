import '../global.css';
import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import { GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import { useAuthStore } from '../src/store/authStore';
import { useOnboardingStore } from '../src/store/onboardingStore';

// 앱 전역 기본 폰트를 Gowun Dodum으로 지정한다.
// 스타일 배열의 맨 앞에 두므로, 컴포넌트가 직접 지정한 폰트(font-jua 등)는 그대로 유지된다.
const DEFAULT_FONT = { fontFamily: 'GowunDodum_400Regular' };
// TextInput 전용 보정:
// - text-* 기본 lineHeight(24)는 커스텀 폰트의 디센더가 잘리므로, 디센더가 들어갈 만큼
//   넉넉한 lineHeight(26)를 준다. iOS는 lineHeight 박스 안에서 텍스트를 중앙 정렬하므로
//   이 값이면 잘림 없이 수직 중앙에 놓인다.
// - Android는 includeFontPadding(폰트 메트릭 여백)이 비대칭으로 들어가 쏠리므로 끈다.
const TEXTINPUT_FIX = { lineHeight: 26, includeFontPadding: false };
function patchDefaultFont(Comp, extra) {
  if (!Comp || Comp.__fontPatched) return;
  if (typeof Comp.render === 'function') {
    // forwardRef 컴포넌트 (Text)
    const orig = Comp.render;
    Comp.render = function (...args) {
      const el = orig.apply(this, args);
      return React.cloneElement(el, { style: [DEFAULT_FONT, el.props.style, extra] });
    };
    Comp.__fontPatched = true;
  } else if (Comp.prototype && typeof Comp.prototype.render === 'function') {
    // 클래스 컴포넌트 (TextInput)
    const orig = Comp.prototype.render;
    Comp.prototype.render = function () {
      const el = orig.call(this);
      return React.cloneElement(el, { style: [DEFAULT_FONT, el.props.style, extra] });
    };
    Comp.__fontPatched = true;
  }
}
patchDefaultFont(Text);
patchDefaultFont(TextInput, TEXTINPUT_FIX);

// 인증 여부에 따른 라우팅 분기
// expo-router v6의 <Stack.Protected guard={...}>를 사용한다.
// guard가 false인 화면 그룹은 접근이 차단되고, 네비게이터가 마운트된 후
// 라우터가 알아서 사용 가능한 첫 화면으로 리다이렉트한다.
// (imperative router.replace를 첫 렌더에서 호출할 때 발생하던
//  "navigate before mounting the Root Layout" 오류를 피한다.)
export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const validateSession = useAuthStore((s) => s.validateSession);
  const hydrated = useOnboardingStore((s) => s.hydrated);
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const hydrate = useOnboardingStore((s) => s.hydrate);

  // 타이틀 및 본문 폰트 로드
  const [fontsLoaded] = useFonts({
    Jua_400Regular,
    GowunDodum_400Regular,
  });

  // 앱 시작 시 AsyncStorage에서 온보딩 노출 여부를 한 번 읽어온다.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 로그인 상태일 때 5초마다 세션(토큰) 유효성 검사 + 회원 정보 갱신.
  // 만료되면 store가 로그아웃 처리하여 guard가 로그인 화면으로 보낸다.
  useEffect(() => {
    if (!isAuthenticated) return;
    validateSession(); // 진입 즉시 1회 검사
    const id = setInterval(validateSession, 5000);
    return () => clearInterval(id);
  }, [isAuthenticated, validateSession]);

  // 온보딩 상태/폰트를 준비하기 전에는 라우팅을 보류한다(화면 깜빡임 방지).
  if (!hydrated || !fontsLoaded) return null;

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
            <Stack.Screen name="profile-edit" />
            <Stack.Screen name="challenge/[challengeId]" />
          </Stack.Protected>

          {/* 인증 여부와 무관하게 접근 가능(약관: 가입/설정 양쪽에서 사용) */}
          <Stack.Screen name="terms" />
        </Stack>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
