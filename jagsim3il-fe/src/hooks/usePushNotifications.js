// 로그인 상태에서 푸시 등록 + 알림 탭 시 챌린지 화면 이동
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { isPushAvailable } from '../utils/pushSupport';
import {
  registerPushToken,
  getChallengeRouteFromNotification,
  subscribeToNotificationResponses,
} from '../services/pushNotifications';

export function usePushNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  // 로그인 후 앱 실행 시 서버에 푸시 토큰 등록
  useEffect(() => {
    if (!isAuthenticated || !token || !isPushAvailable()) return;
    registerPushToken(token);
  }, [isAuthenticated, token]);

  // 알림 탭 → 챌린지 화면 딥링크
  useEffect(() => {
    if (!isPushAvailable()) return;

    let unsubscribe = () => {};

    subscribeToNotificationResponses((notification) => {
      const route = getChallengeRouteFromNotification(notification);
      if (route) router.push(route);
    }).then((remove) => {
      unsubscribe = remove;
    });

    return () => unsubscribe();
  }, []);
}
