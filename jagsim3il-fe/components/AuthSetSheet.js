import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { AuthSetSelector } from './AuthSetSelector';
import { AUTH_TP } from '../src/api/challenges';

const DEFAULT_AUTH_SET = [{ authTp: AUTH_TP.TEXT, required: false }];

// 방장이 준비 중(preparing)에 인증 방식(auth_set)을 변경하는 바텀시트.
// initialAuthSet: [{ authTp, required }] (없으면 텍스트 기본값)
// onSave(authSet) — 저장 처리(throw 시 에러 메시지 표시)
export function AuthSetSheet({ visible, onClose, initialAuthSet, onSave }) {
  const insets = useSafeAreaInsets();
  const [authSet, setAuthSet] = useState(DEFAULT_AUTH_SET);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setAuthSet(
        Array.isArray(initialAuthSet) && initialAuthSet.length
          ? initialAuthSet
          : DEFAULT_AUTH_SET
      );
      setSubmitting(false);
      setError('');
    }
  }, [visible, initialAuthSet]);

  const canSave = authSet.length >= 1 && !submitting;

  const handleSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    setError('');
    try {
      await onSave(authSet);
      onClose();
    } catch (e) {
      setError(e?.message || '인증 방식을 저장하지 못했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={submitting ? undefined : onClose}>
      <View
        className="rounded-t-3xl bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="mb-2 items-center">
          <View className="h-1.5 w-10 rounded-full bg-gray-300" />
        </View>
        <View className="mt-1 mb-2 px-2 flex-row items-center justify-between">
          <Text className="font-jua text-3xl font-bold text-ink">인증 방식 설정</Text>
          <Pressable onPress={onClose} hitSlop={10} disabled={submitting}>
            <Ionicons name="close" size={24} color={submitting ? '#D1D5DB' : '#6B7280'} />
          </Pressable>
        </View>

        <Text className="font-gowunDodum mb-3 px-1 text-sm text-ink-muted">
          멤버들이 어떤 방식으로 인증할지 정해요. "필수"로 지정한 방식은 미제출 시 당일 인증이 무효 처리돼요.
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <AuthSetSelector value={authSet} onChange={setAuthSet} />
        </ScrollView>

        {error ? (
          <Text className="mt-1 px-1 text-sm text-red-500">{error}</Text>
        ) : authSet.length < 1 ? (
          <Text className="mt-1 px-1 text-sm text-red-500">
            인증 방식을 최소 1개 선택해 주세요.
          </Text>
        ) : null}

        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          className={`mt-4 items-center rounded-xl py-4 ${canSave ? 'bg-primary' : 'bg-gray-300'}`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-jua text-xl font-bold text-white">저장</Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
}
