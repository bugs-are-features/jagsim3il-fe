// Expo 푸시 알림 등록·삭제·딥링크 처리
// Expo Go(SDK 53+)에서는 원격 푸시가 지원되지 않으므로 모듈을 lazy-load 한다.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { registerPushTokenRequest, deletePushTokenRequest } from '../api/push';
import { getDeviceId } from '../utils/deviceId';
import { isPushAvailable } from '../utils/pushSupport';

const EXPO_PUSH_TOKEN_KEY = 'expoPushToken';
const PUSH_ENABLED_KEY = 'pushNotificationsEnabled';

let notificationsModule = null;
let notificationsInitPromise = null;

async function getNotificationsModule() {
  if (!isPushAvailable()) return null;
  if (notificationsModule) return notificationsModule;
  if (notificationsInitPromise) return notificationsInitPromise;

  notificationsInitPromise = import('expo-notifications')
    .then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      notificationsModule = Notifications;
      return Notifications;
    })
    .catch((e) => {
      console.log('[Push] expo-notifications 로드 실패', e?.message);
      return null;
    })
    .finally(() => {
      notificationsInitPromise = null;
    });

  return notificationsInitPromise;
}

function getProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    null
  );
}

export async function getPushNotificationsEnabled() {
  try {
    const value = await AsyncStorage.getItem(PUSH_ENABLED_KEY);
    return value !== 'false';
  } catch {
    return true;
  }
}

export async function setPushNotificationsEnabled(enabled) {
  try {
    await AsyncStorage.setItem(PUSH_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // 저장 실패는 무시
  }
}

async function saveExpoPushToken(expoPushToken) {
  try {
    if (expoPushToken) {
      await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, expoPushToken);
    } else {
      await AsyncStorage.removeItem(EXPO_PUSH_TOKEN_KEY);
    }
  } catch {
    // 저장 실패는 무시
  }
}

export async function getStoredExpoPushToken() {
  try {
    return await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function ensureAndroidChannel(Notifications) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: '기본 알림',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF6A3D',
  });
}

async function requestNotificationPermissions(Notifications) {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

// Expo Push Token 발급 (실기기 + 권한 허용 시에만)
export async function acquireExpoPushToken() {
  if (!isPushAvailable()) return null;
  if (!Device.isDevice) {
    console.log('[Push] 시뮬레이터/에뮬레이터에서는 푸시 토큰을 발급하지 않습니다.');
    return null;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) return null;

  const granted = await requestNotificationPermissions(Notifications);
  if (!granted) {
    console.log('[Push] 알림 권한이 거부되었습니다.');
    return null;
  }

  await ensureAndroidChannel(Notifications);

  const projectId = getProjectId();
  const options = projectId ? { projectId } : undefined;
  const tokenResult = await Notifications.getExpoPushTokenAsync(options);
  const expoPushToken = tokenResult?.data ?? null;
  if (expoPushToken) {
    await saveExpoPushToken(expoPushToken);
  }
  return expoPushToken;
}

function getPlatform() {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return Platform.OS;
}

// 서버에 푸시 토큰 등록 (앱 실행/로그인/설정 ON 시)
export async function registerPushToken(authToken) {
  if (!authToken) return { ok: false, reason: 'no_auth' };
  if (!isPushAvailable()) return { ok: false, reason: 'unsupported' };

  const enabled = await getPushNotificationsEnabled();
  if (!enabled) return { ok: false, reason: 'disabled' };

  try {
    const expoPushToken = await acquireExpoPushToken();
    if (!expoPushToken) return { ok: false, reason: 'no_token' };

    const deviceId = await getDeviceId();
    await registerPushTokenRequest(authToken, {
      expoPushToken,
      deviceId,
      platform: getPlatform(),
    });
    console.log('[Push] 토큰 등록 완료');
    return { ok: true, expoPushToken };
  } catch (e) {
    console.log('[Push] 토큰 등록 실패', e?.message);
    return { ok: false, reason: 'error', message: e?.message };
  }
}

// 로그아웃/설정 OFF 시 서버에서 토큰 삭제
export async function unregisterPushToken(authToken, expoPushToken) {
  const token = expoPushToken ?? (await getStoredExpoPushToken());
  if (!authToken || !token) return { ok: true };

  try {
    await deletePushTokenRequest(authToken, token);
    await saveExpoPushToken(null);
    console.log('[Push] 토큰 삭제 완료');
    return { ok: true };
  } catch (e) {
    console.log('[Push] 토큰 삭제 실패', e?.message);
    return { ok: false, message: e?.message };
  }
}

// 알림 data.chal_id → 챌린지 화면 경로
export function getChallengeRouteFromNotification(notification) {
  const data = notification?.request?.content?.data;
  const chalId = data?.chal_id ?? data?.chalId;
  if (!chalId) return null;
  return `/challenge/${chalId}`;
}

// 알림 탭 리스너 등록 (development build 전용)
export async function subscribeToNotificationResponses(onNotification) {
  if (!isPushAvailable()) return () => {};

  const Notifications = await getNotificationsModule();
  if (!Notifications) return () => {};

  const response = await Notifications.getLastNotificationResponseAsync();
  if (response?.notification) {
    onNotification(response.notification);
  }

  const sub = Notifications.addNotificationResponseReceivedListener((next) => {
    onNotification(next.notification);
  });

  return () => sub.remove();
}
