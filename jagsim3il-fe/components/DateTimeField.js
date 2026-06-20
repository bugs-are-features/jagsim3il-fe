import { useState } from 'react';
import { Platform, Pressable, View, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { formatDateTime } from '../src/utils/date';

// 날짜 + 시간을 선택하는 입력 필드
// iOS: 인라인 spinner 토글 / Android: 날짜 다이얼로그 → 시간 다이얼로그 순차 표시
export function DateTimeField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  const [androidMode, setAndroidMode] = useState('date');

  const openPicker = () => {
    if (Platform.OS === 'android') {
      setAndroidMode('date');
    }
    setShow(true);
  };

  const handleChange = (event, selected) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setShow(false);
        return;
      }
      if (androidMode === 'date') {
        // 날짜 선택 후 시간 선택으로 전환
        const base = selected || value;
        onChange(base);
        setAndroidMode('time');
        return; // show 유지 → 시간 picker 표시
      }
      // 시간 선택 완료
      setShow(false);
      if (selected) onChange(selected);
      return;
    }
    // iOS
    if (selected) onChange(selected);
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-ink">{label}</Text>
      <Pressable
        onPress={openPicker}
        className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
      >
        <Text className="text-base text-ink">{formatDateTime(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color="#FF6A3D" />
      </Pressable>

      {show && (
        <DateTimePicker
          value={value instanceof Date ? value : new Date(value)}
          mode={Platform.OS === 'android' ? androidMode : 'datetime'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
