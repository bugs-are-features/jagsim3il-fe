import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 커스텀 Pressable 기반 체크박스 (약관 동의용)
// label 문자열 대신 children을 넘기면(예: 링크가 포함된 텍스트) 그대로 렌더링한다.
export function Checkbox({ checked, onToggle, label, children }) {
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
      {children ? (
        <View className="flex-1">{children}</View>
      ) : (
        <Text className="flex-1 text-sm text-ink">{label}</Text>
      )}
    </Pressable>
  );
}
