import { useEffect, useRef, useState } from 'react';
import { Modal, Animated, Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 공통 알럿 모달
// - 화면 가운데에 카드 형태로 표시
// - 가운데 성공/실패 아이콘 → 타이틀 → (선택) 메시지 → 확인 버튼
// - 우상단 X 아이콘으로 닫기
export function AlertModal({
  visible,
  onClose,
  success = true,
  title,
  message,
  confirmText = '확인',
}) {
  const [rendered, setRendered] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current; // 0 닫힘 → 1 열림

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
        tension: 80,
      }).start();
    } else if (rendered) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!rendered) return null;

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      {/* 배경 (페이드) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0,0,0,0.4)', opacity: anim },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* 가운데 카드 */}
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        pointerEvents="box-none"
      >
        <Animated.View
          style={{ transform: [{ scale }], opacity: anim, width: '84%', maxWidth: 360 }}
          className="rounded-3xl bg-white px-6 pb-6 pt-5"
        >
          {/* 우상단 X */}
          <View className="flex-row justify-end">
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* 성공/실패 아이콘 */}
          <View className="items-center">
            <View
              className={`h-20 w-20 items-center justify-center rounded-full ${
                success ? 'bg-primary-light' : 'bg-red-50'
              }`}
            >
              <Ionicons
                name={success ? 'checkmark-circle' : 'close-circle'}
                size={56}
                color={success ? '#FF6A3D' : '#EF4444'}
              />
            </View>
          </View>

          {/* 타이틀 */}
          <Text className="font-jua mt-4 text-center text-2xl text-ink">{title}</Text>

          {/* 메시지 (선택) */}
          {message ? (
            <Text className="font-gowunDodum mt-2 text-center text-base text-ink-muted">
              {message}
            </Text>
          ) : null}

          {/* 확인 버튼 (모서리 rounded) */}
          <Pressable
            onPress={onClose}
            className={`mt-6 items-center rounded-xl py-4 ${
              success ? 'bg-primary' : 'bg-ink'
            }`}
          >
            <Text className="font-jua text-xl font-bold text-white">{confirmText}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
