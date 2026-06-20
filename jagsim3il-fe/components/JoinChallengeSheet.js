import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { AvatarStack } from './Avatar';
import { formatDateTime } from '../src/utils/date';

// 가입 코드 생성 화면과 동일한 N칸 박스 입력 UI.
// - numericOnly: true면 숫자만, false면 영문 대/소문자+숫자 허용(대소문자 보존)
// 박스 위를 투명 TextInput으로 덮어, 탭하면 포커스되어 키보드가 뜬다.
function CodeBoxInput({ value, onChangeText, length = 4, numericOnly = false }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const sanitize = (t) => {
    const cleaned = numericOnly
      ? t.replace(/[^0-9]/g, '')
      : t.replace(/[^a-zA-Z0-9]/g, '');
    return cleaned.slice(0, length);
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View className="flex-row justify-between">
        {Array.from({ length }).map((_, i) => {
          const ch = value[i] ?? '';
          const active =
            focused &&
            (i === value.length || (value.length === length && i === length - 1));
          return (
            <View
              key={`code-box-${i}`}
              className={`h-16 flex-1 items-center justify-center rounded-xl border bg-white ${
                active ? 'border-primary' : 'border-primary/40'
              }`}
              style={{ marginLeft: i === 0 ? 0 : 8 }}
            >
              <Text className="font-jua text-3xl text-ink">{ch}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChangeText(sanitize(t))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        keyboardType={numericOnly ? 'number-pad' : 'default'}
        maxLength={length}
        className="absolute left-0 top-0 h-16 w-full opacity-0"
        style={{ opacity: 0 }}
      />
    </Pressable>
  );
}

// 코드로 챌린지 참여 바텀시트 (2단계: 가입 코드 입력 → 조회 → 참여)
// onPreview({ joinCd }) — join_cd로 챌린지 미리보기 조회, 챌린지 객체 반환(실패 시 throw)
// onJoin({ chalId, joinCd, authCd, isMember }) — 성공 시 resolve, 실패 시 throw(Error.message)
export function JoinChallengeSheet({ visible, onClose, onPreview, onJoin }) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState(''); // 방장이 공유한 가입 코드(join_cd, 4글자)
  const [authCd, setAuthCd] = useState('');
  const [joinCd, setJoinCd] = useState(''); // 조회에 사용한 가입 코드
  const [preview, setPreview] = useState(null); // 조회된 챌린지
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const CODE_LEN = 4;

  // 인증 코드 입력이 필요한 챌린지인지(미리보기 응답의 authYn)
  const needsAuth = preview?.authYn === 'Y';

  const reset = () => {
    setCode('');
    setAuthCd('');
    setJoinCd('');
    setPreview(null);
    setError('');
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── 1단계: 가입 코드로 조회 ─────────────────────────
  const handlePreview = async () => {
    if (!code.trim() || submitting) return;
    // 붙여넣기 시 공백/줄바꿈이 섞일 수 있어 모두 제거
    const cleaned = code.replace(/\s/g, '');
    setError('');
    setSubmitting(true);
    try {
      const challenge = await onPreview({ joinCd: cleaned });
      if (!challenge?.id) throw new Error('챌린지를 찾을 수 없어요.');
      setJoinCd(cleaned);
      setPreview(challenge);
    } catch (e) {
      setError(e.message || '조회에 실패했어요. 코드를 다시 확인해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 2단계: 참여 ─────────────────────────────────────
  const handleJoin = async () => {
    if (!preview || submitting) return;
    if (needsAuth && !/^\d{4}$/.test(authCd.trim())) {
      setError('인증 코드 4자리를 입력해 주세요.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onJoin({
        chalId: preview.id,
        joinCd,
        authCd: needsAuth ? authCd.trim() : '',
        isMember: !!preview.isMember,
      });
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
              방장에게 받은 가입 코드를 입력하세요.{'\n'}
              (가입 코드 화면에서 공유한 코드)
            </Text>

            <Text className="font-gowunDodum mb-2 text-lg font-semibold text-ink">가입 코드</Text>
            {/* 4글자 박스 입력. 대소문자 구분이 중요하므로 입력값을 변형하지 않는다. */}
            <CodeBoxInput value={code} onChangeText={setCode} length={CODE_LEN} />
            <Text className="font-gowunDodum mb-4 mt-2 px-1 text-xs text-ink-faint">
              영문 대소문자를 구분해서 입력해 주세요.
            </Text>

            {error ? <Text className="mb-2 text-sm text-red-500">{error}</Text> : null}

            <Pressable
              onPress={handlePreview}
              disabled={code.length !== CODE_LEN || submitting}
              className={`mt-1 items-center rounded-xl py-4 ${
                code.length === CODE_LEN && !submitting ? 'bg-primary' : 'bg-gray-300'
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

            {preview.isMember ? (
              <View className="mb-1 flex-row items-center rounded-xl bg-primary-light/40 px-4 py-3">
                <Ionicons name="checkmark-circle" size={18} color="#FF6A3D" />
                <Text className="font-gowunDodum ml-1.5 flex-1 text-sm text-ink">
                  이미 참여 중인 챌린지예요. 바로 이동할 수 있어요.
                </Text>
              </View>
            ) : needsAuth ? (
              <>
                <Text className="font-gowunDodum mb-2 text-lg font-semibold text-ink">
                  비밀번호 4자리
                </Text>
                {/* 가입 코드와 동일한 박스 UI, 숫자 4자리 비밀번호 */}
                <CodeBoxInput
                  value={authCd}
                  onChangeText={setAuthCd}
                  length={4}
                  numericOnly
                />
                <Text className="font-gowunDodum mt-2 px-1 text-xs text-ink-faint">
                  방장에게 받은 숫자 4자리 비밀번호를 입력해 주세요.
                </Text>
              </>
            ) : null}

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
                <Text className="font-jua text-xl font-bold text-white">
                  {preview.isMember
                    ? '이동하기'
                    : needsAuth
                      ? '인증하고 가입하기'
                      : '가입하기'}
                </Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </BottomSheet>
  );
}
