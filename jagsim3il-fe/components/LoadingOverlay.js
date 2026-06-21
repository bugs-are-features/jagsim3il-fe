import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// 화면 전체를 덮는 반투명 로딩 오버레이 (인증 제출 등)
export function LoadingOverlay({ visible, message = '처리 중...' }) {
  return (
    <Modal visible={!!visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <ActivityIndicator size="large" color="#FF6A3D" />
        {message ? (
          <Text className="font-gowunDodum mt-4 text-center text-base font-semibold text-ink">
            {message}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 32,
  },
});
