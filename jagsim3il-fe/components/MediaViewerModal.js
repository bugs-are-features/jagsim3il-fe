import { useEffect } from 'react';
import {
  Modal,
  View,
  Pressable,
  ActivityIndicator,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const ExpoImage = Image;

// 핀치 줌 이미지 뷰어 (expo-image — 깜빡임 완화)
function ZoomableImage({ source }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 1), 4);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1);
      savedScale.value = 1;
    });

  const gesture = Gesture.Simultaneous(pinch, doubleTap);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!source?.uri) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.zoomWrap, animStyle]}>
        <ExpoImage
          source={source}
          style={styles.fullImage}
          contentFit="contain"
          cachePolicy="disk"
          transition={0}
          recyclingKey={source.uri}
        />
      </Animated.View>
    </GestureDetector>
  );
}

function ViewerVideo({ videoSource, active }) {
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (!player) return;
    if (active) {
      player.play();
    } else {
      player.pause();
    }
  }, [active, player]);

  return (
    <VideoView
      player={player}
      style={styles.fullVideo}
      contentFit="contain"
      nativeControls
    />
  );
}

// cached: useCachedAuthFile 결과를 그대로 전달 (중복 resolve 방지)
export function MediaViewerModal({ visible, onClose, cached, type = 'image' }) {
  const insets = useSafeAreaInsets();
  const { imageSource, uri, loading, error } = cached ?? {};
  const videoSource = imageSource ?? (uri ? { uri } : null);
  const ready = !loading && (type === 'video' ? !!videoSource : !!imageSource);

  // SafeAreaView top만으로는 Dynamic Island/베zel에 버튼이 가려질 수 있어 여유 padding 추가
  const headerTop = insets.top + 12;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.root}>
          <View style={[styles.header, { paddingTop: headerTop }]}>
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <Ionicons name="close-circle" size={32} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.hint}>
              {type === 'video' ? '영상 재생' : '두 손가락으로 확대 · 더블탭으로 초기화'}
            </Text>
          </View>

          <View style={[styles.body, { paddingBottom: insets.bottom }]}>
            {loading ? (
              <ActivityIndicator size="large" color="#FF6A3D" />
            ) : error && !ready ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={40} color="#9CA3AF" />
                <Text className="font-gowunDodum mt-3 text-center text-sm text-gray-300">
                  미디어를 불러오지 못했어요
                </Text>
              </View>
            ) : type === 'video' && videoSource ? (
              <ViewerVideo videoSource={videoSource} active={visible} />
            ) : imageSource ? (
              <ZoomableImage source={imageSource} />
            ) : null}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeBtn: {
    padding: 4,
  },
  hint: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomWrap: {
    width: SCREEN_W,
    height: SCREEN_H * 0.72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: SCREEN_W,
    height: SCREEN_H * 0.72,
  },
  fullVideo: {
    width: SCREEN_W,
    height: SCREEN_H * 0.62,
  },
  errorBox: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
