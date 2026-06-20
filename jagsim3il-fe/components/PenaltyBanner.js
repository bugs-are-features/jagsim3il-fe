import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// 챌린지 화면 하단 고정 패널티 배너 (항상 노출)
// editable=true(방장, 시작 전)이면 탭하여 패널티를 설정할 수 있다.
// missedCount: 시작된 챌린지에서 내 누적 패널티(미인증) 횟수. null이면 미표시.
export function PenaltyBanner({ penalty, editable = false, onEdit, missedCount = null }) {
  const insets = useSafeAreaInsets();
  const Wrapper = editable ? Pressable : View;
  const showCount = missedCount != null;

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
        {showCount ? (
          // 내 누적 미인증 횟수 (패널티 발생 횟수)
          <View
            className={`ml-2 items-center rounded-xl px-3 py-1.5 ${
              missedCount > 0 ? 'bg-red-500/90' : 'bg-white/15'
            }`}
          >
            <Text className="font-jua text-lg font-bold text-white">{missedCount}회</Text>
            <Text className="text-[10px] font-gowunDodum text-white/70">내 패널티</Text>
          </View>
        ) : editable ? (
          <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.7)" />
        ) : null}
      </View>
    </Wrapper>
  );
}
