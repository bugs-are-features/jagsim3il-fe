import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';

// 홈 화면에서 열리는 "챌린지 추가" 모달
// 제목/설명만 입력해 챌린지를 생성한다.
// 시작/종료 일시와 패널티는 생성 후 챌린지에 입장할 때 설정한다.
export function CreateChallengeModal({ visible, onClose, onCreate }) {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canSubmit = title.trim();

  const handleCreate = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    await onCreate({
      title: title.trim(),
      description: description.trim(),
    });
    setSubmitting(false);
    reset();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
          <View
            className="rounded-t-3xl bg-white px-5 pt-3"
            style={{ paddingBottom: insets.bottom + 16, maxHeight: '90%' }}
          >
            {/* 핸들 + 헤더 */}
            <View className="mb-2 items-center">
              <View className="h-1.5 w-10 rounded-full bg-gray-300" />
            </View>
            <View className="mt-1 mb-2 px-2 flex-row items-center justify-between">
              <Text className="font-jua text-3xl font-bold text-ink">새로운 챌린지 만들기</Text>
              <Pressable onPress={handleClose} hitSlop={10}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 제목 */}
              <Text className="font-gowunDodum mb-2 mt-2 text-lg text-ink">챌린지 제목</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="예) 아침 6시 기상 챌린지"
                placeholderTextColor="#9CA3AF"
                className="font-gowunDodum mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-ink"
              />

              {/* 설명 */}
              <Text className="font-gowunDodum mb-2 text-lg font-semibold text-ink">설명</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="챌린지에 대한 간단한 설명을 적어주세요"
                placeholderTextColor="#9CA3AF"
                className="font-gowunDodum mb-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-ink"
              />

              <Text className="font-gowunDodum mb-2 mt-1 text-sm text-ink-faint">
                시작·종료 일시와 패널티는 챌린지에 입장할 때 설정할 수 있어요.
              </Text>
            </ScrollView>

            {/* 생성 버튼 */}
            <Pressable
              onPress={handleCreate}
              disabled={!canSubmit || submitting}
              className={`mt-3 items-center rounded-xl py-4 ${
                canSubmit && !submitting ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <Text className="text-xl font-jua font-bold text-white">
                {submitting ? '생성 중...' : '챌린지 만들기'}
              </Text>
            </Pressable>
          </View>
    </BottomSheet>
  );
}
