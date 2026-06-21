// Expo Go / 웹 등 푸시 미지원 환경 판별
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

export function isExpoGo() {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function isPushAvailable() {
  return Platform.OS !== 'web' && !isExpoGo();
}
