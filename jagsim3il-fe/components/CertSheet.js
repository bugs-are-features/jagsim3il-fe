import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';

const MAX_LEN = 500;

// 오늘의 인증(텍스트 메모) 작성/수정 바텀시트
// 백엔드 인증은 텍스트 메모만 받는다(1~500자).
// initialContent가 있으면 "수정", 없으면 "작성" 모드.
// onSave(content) — 저장 처리(throw 시 에러 메시지 표시)
export function CertSheet({ visible, onClose, goal, initialContent, onSave }) {
  const insets = useSafeAreaInsets();
  const isEdit = !!initialContent;
  const [content, setContent] = useState(initialContent || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setContent(initialContent || '');
      setSubmitting(false);
      setError('');
    }
  }, [visible, initialContent]);

  const trimmed = content.trim();
  const canSave = trimmed.length >= 1 && trimmed.length <= MAX_LEN && !submitting;

  const handleSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    setError('');
    try {
      await onSave(trimmed);
      onClose();
    } catch (e) {
      setError(e?.message || '인증에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
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
          <Text className="font-jua text-3xl font-bold text-ink">
            {isEdit ? '인증 수정' : '오늘 인증하기'}
          </Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        {/* 내 목표 안내 */}
        {goal ? (
          <View className="mb-3 flex-row items-start rounded-2xl bg-primary-light/50 px-4 py-3">
            <Ionicons name="flag" size={16} color="#FF6A3D" style={{ marginTop: 2 }} />
            <Text className="font-gowunDodum ml-2 flex-1 text-sm text-ink" numberOfLines={3}>
              {goal}
            </Text>
          </View>
        ) : null}

        <Text className="font-gowunDodum mb-2 px-1 text-base text-ink-muted">
          오늘 목표를 어떻게 실천했는지 메모로 남겨주세요.
        </Text>

        <TextInput
          value={content}
          onChangeText={(t) => setContent(t.slice(0, MAX_LEN))}
          placeholder={'예) 아침 6시에 일어나 30분 러닝 완료!'}
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          maxLength={MAX_LEN}
          className="font-gowunDodum h-36 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base leading-6 text-ink"
        />

        <View className="mt-1 flex-row items-center justify-between px-1">
          {error ? (
            <Text className="flex-1 text-sm text-red-500">{error}</Text>
          ) : (
            <View />
          )}
          <Text className="text-xs text-ink-faint">
            {trimmed.length}/{MAX_LEN}
          </Text>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          className={`mt-4 items-center rounded-xl py-4 ${canSave ? 'bg-primary' : 'bg-gray-300'}`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-jua text-xl font-bold text-white">
              {isEdit ? '수정 완료' : '인증 완료'}
            </Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
}
