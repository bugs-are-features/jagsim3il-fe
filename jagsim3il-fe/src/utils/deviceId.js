// 기기 식별자 — push-token API의 device_id로 사용
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';

const DEVICE_ID_KEY = 'deviceId';

function createUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function getNativeDeviceId() {
  if (Platform.OS === 'android') {
    return Application.getAndroidId?.() ?? null;
  }
  if (Platform.OS === 'ios') {
    return (await Application.getIosIdForVendorAsync?.()) ?? null;
  }
  return null;
}

// 네이티브 ID를 우선 사용하고, 실패 시 AsyncStorage UUID를 쓴다.
export async function getDeviceId() {
  try {
    const nativeId = await getNativeDeviceId();
    if (nativeId) return nativeId;
  } catch {
    // 네이티브 ID 조회 실패 시 로컬 UUID로 대체
  }

  try {
    const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (stored) return stored;
    const next = createUuid();
    await AsyncStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  } catch {
    return createUuid();
  }
}
