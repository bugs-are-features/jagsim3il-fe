// 온보딩 노출 상태관리 (zustand)
// AsyncStorage는 비동기이므로, 앱 시작 시 hydrate로 한 번 읽어와서
// hydrated=true가 되기 전에는 라우팅 분기를 보류한다(로그인 화면 깜빡임 방지).
import { create } from 'zustand';
import { getOnboardingSeen, setOnboardingSeen } from '../utils/storage';

export const useOnboardingStore = create((set) => ({
  // state
  hydrated: false, // AsyncStorage에서 값을 읽어왔는지
  hasSeenOnboarding: false, // 온보딩을 끝까지 본 적 있는지

  // actions
  hydrate: async () => {
    const seen = await getOnboardingSeen();
    set({ hasSeenOnboarding: seen, hydrated: true });
  },

  completeOnboarding: async () => {
    await setOnboardingSeen();
    set({ hasSeenOnboarding: true });
  },
}));
