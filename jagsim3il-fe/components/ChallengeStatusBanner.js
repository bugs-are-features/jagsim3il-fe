import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { challengeDayKST, getChallengeStatus } from '../src/utils/challengeStatus';

// 시작된 챌린지 상단 — N일차 조언/상태 카드 (종료 시 별도 문구)
export function ChallengeStatusBanner({ startAt, status: challengeStatus }) {
  if (challengeStatus === 'ended') {
    return (
      <View className="mb-1 rounded-2xl bg-white px-4 py-4">
        <View className="flex-row items-center">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Ionicons name="flag" size={20} color="#6B7280" />
          </View>
          <View className="flex-1">
            <Text className="font-jua text-lg font-bold text-ink">챌린지가 종료되었어요</Text>
            <Text className="font-gowunDodum mt-0.5 text-sm leading-5 text-ink-muted">
              수고하셨어요! 멤버들의 인증 내역을 확인해 보세요.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const day = challengeDayKST(startAt);
  const status = getChallengeStatus(day);
  if (!status) return null;

  return (
    <View className="rounded-2xl py-4">
      <Text className="font-gowunDodum text-xs font-semibold text-primary">
        {status.day}일차
      </Text>
      <Text className="font-jua mt-1 text-lg font-bold text-ink">{status.title}</Text>
      <Text className="font-gowunDodum mt-0.5 text-sm leading-5 text-ink-muted">
        {status.subtitle}
      </Text>
    </View>
  );
}
