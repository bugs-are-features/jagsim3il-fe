import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 커스텀 Pressable 기반 체크박스 (약관 동의용)
export function Checkbox({ checked, onToggle, label }) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center py-2"
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        className={`mr-3 h-6 w-6 items-center justify-center rounded-md border ${
          checked ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
        }`}
      >
        {checked && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
      <Text className="flex-1 text-sm text-ink">{label}</Text>
    </Pressable>
  );
}
