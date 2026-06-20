import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DateTimeField } from './DateTimeField';
import { penaltyPresets } from '../src/mocks/challenges';

const HOUR = 60 * 60 * 1000;

// 홈 화면에서 열리는 "챌린지 추가" 모달
export function CreateChallengeModal({ visible, onClose, onCreate }) {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState(new Date());
  const [endAt, setEndAt] = useState(new Date(Date.now() + 7 * 24 * HOUR));
  const [penalty, setPenalty] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setStartAt(new Date());
    setEndAt(new Date(Date.now() + 7 * 24 * HOUR));
    setPenalty('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canSubmit = title.trim() && penalty.trim() && endAt > startAt;

  const handleCreate = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    await onCreate({
      title: title.trim(),
      description: description.trim(),
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      penalty: penalty.trim(),
    });
    setSubmitting(false);
    reset();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/40">
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            className="rounded-t-3xl bg-white px-5 pt-3"
            style={{ paddingBottom: insets.bottom + 16, maxHeight: '90%' }}
          >
            {/* 핸들 + 헤더 */}
            <View className="mb-2 items-center">
              <View className="h-1.5 w-10 rounded-full bg-gray-300" />
            </View>
            <View className="mb-2 flex-row items-center justify-between">
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
                className="font-gowunDodum mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-ink"
              />

              {/* 날짜/시간 */}
              <DateTimeField label="시작 일시" value={startAt} onChange={setStartAt} />
              <DateTimeField label="종료 일시" value={endAt} onChange={setEndAt} />
              {endAt <= startAt && (
                <Text className="font-gowunDodum -mt-2 mb-3 text-xs text-red-500">
                  종료 일시는 시작 일시 이후여야 해요.
                </Text>
              )}

              {/* 패널티 */}
              <Text className="font-gowunDodum mb-2 text-lg text-ink">패널티</Text>
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
                className="mb-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-ink"
              />
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
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
