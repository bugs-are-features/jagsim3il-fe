// 온보딩 노출 여부를 AsyncStorage에 저장/조회하는 유틸.
// 첫 실행(온보딩 미시청) 여부를 판단하는 데 사용한다.
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '';

// 온보딩을 한 번이라도 끝까지 봤는지 여부 반환
export async function getOnboardingSeen() {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

// 온보딩 완료 처리(이후 실행부터는 온보딩을 건너뛴다)
export async function setOnboardingSeen() {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // 저장 실패는 무시(다음 실행 때 다시 노출될 뿐)
  }
}
