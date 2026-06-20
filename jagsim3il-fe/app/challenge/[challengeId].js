import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MemberCard } from '../../components/MemberCard';
import { PenaltyBanner } from '../../components/PenaltyBanner';
import { ChallengeDetailModal } from '../../components/ChallengeDetailModal';
import { PenaltyEditSheet } from '../../components/PenaltyEditSheet';
import { StartChallengeSheet } from '../../components/StartChallengeSheet';
import { useChallengeStore } from '../../src/store/challengeStore';
import { useAuthStore } from '../../src/store/authStore';

// 인증 요일 (월~일)
const DAYS = [
  { key: 'mon', label: '월' },
  { key: 'tue', label: '화' },
  { key: 'wed', label: '수' },
  { key: 'thu', label: '목' },
  { key: 'fri', label: '금' },
  { key: 'sat', label: '토' },
  { key: 'sun', label: '일' },
];
const ALL_DAYS = { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true };

export default function ChallengeScreen() {
  const { challengeId } = useLocalSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const myUserId = user?.username;

  const currentChallenge = useChallengeStore((s) => s.currentChallenge);
  const members = useChallengeStore((s) => s.members);
  const myPromise = useChallengeStore((s) => s.myPromise);
  const detailLoading = useChallengeStore((s) => s.detailLoading);
  const loadChallengeDetail = useChallengeStore((s) => s.loadChallengeDetail);
  const upsertPromise = useChallengeStore((s) => s.upsertPromise);
  const updateChallenge = useChallengeStore((s) => s.updateChallenge);
  const startChallenge = useChallengeStore((s) => s.startChallenge);
  const setMemberMedia = useChallengeStore((s) => s.setMemberMedia);

  const [goal, setGoal] = useState('');
  const [certDays, setCertDays] = useState(ALL_DAYS);
  const [detailVisible, setDetailVisible] = useState(false);
  const [penaltyVisible, setPenaltyVisible] = useState(false);
  const [startVisible, setStartVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 내 약속이 있으면 입장한 상태
  const hasJoined = !!myPromise?.desc;
  // 방장 여부: 백엔드가 내려주는 is_owner 사용
  const isOwner = !!currentChallenge?.isOwner;
  // 챌린지 시작 여부: status가 'preparing'이 아니면 시작된 것으로 본다
  const started =
    !!currentChallenge?.startedAt ||
    (!!currentChallenge?.status && currentChallenge.status !== 'preparing');
  const hasPenalty = !!currentChallenge?.penalty;

  const handleStart = async (s, e) => {
    await startChallenge(challengeId, s, e);
    await loadChallengeDetail(challengeId);
  };

  useEffect(() => {
    loadChallengeDetail(challengeId);
  }, [challengeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDay = (key) => setCertDays((d) => ({ ...d, [key]: !d[key] }));
  const anyDay = Object.values(certDays).some(Boolean);
  const canEnter = goal.trim() && anyDay;

  const handleEnter = async () => {
    if (!canEnter || submitting) return;
    setSubmitting(true);
    // 약속(목표 + 인증 요일) 등록 → 입장
    await upsertPromise(challengeId, goal.trim(), certDays);
    setSubmitting(false);
  };

  // 로딩 중
  if (detailLoading && !currentChallenge) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#FF6A3D" />
      </SafeAreaView>
    );
  }

  // ── 처음 입장: 약속(목표 + 인증 요일) 설정 화면 ─────────────
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
            <Text className="font-jua ml-1 text-xl font-bold text-ink" numberOfLines={1}>
              {currentChallenge?.title}
            </Text>
          </View>

          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-6 self-start rounded-full bg-primary-light px-3 py-1.5">
              <Text className="text-xs font-semibold text-primary">약속 설정</Text>
            </View>

            {/* 목표 */}
            <Text className="font-jua text-2xl font-extrabold leading-8 text-ink">
              어떤 목표에{'\n'}도전할까요?
            </Text>
            <Text className="font-gowunDodum mt-2 text-lg text-ink-muted">
              구체적으로 적을수록 인증하기 쉬워져요.
            </Text>
            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder={'예) 매일 아침 6시에 일어나서\n모닝 루틴 사진 인증하기'}
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              className="font-gowunDodum mt-4 h-36 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base leading-6 text-ink"
            />

            {/* 인증 요일 */}
            <Text className="font-gowunDodum mb-3 mt-6 text-lg text-ink">인증 요일</Text>
            <View className="flex-row justify-between">
              {DAYS.map((d) => {
                const active = certDays[d.key];
                return (
                  <Pressable
                    key={d.key}
                    onPress={() => toggleDay(d.key)}
                    className={`h-11 w-11 items-center justify-center rounded-full border ${
                      active
                        ? 'border-primary bg-primary'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        active ? 'text-white' : 'text-ink-faint'
                      }`}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* 입장하기 버튼 */}
          <View className="px-6 pb-6">
            <Pressable
              onPress={handleEnter}
              disabled={!canEnter || submitting}
              className={`items-center rounded-xl py-4 ${
                canEnter && !submitting ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-jua text-xl font-bold text-white">입장하기</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── 이후 입장: 메인 챌린지 화면 ──────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-1 flex-row items-center">
          <Pressable onPress={() => router.back()} hitSlop={10} className="p-1">
            <Ionicons name="chevron-back" size={26} color="#1A1A2E" />
          </Pressable>
          <Text className="font-jua ml-1 flex-1 text-xl font-bold text-ink" numberOfLines={1}>
            {currentChallenge?.title}
          </Text>
        </View>
        <Pressable
          onPress={() => setDetailVisible(true)}
          hitSlop={10}
          className="h-9 w-9 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="information-circle-outline" size={22} color="#FF6A3D" />
        </Pressable>
      </View>

      {/* 멤버 카드 그리드 */}
      <FlatList
        data={members}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120, gap: 12 }}
        ListHeaderComponent={
          <View className="mb-1 px-1">
            {/* 방장 시작 준비: 약속 ✓ → 패널티 → 시작 */}
            {isOwner && !started ? (
              <View className="mb-3 rounded-2xl bg-white p-4">
                <Text className="font-jua text-lg text-ink">챌린지 시작 준비</Text>
                <Text className="font-gowunDodum mt-0.5 text-sm text-ink-muted">
                  패널티를 설정한 뒤 챌린지를 시작하세요.
                </Text>

                {/* 1. 약속 (입장 시 완료) */}
                <View className="mt-3 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#FF6A3D" />
                  <Text className="ml-2 text-sm font-semibold text-ink">약속 설정 완료</Text>
                </View>

                {/* 2. 패널티 설정 */}
                <Pressable
                  onPress={() => setPenaltyVisible(true)}
                  className="mt-2 flex-row items-center justify-between rounded-xl border border-gray-200 px-3 py-3"
                >
                  <View className="flex-1 flex-row items-center">
                    <Ionicons
                      name={hasPenalty ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={hasPenalty ? '#FF6A3D' : '#9CA3AF'}
                    />
                    <Text className="ml-2 flex-1 text-sm text-ink" numberOfLines={1}>
                      {hasPenalty ? currentChallenge.penalty : '패널티 설정하기'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>

                {/* 3. 챌린지 시작 */}
                <Pressable
                  onPress={() => setStartVisible(true)}
                  disabled={!hasPenalty}
                  className={`mt-3 items-center rounded-xl py-3 ${
                    hasPenalty ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <Text className="font-jua text-lg font-bold text-white">
                    챌린지 시작하기
                  </Text>
                </Pressable>
                {!hasPenalty && (
                  <Text className="font-gowunDodum mt-1.5 text-xs text-ink-faint">
                    패널티를 먼저 설정해야 시작할 수 있어요.
                  </Text>
                )}
              </View>
            ) : null}

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
              setMemberMedia(challengeId, memberId, asset)
            }
          />
        )}
      />

      {/* 하단 고정 패널티 배너 (시작 전 방장만 탭하여 설정) */}
      <PenaltyBanner
        penalty={currentChallenge?.penalty}
        editable={isOwner && !started}
        onEdit={() => setPenaltyVisible(true)}
      />

      {/* 챌린지 상세 모달 */}
      <ChallengeDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        challenge={currentChallenge}
      />

      {/* 패널티 설정 (방장) */}
      <PenaltyEditSheet
        visible={penaltyVisible}
        onClose={() => setPenaltyVisible(false)}
        initial={currentChallenge?.penalty}
        onSave={(p) => updateChallenge(challengeId, { penalty: p })}
      />

      {/* 챌린지 시작 (방장) */}
      <StartChallengeSheet
        visible={startVisible}
        onClose={() => setStartVisible(false)}
        onStart={handleStart}
      />
    </SafeAreaView>
  );
}
