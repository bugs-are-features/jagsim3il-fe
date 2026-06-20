import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { penaltyPresets } from '../src/api/challenges';

// 방장용 패널티 설정 바텀시트
export function PenaltyEditSheet({ visible, onClose, initial, onSave }) {
  const insets = useSafeAreaInsets();
  const [penalty, setPenalty] = useState(initial || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) setPenalty(initial || '');
  }, [visible, initial]);

  const canSave = penalty.trim();

  const handleSave = async () => {
    if (!canSave || submitting) return;
    setSubmitting(true);
    await onSave(penalty.trim());
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
          <Text className="font-jua text-3xl font-bold text-ink">패널티 설정</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <Text className="font-gowunDodum mb-4 px-1 text-base text-ink-muted">
          목표를 못 지켰을 때의 패널티예요.{'\n'}챌린지 시작 전에 설정해 주세요.
        </Text>

        {/* 프리셋 */}
        <View className="mb-3 flex-row flex-wrap">
          {penaltyPresets.map((preset) => {
            const active = penalty === preset;
            return (
              <Pressable
                key={preset}
                onPress={() => setPenalty(preset)}
                className={`mb-2 mr-2 rounded-full border px-3 py-1.5 ${
                  active
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text
                  className={`text-xs ${
                    active ? 'font-semibold text-primary' : 'text-ink-muted'
                  }`}
                >
                  {preset}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          value={penalty}
          onChangeText={setPenalty}
          placeholder="직접 입력할 수도 있어요"
          placeholderTextColor="#9CA3AF"
          className="font-gowunDodum rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-ink"
        />

        <Pressable
          onPress={handleSave}
          disabled={!canSave || submitting}
          className={`mt-5 items-center rounded-xl py-4 ${
            canSave && !submitting ? 'bg-primary' : 'bg-gray-300'
          }`}
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
