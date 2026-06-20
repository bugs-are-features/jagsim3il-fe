import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// 챌린지 화면 하단 고정 패널티 배너 (항상 노출)
// editable=true(방장)이면 탭하여 패널티를 설정할 수 있다.
export function PenaltyBanner({ penalty, editable = false, onEdit }) {
  const insets = useSafeAreaInsets();
  const Wrapper = editable ? Pressable : View;

  return (
    <Wrapper
      onPress={editable ? onEdit : undefined}
      className="absolute bottom-0 left-0 right-0 bg-ink px-5 pt-3"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View className="flex-row items-center">
        <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <Ionicons name="warning-outline" className="-mt-1" size={20} color="#FCD34D" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-jua font-medium text-white/60">패널티</Text>
          <Text className="text- font-gowunDodum font-semibold text-white" numberOfLines={1}>
            {penalty || (editable ? '탭하여 패널티를 설정하세요' : '미설정')}
          </Text>
        </View>
        {editable && (
          <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.7)" />
        )}
      </View>
    </Wrapper>
  );
}
