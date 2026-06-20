import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';

// 코드로 챌린지 참여 바텀시트
// onJoin({ chalId, joinCd, authCd }) — 성공 시 resolve, 실패 시 throw(Error.message)
export function JoinChallengeSheet({ visible, onClose, onJoin }) {
  const insets = useSafeAreaInsets();
  const [chalId, setChalId] = useState('');
  const [joinCd, setJoinCd] = useState('');
  const [authCd, setAuthCd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setChalId('');
    setJoinCd('');
    setAuthCd('');
    setError('');
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canSubmit = chalId.trim() && joinCd.trim();

  const handleJoin = async () => {
    if (!canSubmit || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await onJoin({
        chalId: chalId.trim(),
        joinCd: joinCd.trim(),
        authCd: authCd.trim(),
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
          <Text className="font-jua text-3xl font-bold text-ink">코드로 참여하기</Text>
          <Pressable onPress={handleClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <Text className="font-gowunDodum mb-4 px-1 text-base text-ink-muted">
          방장에게 받은 챌린지 ID와 가입 코드를 입력하세요.
        </Text>

        <Text className="font-gowunDodum mb-2 text-lg font-semibold text-ink">챌린지 ID</Text>
        <TextInput
          value={chalId}
          onChangeText={setChalId}
          placeholder="챌린지 ID"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          className="font-gowunDodum mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-ink"
        />

        <Text className="font-gowunDodum mb-2 text-lg font-semibold text-ink">가입 코드</Text>
        <TextInput
          value={joinCd}
          onChangeText={setJoinCd}
          placeholder="가입 코드"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          className="font-gowunDodum mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-ink"
        />

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

        {error ? (
          <Text className="mt-3 text-sm text-red-500">{error}</Text>
        ) : null}

        <Pressable
          onPress={handleJoin}
          disabled={!canSubmit || submitting}
          className={`mt-5 items-center rounded-xl py-4 ${
            canSubmit && !submitting ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-jua text-xl font-bold text-white">참여하기</Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
}
