import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AvatarStack } from './Avatar';
import { BottomSheet } from './BottomSheet';
import { formatDateTime } from '../src/utils/date';

function Row({ icon, label, value }) {
  return (
    <View className="mb-4 flex-row items-start">
      <View className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-primary-light">
        <Ionicons name={icon} size={16} color="#FF6A3D" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-ink-faint">{label}</Text>
        <Text className="mt-0.5 text-sm font-medium text-ink">{value}</Text>
      </View>
    </View>
  );
}

// 챌린지 정보 상세 모달 (상세 버튼 탭 시)
export function ChallengeDetailModal({ visible, onClose, challenge }) {
  const insets = useSafeAreaInsets();
  if (!challenge) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
        <View
          className="rounded-t-3xl bg-white px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="mb-3 items-center">
            <View className="h-1.5 w-10 rounded-full bg-gray-300" />
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="flex-1 pr-2 text-xl font-bold text-ink">{challenge.title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          <Text className="mb-5 text-sm text-ink-muted">{challenge.description}</Text>

          <Row icon="play-outline" label="시작" value={formatDateTime(challenge.startAt)} />
          <Row icon="flag-outline" label="종료" value={formatDateTime(challenge.endAt)} />
          <Row icon="warning-outline" label="패널티" value={challenge.penalty} />

          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs text-ink-faint">참여 멤버 {challenge.memberCount}명</Text>
            <AvatarStack members={challenge.members} size={30} max={6} />
          </View>
        </View>
    </BottomSheet>
  );
}
