import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 전체 화면 로딩 — 흰 배경 + 중앙 스피너 + 안내 문구
export function LoadingScreen({ message = '불러오는 중...' }) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <View className="flex-1 items-center justify-center px-8">
        <ActivityIndicator size="large" color="#FF6A3D" />
        <Text className="font-gowunDodum mt-4 text-center text-base text-ink-muted">
          {message}
        </Text>
      </View>
    </SafeAreaView>
  );
}
