import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { DateTimeField } from './DateTimeField';

const WEEK = 7 * 24 * 60 * 60 * 1000;

// 방장용 챌린지 시작 바텀시트 (시작/종료 일시 선언)
export function StartChallengeSheet({ visible, onClose, onStart }) {
  const insets = useSafeAreaInsets();
  const [startAt, setStartAt] = useState(new Date());
  const [endAt, setEndAt] = useState(new Date(Date.now() + WEEK));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      const now = new Date();
      setStartAt(now);
      setEndAt(new Date(now.getTime() + WEEK));
      setSubmitting(false);
    }
  }, [visible]);

  const canStart = endAt > startAt;

  const handleStart = async () => {
    if (!canStart || submitting) return;
    setSubmitting(true);
    await onStart(startAt, endAt);
    setSubmitting(false);
    onClose();
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
          <Text className="font-jua text-3xl font-bold text-ink">챌린지 시작</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <Text className="font-gowunDodum mb-4 px-1 text-base text-ink-muted">
          시작하면 멤버 가입·약속 수정이 잠기고{'\n'}인증 기간이 시작돼요.
        </Text>

        <DateTimeField label="시작 일시" value={startAt} onChange={setStartAt} />
        <DateTimeField label="종료 일시" value={endAt} onChange={setEndAt} />
        {endAt <= startAt && (
          <Text className="font-gowunDodum -mt-2 mb-3 text-xs text-red-500">
            종료 일시는 시작 일시 이후여야 해요.
          </Text>
        )}

        <Pressable
          onPress={handleStart}
          disabled={!canStart || submitting}
          className={`mt-3 items-center rounded-xl py-4 ${
            canStart && !submitting ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-jua text-xl font-bold text-white">시작하기</Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
}
