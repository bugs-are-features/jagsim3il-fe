import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';

const SCREEN_H = Dimensions.get('window').height;

// 약관/개인정보 처리방침 등 긴 텍스트를 보여주는 바텀시트
export function LegalSheet({ visible, doc, onClose }) {
  const insets = useSafeAreaInsets();

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
        <View className="mt-1 mb-3 px-1 flex-row items-center justify-between">
          <Text className="font-jua text-2xl font-bold text-ink">{doc?.title}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView
          style={{ maxHeight: SCREEN_H * 0.6 }}
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          <Text className="font-gowunDodum text-sm leading-6 text-ink-muted">
            {doc?.content}
          </Text>
        </ScrollView>
      </View>
    </BottomSheet>
  );
}
