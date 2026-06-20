import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvatarStack } from './Avatar';
import { formatDate, daysLeft } from '../src/utils/date';

// 홈 화면 챌린지 카드
export function ChallengeCard({ challenge, onPress }) {
  const left = daysLeft(challenge.endAt);

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm active:opacity-90"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 pr-2 font-jua text-xl text-ink">{challenge.title}</Text>
        {left >= 0 ? (
          <View className="rounded-full bg-primary-light px-2.5 py-1">
            <Text className="text-xs font-semibold text-primary">D-{left}</Text>
          </View>
        ) : (
          <View className="rounded-full bg-gray-100 px-2.5 py-1">
            <Text className="text-xs font-semibold text-ink-faint">종료</Text>
          </View>
        )}
      </View>

      <Text className="font-gowunDodum mt-1 text-md text-ink-muted" numberOfLines={2}>
        {challenge.description}
      </Text>

      <View className="mt-3 flex-row items-center">
        <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
        <Text className="font-gowunDodum ml-1 text-sm text-ink-faint">
          {formatDate(challenge.startAt)} ~ {formatDate(challenge.endAt)}
        </Text>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <AvatarStack members={challenge.members} size={30} />
        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={16} color="#6B7280" />
          <Text className="ml-1 text-sm font-medium text-ink-muted">
            {challenge.memberCount}명
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
