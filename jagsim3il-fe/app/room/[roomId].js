import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MemberCard } from '../../components/MemberCard';
import { PenaltyBanner } from '../../components/PenaltyBanner';
import { RoomDetailModal } from '../../components/RoomDetailModal';
import { useRoomStore } from '../../src/store/roomStore';
import { useAuthStore } from '../../src/store/authStore';
import { daysLeft } from '../../src/utils/date';

export default function RoomScreen() {
  const { roomId } = useLocalSearchParams();
  const router = useRouter();
  const myUserId = useAuthStore((s) => s.user?.id);

  const currentRoom = useRoomStore((s) => s.currentRoom);
  const members = useRoomStore((s) => s.members);
  const detailLoading = useRoomStore((s) => s.detailLoading);
  const loadRoomDetail = useRoomStore((s) => s.loadRoomDetail);
  const joinedRooms = useRoomStore((s) => s.joinedRooms);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const setMemberMedia = useRoomStore((s) => s.setMemberMedia);

  const [goal, setGoal] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasJoined = !!joinedRooms[roomId];

  useEffect(() => {
    loadRoomDetail(roomId);
  }, [roomId]);

  const handleEnter = async () => {
    if (!goal.trim() || submitting) return;
    setSubmitting(true);
    await joinRoom(roomId, goal.trim());
    setSubmitting(false);
  };

  // 로딩 중
  if (detailLoading && !currentRoom) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#5B5BD6" />
      </SafeAreaView>
    );
  }

  // ── 5-1. 처음 입장: 목표 설정 화면 ─────────────────────────
  if (!hasJoined) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* 헤더 */}
          <View className="flex-row items-center px-4 py-2">
            <Pressable onPress={() => router.back()} hitSlop={10} className="p-1">
              <Ionicons name="chevron-back" size={26} color="#1A1A2E" />
            </Pressable>
            <Text className="ml-1 text-lg font-bold text-ink" numberOfLines={1}>
              {currentRoom?.title}
            </Text>
          </View>

          <View className="flex-1 px-6 pt-6">
            <View className="mb-6 self-start rounded-full bg-primary-light px-3 py-1.5">
              <Text className="text-xs font-semibold text-primary">
                D-{daysLeft(currentRoom?.endAt)} · 목표 설정
              </Text>
            </View>

            <Text className="text-2xl font-extrabold leading-8 text-ink">
              종료 기한까지{'\n'}어떤 목표에 도전할까요?
            </Text>
            <Text className="mt-2 text-sm text-ink-muted">
              구체적으로 적을수록 인증하기 쉬워져요.
            </Text>

            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder={'예) 매일 아침 6시에 일어나서\n모닝 루틴 사진 인증하기'}
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              className="mt-6 h-36 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base leading-6 text-ink"
            />
          </View>

          {/* 입장하기 버튼 */}
          <View className="px-6 pb-6">
            <Pressable
              onPress={handleEnter}
              disabled={!goal.trim() || submitting}
              className={`items-center rounded-xl py-4 ${
                goal.trim() && !submitting ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">입장하기</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── 5-2. 이후 입장: 메인 방 화면 ──────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-1 flex-row items-center">
          <Pressable onPress={() => router.back()} hitSlop={10} className="p-1">
            <Ionicons name="chevron-back" size={26} color="#1A1A2E" />
          </Pressable>
          <Text className="ml-1 flex-1 text-lg font-bold text-ink" numberOfLines={1}>
            {currentRoom?.title}
          </Text>
        </View>
        <Pressable
          onPress={() => setDetailVisible(true)}
          hitSlop={10}
          className="h-9 w-9 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="information-circle-outline" size={22} color="#5B5BD6" />
        </Pressable>
      </View>

      {/* 멤버 카드 그리드 */}
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120, gap: 12 }}
        ListHeaderComponent={
          <View className="mb-1 px-1">
            <Text className="text-sm text-ink-muted">
              멤버들의 목표와 인증을 확인해 보세요
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MemberCard
            member={item}
            isMe={item.userId === myUserId}
            onPickMedia={(memberId, asset) =>
              setMemberMedia(roomId, memberId, asset)
            }
          />
        )}
      />

      {/* 하단 고정 패널티 배너 */}
      <PenaltyBanner penalty={currentRoom?.penalty} />

      {/* 방 상세 모달 */}
      <RoomDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        room={currentRoom}
      />
    </SafeAreaView>
  );
}
