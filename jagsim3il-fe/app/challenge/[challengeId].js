import { useEffect, useMemo, useState } from 'react';
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
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MemberCard } from '../../components/MemberCard';
import { PenaltyBanner } from '../../components/PenaltyBanner';
import { ChallengeDetailModal } from '../../components/ChallengeDetailModal';
import { PenaltyEditSheet } from '../../components/PenaltyEditSheet';
import { StartChallengeSheet } from '../../components/StartChallengeSheet';
import { JoinCodeSheet } from '../../components/JoinCodeSheet';
import { PromiseEditSheet } from '../../components/PromiseEditSheet';
import { CertSheet } from '../../components/CertSheet';
import { MemberCertHistorySheet } from '../../components/MemberCertHistorySheet';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ChallengeStatusBanner } from '../../components/ChallengeStatusBanner';
import { useChallengeStore } from '../../src/store/challengeStore';
import { useAuthStore } from '../../src/store/authStore';
import { daysLeft } from '../../src/utils/date';

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

  const currentChallenge = useChallengeStore((s) => s.currentChallenge);
  const members = useChallengeStore((s) => s.members);
  const myPromise = useChallengeStore((s) => s.myPromise);
  const myPenalty = useChallengeStore((s) => s.myPenalty);
  const detailLoading = useChallengeStore((s) => s.detailLoading);
  const loadChallengeDetail = useChallengeStore((s) => s.loadChallengeDetail);
  const prepareChallengeDetail = useChallengeStore((s) => s.prepareChallengeDetail);
  const upsertPromise = useChallengeStore((s) => s.upsertPromise);
  const submitCert = useChallengeStore((s) => s.submitCert);
  const updateChallenge = useChallengeStore((s) => s.updateChallenge);
  const startChallenge = useChallengeStore((s) => s.startChallenge);
  const endChallenge = useChallengeStore((s) => s.endChallenge);
  const setJoinInfo = useChallengeStore((s) => s.setJoinInfo);
  const regenerateJoinCode = useChallengeStore((s) => s.regenerateJoinCode);
  const setMemberMedia = useChallengeStore((s) => s.setMemberMedia);
  const leaveChallenge = useChallengeStore((s) => s.leaveChallenge);
  const loadChallenges = useChallengeStore((s) => s.loadChallenges);

  const [goal, setGoal] = useState('');
  const [certDays, setCertDays] = useState(ALL_DAYS);
  const [detailVisible, setDetailVisible] = useState(false);
  const [penaltyVisible, setPenaltyVisible] = useState(false);
  const [startVisible, setStartVisible] = useState(false);
  const [joinCodeVisible, setJoinCodeVisible] = useState(false);
  const [promiseEditVisible, setPromiseEditVisible] = useState(false);
  const [certVisible, setCertVisible] = useState(false);
  const [historyMember, setHistoryMember] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 내 약속이 있으면 입장한 상태
  const hasJoined = !!myPromise?.desc;
  // 방장 여부: 백엔드가 내려주는 is_owner 사용
  const isOwner = !!currentChallenge?.isOwner;
  // 챌린지 시작 여부: status가 'preparing'이 아니면 시작된 것으로 본다
  const started =
    !!currentChallenge?.startedAt ||
    (!!currentChallenge?.status && currentChallenge.status !== 'preparing');
  const status = currentChallenge?.status ?? 'preparing';
  const isActive = status === 'active';
  const hasPenalty = !!currentChallenge?.penalty;
  // 가입 코드 (정규화된 joinCd 또는 설정 후 병합된 값)
  const joinCode =
    currentChallenge?.joinCd ?? currentChallenge?.raw?.join_cd ?? '';
  const ownerAlias = currentChallenge?.ownerName || '방장';

  const handleStart = async (s, e) => {
    await startChallenge(challengeId, s, e);
    await loadChallengeDetail(challengeId);
  };

  // 아래로 당겨 새로고침: 챌린지 상세/멤버/인증 정보 다시 조회
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChallengeDetail(challengeId);
    setRefreshing(false);
  };

  // 약속(목표)을 설정하지 않은 멤버 목록
  const membersWithoutPromise = members.filter((m) => !m.goal?.trim());

  // "챌린지 시작하기" 누름 → 약속 미설정 멤버가 있으면 퇴장 경고 후 시작 시트로 진행
  const handleStartPress = () => {
    if (membersWithoutPromise.length > 0) {
      const list = membersWithoutPromise
        .map((m) => `- ${m.nickname || '이름없음'}(미설정)`)
        .join('\n');
      Alert.alert(
        '챌린지 시작',
        `약속을 설정하지 않는 멤버는 퇴장처리 됩니다.\n챌린지를 시작하시겠습니까?\n${list}`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '시작하기',
            style: 'destructive',
            onPress: () => setStartVisible(true),
          },
        ]
      );
      return;
    }
    setStartVisible(true);
  };

  // 시작 전 비방장 멤버만 탈퇴 가능
  const canLeave = hasJoined && !isOwner && !started;
  // 진행 중(active) 방장만 조기 종료 가능
  const canEndEarly = isOwner && isActive;
  // 시작 전이면 내 약속 수정 가능
  const canEditPromise = hasJoined && !started;

  const handleLeave = () => {
    Alert.alert('챌린지 나가기', '정말 이 챌린지에서 나갈까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: async () => {
          await leaveChallenge(challengeId);
          await loadChallenges();
          setDetailVisible(false);
          router.back();
        },
      },
    ]);
  };

  const handleEndEarly = () => {
    const left = daysLeft(currentChallenge?.endAt);
    const remainMsg =
      left > 0 ? `도전 성공까지 ${left}일 남았습니다.` : '오늘이 마지막 날입니다.';
    Alert.alert(
      '챌린지 조기 종료',
      `${remainMsg}\n정말 조기 종료할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '종료하기',
          style: 'destructive',
          onPress: async () => {
            try {
              await endChallenge(challengeId);
              await loadChallengeDetail(challengeId);
              setDetailVisible(false);
            } catch (e) {
              Alert.alert('조기 종료 실패', e?.message || '요청 처리 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  // "내 카드" 판별 — 정확히 한 명만 나로 확정한다.
  // 멤버의 매칭 키는 로그인ID(member.loginId). 로그인 사용자의 username이 로그인ID다.
  const myIdSet = [
    user?.username, // 로그인 ID (= 멤버 loginId)
    user?.raw?.id,
    user?.id,
    user?.email,
  ]
    .filter((v) => v != null)
    .map(String);

  const myMember =
    members.find((m) => m.isMe === true) || // 1) 서버가 알려주면 그대로
    members.find((m) => m.loginId != null && myIdSet.includes(String(m.loginId))) || // 2) 로그인ID 매칭
    members.find((m) => m.userId != null && myIdSet.includes(String(m.userId))) || // 3) UUID 매칭(대비)
    (user?.nickname
      ? members.find((m) => m.nickname === user.nickname) // 4) 최후: 닉네임 일치(한 명만)
      : null) ||
    null;

  const isMine = (m) => !!myMember && m.id === myMember.id;

  // 내 카드를 최상단, 나머지는 기존 순서 유지
  const sortedMembers = useMemo(() => {
    if (!myMember) return members;
    const rest = members.filter((m) => m.id !== myMember.id);
    return [myMember, ...rest];
  }, [members, myMember]);

  useEffect(() => {
    prepareChallengeDetail(challengeId);
    loadChallengeDetail(challengeId);

    // 화면에 머무는 동안 10초마다 챌린지 정보 자동 갱신
    const timer = setInterval(() => {
      loadChallengeDetail(challengeId);
    }, 10_000);

    return () => clearInterval(timer);
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

  // 오늘 인증(텍스트) 저장 — 실패 시 에러를 시트에서 표시하도록 throw
  const handleCertSave = async (content) => {
    await submitCert(challengeId, content);
  };

  // 로딩 중 — 다른 챌린지 state가 보이지 않도록 전환 시에도 전체 화면 로딩
  const isDetailReady = currentChallenge?.id === challengeId;
  if (detailLoading && !isDetailReady) {
    return <LoadingScreen message="챌린지 정보를 불러오는 중..." />;
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
                    className={`h-11 w-11 items-center justify-center rounded-full border ${active
                      ? 'border-primary bg-primary'
                      : 'border-gray-200 bg-white'
                      }`}
                  >
                    <Text
                      className={`text-sm font-bold ${active ? 'text-white' : 'text-ink-faint'
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
              className={`items-center rounded-xl py-4 ${canEnter && !submitting ? 'bg-primary' : 'bg-gray-300'
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
          <Text className="font-jua ml-1 flex-1 text-2xl font-bold text-ink" numberOfLines={1}>
            {currentChallenge?.title}
          </Text>
        </View>
        <Pressable
          onPress={() => setDetailVisible(true)}
          hitSlop={10}
          className="h-12 w-12 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="information-circle-outline" size={30} color="#FF6A3D" />
        </Pressable>
      </View>

      {/* 멤버 카드 그리드 */}
      <FlatList
        data={sortedMembers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 120,
          paddingHorizontal: 16,
          gap: 12,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF6A3D"
          />
        }
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
                  <Text className="ml-2 font-jua text-sm text-ink">약속 설정 완료</Text>
                </View>

                {/* 2. 가입 코드 설정 */}
                <Pressable
                  onPress={() => setJoinCodeVisible(true)}
                  className="mt-2 flex-row items-center justify-between rounded-xl border border-gray-200 px-3 py-3"
                >
                  <View className="flex-1 flex-row items-center">
                    <Ionicons
                      name={joinCode ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={joinCode ? '#FF6A3D' : '#9CA3AF'}
                    />
                    <Text className="ml-2 font-gowunDodum flex-1 text-sm text-ink" numberOfLines={1}>
                      {joinCode ? `가입 코드 ${joinCode}` : '가입 코드 설정하기'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>

                {/* 3. 패널티 설정 */}
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
                    <Text className="ml-2 font-gowunDodum flex-1 text-sm text-ink" numberOfLines={1}>
                      {hasPenalty ? currentChallenge.penalty : '패널티 설정하기'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>

                {/* 4. 챌린지 시작 */}
                <Pressable
                  onPress={handleStartPress}
                  disabled={!hasPenalty}
                  className={`mt-3 items-center rounded-xl py-3 ${hasPenalty ? 'bg-primary' : 'bg-gray-300'
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
            ) : !started ? (
              // 비방장: 챌린지 시작 전 — 방장이 준비 중임을 안내
              <View className="mb-3 items-center rounded-2xl bg-white px-5 py-6">
                <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-primary-light">
                  <Ionicons name="hourglass-outline" size={28} color="#FF6A3D" />
                </View>
                <Text className="font-jua text-center text-xl font-bold text-ink">
                  {ownerAlias}님이{'\n'}챌린지를 준비하고 있어요!
                </Text>
                <Text className="font-gowunDodum mt-2 text-center text-sm leading-5 text-ink-muted">
                  시작되면 여기서 인증을 시작할 수 있어요.{'\n'}
                  그 전까지 멤버들의 약속을 확인해 보세요.
                </Text>
              </View>
            ) : null}

            {/* 시작 후: 일차별 조언/상태 카드 */}
            {started ? (
              <ChallengeStatusBanner
                startAt={currentChallenge?.startAt ?? currentChallenge?.startedAt}
                status={status}
              />
            ) : null}

            <View className="mb-3 border-b border-gray-200" />

            <Text className="font-gowunDodum text-lg text-ink-muted">
              {started
                ? '멤버들의 목표와 인증을 확인해 보세요'
                : '멤버들의 약속을 확인해 보세요'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MemberCard
            member={item}
            isMe={isMine(item)}
            started={started}
            status={status}
            canEditPromise={canEditPromise}
            onEditPromise={() => setPromiseEditVisible(true)}
            onWriteCert={() => setCertVisible(true)}
            onShowHistory={(m) => setHistoryMember(m)}
            onPickMedia={(memberId, asset) =>
              setMemberMedia(challengeId, memberId, asset)
            }
          />
        )}
      />

      {/* 하단 고정 패널티 배너 — 시작 전(방장)엔 설정, 시작 후엔 내 패널티 횟수 노출 */}
      <PenaltyBanner
        penalty={currentChallenge?.penalty}
        editable={isOwner && !started}
        onEdit={() => setPenaltyVisible(true)}
        missedCount={started ? myPenalty?.missedCount ?? null : null}
      />

      {/* 챌린지 상세 모달 */}
      <ChallengeDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        challenge={currentChallenge}
        canLeave={canLeave}
        onLeave={handleLeave}
        canEndEarly={canEndEarly}
        onEndEarly={handleEndEarly}
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

      {/* 가입 코드 설정 (방장) */}
      <JoinCodeSheet
        visible={joinCodeVisible}
        onClose={() => setJoinCodeVisible(false)}
        chalId={challengeId}
        initialCode={joinCode}
        initialAuthYn={currentChallenge?.authYn}
        initialAuthCd={currentChallenge?.authCd}
        onSave={(info) => setJoinInfo(challengeId, info)}
        onRegenerate={() => regenerateJoinCode(challengeId)}
      />

      {/* 내 약속 수정 (시작 전) */}
      <PromiseEditSheet
        visible={promiseEditVisible}
        onClose={() => setPromiseEditVisible(false)}
        initialDesc={myPromise?.desc}
        initialCertDays={myPromise?.certDays}
        onSave={async (desc, days) => {
          await upsertPromise(challengeId, desc, days);
          // 멤버 카드의 목표/인증 요일을 갱신하기 위해 상세를 다시 불러온다.
          await loadChallengeDetail(challengeId);
        }}
      />

      {/* 멤버 인증 내역 (카드 탭) */}
      <MemberCertHistorySheet
        visible={!!historyMember}
        onClose={() => setHistoryMember(null)}
        member={historyMember}
      />

      {/* 오늘 인증 작성/수정 (진행 중, 인증 요일) */}
      <CertSheet
        visible={certVisible}
        onClose={() => setCertVisible(false)}
        goal={myMember?.goal || myPromise?.desc}
        initialContent={
          myMember?.todayCert?.status === 'uploaded'
            ? myMember.todayCert.content
            : ''
        }
        onSave={handleCertSave}
      />
    </SafeAreaView>
  );
}
