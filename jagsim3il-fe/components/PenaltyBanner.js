import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// 챌린지 화면 하단 고정 패널티 배너 (항상 노출)
export function PenaltyBanner({ penalty }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-ink px-5 pt-3"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View className="flex-row items-center">
        <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <Ionicons name="warning-outline" size={20} color="#FCD34D" />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-medium text-white/60">패널티</Text>
          <Text className="text-sm font-semibold text-white" numberOfLines={1}>
            {penalty}
          </Text>
        </View>
      </View>
    </View>
  );
}
