import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvatarStack } from './Avatar';
import { getChallengeCardDisplay } from '../src/utils/challengeStatus';

// 홈 화면 챌린지 카드 — challenge.status(preparing | active | ended)에 따라 UI 분기
export function ChallengeCard({ challenge, onPress }) {
  const display = getChallengeCardDisplay(challenge);

  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-2xl p-4 shadow-sm active:opacity-90 ${display.cardBg}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: display.status === 'ended' ? 0.03 : 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: display.status === 'ended' ? 1 : 2,
      }}
    >
      <View className="flex-row items-start justify-between">
        <Text className={`flex-1 pr-2 font-jua text-xl ${display.titleClass}`}>
          {challenge.title}
        </Text>
        <View className={`rounded-full px-2.5 py-1 ${display.badgeBg}`}>
          <Text className={`text-xs font-semibold ${display.badgeText}`}>
            {display.badgeLabel}
          </Text>
        </View>
      </View>

      <Text
        className={`font-gowunDodum mt-1 text-md ${display.descClass}`}
        numberOfLines={2}
      >
        {challenge.description}
      </Text>

      {display.statusHint ? (
        <View className="mt-2 flex-row items-center">
          <Ionicons
            name={display.status === 'preparing' ? 'hourglass-outline' : 'flag-outline'}
            size={14}
            color={display.status === 'preparing' ? '#B45309' : '#9CA3AF'}
          />
          <Text className="font-gowunDodum ml-1 text-sm text-ink-faint">
            {display.statusHint}
          </Text>
        </View>
      ) : null}

      {display.dateText ? (
        <View className="mt-3 flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color={display.dateIconColor} />
          <Text className="font-gowunDodum ml-1 text-sm text-ink-faint">
            {display.dateText}
          </Text>
        </View>
      ) : null}

      <View className="mt-3 flex-row items-center justify-between">
        <AvatarStack members={challenge.members} size={30} />
        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={16} color="#6B7280" />
          <Text className="ml-1 text-sm font-medium text-ink-muted">
            {challenge.memberCount}명
          </Text>
          {challenge.isOwner ? (
            <View className="ml-2 rounded-full bg-primary-light px-2 py-0.5">
              <Text className="text-xs font-semibold text-primary">방장</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
