import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AvatarStack } from './Avatar';
import { BottomSheet } from './BottomSheet';
import { formatDateTime } from '../src/utils/date';

// iconOffset: 아이콘만 미세 이동 (예: { x: 1, y: -1 })
function Row({ icon, label, value, iconOffset = { x: 0, y: 0 } }) {
  return (
    <View className="mb-4 flex-row items-start">
      <View className="mr-3 mt-0.5 h-12 w-12 items-center justify-center rounded-full bg-primary-light">
        <Ionicons
          name={icon}
          size={23}
          color="#FF6A3D"
          style={{
            transform: [
              { translateY: iconOffset.y ?? 0 },
              { translateX: iconOffset.x ?? 0 },
            ],
          }}
        />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-jua text-ink-faint">{label}</Text>
        <Text className="mt-0.5 text-md font-gowunDodum text-ink">{value}</Text>
      </View>
    </View>
  );
}

// 챌린지 정보 상세 모달 (상세 버튼 탭 시)
// canLeave / onLeave: 시작 전 비방장 멤버에게 "챌린지 나가기" 노출
// canEndEarly / onEndEarly: 진행 중(active) 방장에게 "조기 종료" 노출
export function ChallengeDetailModal({
  visible,
  onClose,
  challenge,
  canLeave,
  onLeave,
  canEndEarly,
  onEndEarly,
}) {
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

        <View className="mb-1 flex-row items-center justify-between">
          <Text className="flex-1 pr-2 font-jua text-2xl text-ink">{challenge.title}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <Text className="mb-5 font-gowunDodum text-lg text-ink-muted">{challenge.description}</Text>

        <Row
          icon="play-outline"
          label="시작"
          value={formatDateTime(challenge.startAt)}
          iconOffset={{ x: 1, y: 0 }}
        />
        <Row
          icon="flag-outline"
          label="종료"
          value={formatDateTime(challenge.endAt)}
          iconOffset={{ x: 1, y: 0 }}
        />
        <Row
          icon="warning-outline"
          label="패널티"
          value={challenge.penalty}
          iconOffset={{ x: 0, y: -1 }}
        />

        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-gowunDodum text-ink-faint">챌린지 멤버: {challenge.memberCount}명</Text>
          <AvatarStack members={challenge.members} size={30} max={6} />
        </View>

        {/* 조기 종료 (진행 중, 방장) */}
        {canEndEarly ? (
          <Pressable
            onPress={onEndEarly}
            className="mt-4 flex-row items-center justify-center rounded-xl border border-red-200 py-3.5"
          >
            <Ionicons name="stop-circle-outline" size={18} color="#EF4444" />
            <Text className="font-gowunDodum ml-1.5 text-base font-semibold text-red-500">
              챌린지 조기 종료
            </Text>
          </Pressable>
        ) : null}

        {/* 챌린지 나가기 (시작 전, 방장 제외) */}
        {canLeave ? (
          <Pressable
            onPress={onLeave}
            className="mt-4 flex-row items-center justify-center rounded-xl border border-red-200 py-3.5"
          >
            <Ionicons name="exit-outline" size={18} color="#EF4444" />
            <Text className="font-gowunDodum ml-1.5 text-base font-semibold text-red-500">
              챌린지 나가기
            </Text>
          </Pressable>
        ) : null}
        {canLeave ? (
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm font-gowunDodum text-ink-faint">
              * 챌린지가 시작되면 나가기 불가능해요
            </Text>
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}
