import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Animated,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';

const SCREEN_H = Dimensions.get('window').height;

// 공통 바텀시트
// 배경(딤)은 페이드로 나타나고, 시트만 아래에서 슬라이드되어 올라온다.
// (Modal animationType="slide"는 배경까지 함께 올라오는 문제가 있어 직접 애니메이션 처리)
export function BottomSheet({ visible, onClose, children }) {
  const [rendered, setRendered] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current; // 0 닫힘 → 1 열림

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    } else if (rendered) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!rendered) return null;

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_H, 0],
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

      {/* 시트 (슬라이드) */}
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end' }}
        pointerEvents="box-none"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={{ transform: [{ translateY }] }}>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
