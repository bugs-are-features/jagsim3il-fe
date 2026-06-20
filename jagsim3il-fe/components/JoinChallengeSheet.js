import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { AvatarStack } from './Avatar';
import { parseJoinToken } from '../src/api/challenges';
import { formatDateTime } from '../src/utils/date';

// 코드로 챌린지 참여 바텀시트 (2단계: 코드 입력 → 조회 → 참여)
// onPreview({ chalId, joinCd }) — join_cd로 챌린지 정보 조회, 챌린지 객체 반환(실패 시 throw)
// onJoin({ chalId, joinCd, authCd }) — 성공 시 resolve, 실패 시 throw(Error.message)
export function JoinChallengeSheet({ visible, onClose, onPreview, onJoin }) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState(''); // 방장이 공유한 참여 코드
  const [authCd, setAuthCd] = useState('');
  const [parsed, setParsed] = useState(null); // { chalId, joinCd }
  const [preview, setPreview] = useState(null); // 조회된 챌린지
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setCode('');
    setAuthCd('');
    setParsed(null);
    setPreview(null);
    setError('');
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── 1단계: 코드로 조회 ──────────────────────────────
  const handlePreview = async () => {
    if (!code.trim() || submitting) return;
    // 붙여넣기 시 공백/줄바꿈이 섞일 수 있어 모두 제거
    const cleaned = code.replace(/\s/g, '');
    const p = parseJoinToken(cleaned);
    if (!p) {
      setError(
        '초대 코드 형식이 올바르지 않아요. 방장의 "가입 코드" 화면에서 [초대 코드 복사]로 받은 긴 코드를 붙여넣어 주세요.'
      );
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const challenge = await onPreview({ chalId: p.chalId, joinCd: p.joinCd });
      if (!challenge) throw new Error('챌린지를 찾을 수 없어요.');
      setParsed(p);
      setPreview(challenge);
    } catch (e) {
      setError(e.message || '조회에 실패했어요. 코드를 다시 확인해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 2단계: 참여 ─────────────────────────────────────
  const handleJoin = async () => {
    if (!parsed || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await onJoin({ chalId: parsed.chalId, joinCd: parsed.joinCd, authCd: authCd.trim() });
      reset();
      onClose();
    } catch (e) {
      setError(e.message || '참여에 실패했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <View
        className="rounded-t-3xl bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* 핸들 + 헤더 */}
        <View className="mb-2 items-center">
          <View className="h-1.5 w-10 rounded-full bg-gray-300" />
        </View>
        <View className="mt-1 mb-2 px-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            {preview ? (
              <Pressable onPress={() => setPreview(null)} hitSlop={10} className="mr-1">
                <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
              </Pressable>
            ) : null}
            <Text className="font-jua text-3xl font-bold text-ink">
              {preview ? '챌린지 미리보기' : '코드로 참여하기'}
            </Text>
          </View>
          <Pressable onPress={handleClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        {!preview ? (
          // ── 1단계: 코드 입력 ─────────────────────────────
          <>
            <Text className="font-gowunDodum mb-4 px-1 text-base text-ink-muted">
              방장에게 받은 초대 코드를 붙여넣으세요.{'\n'}
              (가입 코드 화면의 [초대 코드 복사] 버튼으로 받은 긴 코드)
            </Text>

            <Text className="font-gowunDodum mb-2 text-lg font-semibold text-ink">초대 코드</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="예) 3f9a…-…-….A1B2C3"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              className="font-gowunDodum mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-ink"
            />

            {error ? <Text className="mb-2 text-sm text-red-500">{error}</Text> : null}

            <Pressable
              onPress={handlePreview}
              disabled={!code.trim() || submitting}
              className={`mt-1 items-center rounded-xl py-4 ${
                code.trim() && !submitting ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-jua text-xl font-bold text-white">조회하기</Text>
              )}
            </Pressable>
          </>
        ) : (
          // ── 2단계: 미리보기 + 참여 ───────────────────────
          <>
            <View className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <Text className="font-jua text-xl font-bold text-ink">{preview.title}</Text>
              {preview.description ? (
                <Text className="font-gowunDodum mt-1 text-sm text-ink-muted">
                  {preview.description}
                </Text>
              ) : null}

              {preview.penalty ? (
                <View className="mt-3 flex-row items-center">
                  <Ionicons name="warning-outline" size={16} color="#FF6A3D" />
                  <Text className="font-gowunDodum ml-1.5 flex-1 text-sm text-ink" numberOfLines={2}>
                    {preview.penalty}
                  </Text>
                </View>
              ) : null}

              {preview.startAt || preview.endAt ? (
                <View className="mt-2 flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                  <Text className="font-gowunDodum ml-1.5 text-xs text-ink-faint">
                    {formatDateTime(preview.startAt)} ~ {formatDateTime(preview.endAt)}
                  </Text>
                </View>
              ) : null}

              <View className="mt-3 flex-row items-center justify-between">
                <Text className="font-gowunDodum text-xs text-ink-faint">
                  참여 멤버 {preview.memberCount}명
                </Text>
                <AvatarStack members={preview.members} size={28} max={6} />
              </View>
            </View>

            <Text className="font-gowunDodum mb-2 text-lg font-semibold text-ink">
              인증 코드 <Text className="text-sm font-normal text-ink-faint">(필요한 경우)</Text>
            </Text>
            <TextInput
              value={authCd}
              onChangeText={(t) => setAuthCd(t.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="4자리 인증 코드"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={4}
              className="font-gowunDodum rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base tracking-widest text-ink"
            />

            {error ? <Text className="mt-3 text-sm text-red-500">{error}</Text> : null}

            <Pressable
              onPress={handleJoin}
              disabled={submitting}
              className={`mt-5 items-center rounded-xl py-4 ${
                submitting ? 'bg-gray-300' : 'bg-primary'
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-jua text-xl font-bold text-white">참여하기</Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </BottomSheet>
  );
}
