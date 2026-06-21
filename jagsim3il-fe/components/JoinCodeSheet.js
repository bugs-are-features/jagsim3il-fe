import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { BottomSheet } from './BottomSheet';
import { buildJoinToken } from '../src/api/challenges';

// 응답에서 가입 코드 추출 (필드명 미확정 대비)
function pickJoinCode(data) {
  if (!data) return '';
  return (
    data.join_cd ??
    data.joinCd ??
    data.join_info?.join_cd ??
    data.code ??
    ''
  );
}

// 방장용 가입 코드 설정 바텀시트
// onSave({ authYn, authCd }) → 응답(가입코드 포함) 반환
// onRegenerate() → 응답(새 가입코드 포함) 반환
export function JoinCodeSheet({
  visible,
  onClose,
  chalId,
  initialCode,
  initialAuthYn,
  initialAuthCd,
  onSave,
  onRegenerate,
}) {
  const insets = useSafeAreaInsets();
  const [useAuth, setUseAuth] = useState(initialAuthYn === 'Y');
  const [authCd, setAuthCd] = useState(initialAuthCd || '');
  const [joinCode, setJoinCode] = useState(initialCode || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // 참여자에게 공유할 코드 (chal_id + join_cd)
  const shareToken = buildJoinToken(chalId, joinCode);

  const copyShare = async () => {
    if (!shareToken) return;
    await Clipboard.setStringAsync(shareToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // 시트를 열 때마다 챌린지에 이미 설정된 가입 코드/인증 설정을 반영한다.
  useEffect(() => {
    if (visible) {
      setJoinCode(initialCode || '');
      setUseAuth(initialAuthYn === 'Y');
      setAuthCd(initialAuthCd || '');
      setError('');
    }
  }, [visible, initialCode, initialAuthYn, initialAuthCd]);

  const handleSave = async () => {
    if (submitting) return;
    if (useAuth && !/^\d{4}$/.test(authCd)) {
      setError('인증 코드는 4자리 숫자로 입력해 주세요.');
      return;
    }
    setError('');
    setSubmitting(true);
    // 코드가 없으면 "생성" → 생성된 코드를 보여줘야 하므로 닫지 않는다.
    // 코드가 이미 있으면 "저장" → 저장 후 닫는다.
    const isCreate = !joinCode;
    try {
      const res = await onSave({ authYn: useAuth ? 'Y' : 'N', authCd });
      const code = pickJoinCode(res);
      if (code) setJoinCode(code);
      if (!isCreate) onClose(); // 저장일 때만 시트 닫기
    } catch (e) {
      setError(e?.message || '저장에 실패했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerate = async () => {
    if (submitting) return;
    setSubmitting(true);
    const res = await onRegenerate();
    setSubmitting(false);
    const code = pickJoinCode(res);
    if (code) setJoinCode(code);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View
        className="rounded-t-3xl bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* 핸들 + 헤더 */}
        <View className="mb-2 items-center">
          <View className="h-1.5 w-10 rounded-full bg-gray-300" />
        </View>
        <View className="mt-1 mb-2 px-2 flex-row items-center justify-between">
          <Text className="font-jua text-3xl font-bold text-ink">가입 코드</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <Text className="font-gowunDodum mb-4 px-1 text-base text-ink-muted">
          멤버는 이 가입 코드로 챌린지에 참여할 수 있어요.
        </Text>

        {joinCode ? (
          <>
            {/* 멤버 초대 코드(공유용): chal_id + join_cd. 멤버는 이걸 그대로 입력 */}
            <View className="mb-2 rounded-2xl border border-primary/40 bg-primary-light/40 p-4">
              <Text className="font-gowunDodum text-sm font-semibold text-primary">
                챌린지 가입 코드 · 이 코드를 공유하세요
              </Text>
              <View className="mt-2 flex-row justify-between">
                {shareToken
                  .slice(0, 4)
                  .padEnd(4, ' ')
                  .split('')
                  .map((ch, i) => (
                    <View
                      key={i}
                      className="h-16 flex-1 items-center justify-center rounded-xl border border-primary/40 bg-white"
                      style={{ marginLeft: i === 0 ? 0 : 8 }}
                    >
                      <Text className="font-jua text-3xl text-ink">{ch}</Text>
                    </View>
                  ))}
              </View>
              <Pressable
                onPress={copyShare}
                className="mt-3 flex-row items-center justify-center rounded-xl bg-primary py-3"
              >
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color="white"
                />
                <Text className="ml-1.5 text-base font-bold text-white">
                  {copied ? '복사됨' : '초대 코드 복사'}
                </Text>
              </Pressable>
            </View>

            {/* 참고용 가입 코드(raw) */}
            <Text className="font-gowunDodum mb-4 px-1 text-xs text-ink-faint">
              가입 코드: <Text className="font-bold text-ink-muted">{joinCode}</Text>
            </Text>
          </>
        ) : (
          <View className="mb-4 items-center rounded-2xl border border-dashed border-primary/40 bg-primary-light/40 py-5">
            <Text className="font-gowunDodum text-sm text-ink-faint">
              아직 가입 코드가 없어요. 생성해 주세요.
            </Text>
          </View>
        )}

        {/* 인증 코드 사용 여부 */}
        <Pressable
          onPress={() => setUseAuth((v) => !v)}
          className="mb-3 flex-row items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
        >
          <View className="flex-1 pr-2">
            <Text className="font-gowunDodum text-base font-semibold text-ink">
              인증 코드 사용
            </Text>
            <Text className="font-gowunDodum mt-0.5 text-xs text-ink-faint">
              켜면 가입 코드와 4자리 인증 코드를 모두 입력해야 가입돼요.
            </Text>
          </View>
          {/* 커스텀 스위치: 노브가 좌우로 이동해 on/off가 명확함 */}
          <View
            className={`h-7 w-12 justify-center rounded-full px-0.5 ${useAuth ? 'bg-primary' : 'bg-gray-300'
              }`}
          >
            <View
              className={`h-6 w-6 rounded-full bg-white ${useAuth ? 'self-end' : 'self-start'}`}
            />
          </View>
        </Pressable>

        {useAuth && (
          <TextInput
            value={authCd}
            onChangeText={(t) => setAuthCd(t.replace(/[^0-9]/g, '').slice(0, 4))}
            placeholder="인증 코드 4자리"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={4}
            className="font-gowunDodum mb-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base tracking-widest text-ink"
          />
        )}

        {error ? (
          <Text className="mb-1 text-sm text-red-500">{error}</Text>
        ) : null}

        {/* 버튼 */}
        <Pressable
          onPress={handleSave}
          disabled={submitting}
          className={`mt-3 items-center rounded-xl py-4 ${submitting ? 'bg-gray-300' : 'bg-primary'
            }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-jua text-xl font-bold text-white">
              {joinCode ? '저장' : '가입 코드 생성'}
            </Text>
          )}
        </Pressable>

        {joinCode ? (
          <Pressable
            onPress={handleRegenerate}
            disabled={submitting}
            className="mt-2 items-center rounded-xl border border-gray-200 py-3.5"
          >
            <Text className="font-gowunDodum text-base font-semibold text-ink-muted">
              가입 코드 재발급
            </Text>
          </Pressable>
        ) : null}
      </View>
    </BottomSheet>
  );
}
