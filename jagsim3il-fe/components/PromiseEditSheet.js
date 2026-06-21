import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';

// 인증 요일 (월~일)
const DAYS = [
  { key: 'mon', label: '월' },
  { key: 'tue', label: '화' },
  { key: 'wed', label: '수' },
  { key: 'thu', label: '목' },
  { key: 'fri', label: '금' },
  { key: 'sat', label: '토' },
  { key: 'sun', label: '일' },
];
const ALL_DAYS = { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true };

// 정규화: certDays가 객체가 아니면 전체 선택으로 폴백
function normalizeDays(days) {
  if (days && typeof days === 'object' && !Array.isArray(days)) {
    return { ...ALL_DAYS, ...days };
  }
  return { ...ALL_DAYS };
}

// 입장 후 내 약속(목표 + 인증 요일) 수정 바텀시트
// onSave(desc, certDays) — 저장 처리
export function PromiseEditSheet({ visible, onClose, initialDesc, initialCertDays, onSave }) {
  const insets = useSafeAreaInsets();
  const [goal, setGoal] = useState(initialDesc || '');
  const [certDays, setCertDays] = useState(normalizeDays(initialCertDays));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setGoal(initialDesc || '');
      setCertDays(normalizeDays(initialCertDays));
      setSubmitting(false);
    }
  }, [visible, initialDesc, initialCertDays]);

  const toggleDay = (key) => {
    if (submitting) return;
    setCertDays((d) => ({ ...d, [key]: !d[key] }));
  };
  const anyDay = Object.values(certDays).some(Boolean);
  const canSubmit = !!(goal.trim() && anyDay);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSave = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await onSave(goal.trim(), certDays);
      // 로딩은 모달이 닫힐 때까지 유지 (visible=false 시 useEffect에서 초기화)
      onClose();
    } catch {
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
          <Text className="font-jua text-3xl font-bold text-ink">약속 수정</Text>
          <Pressable onPress={handleClose} hitSlop={10} disabled={submitting}>
            <Ionicons name="close" size={24} color={submitting ? '#D1D5DB' : '#6B7280'} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* 목표 */}
          <Text className="font-gowunDodum mb-2 mt-2 text-lg text-ink">목표</Text>
          <TextInput
            value={goal}
            onChangeText={setGoal}
            editable={!submitting}
            placeholder={'예) 매일 아침 6시에 일어나서\n모닝 루틴 사진 인증하기'}
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            className="font-gowunDodum h-32 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base leading-6 text-ink"
          />

          {/* 인증 요일 */}
          <Text className="font-gowunDodum mb-3 mt-6 text-lg text-ink">인증 요일</Text>
          <View className="flex-row justify-between">
            {DAYS.map((d) => {
              const active = certDays[d.key];
              return (
                <Pressable
                  key={d.key}
                  onPress={() => toggleDay(d.key)}
                  disabled={submitting}
                  className={`h-11 w-11 items-center justify-center rounded-full border ${
                    active ? 'border-primary bg-primary' : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${active ? 'text-white' : 'text-ink-faint'}`}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Pressable
          onPress={handleSave}
          disabled={!canSubmit || submitting}
          className={`mt-5 items-center rounded-xl py-4 ${
            canSubmit ? 'bg-primary' : 'bg-gray-300'
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
