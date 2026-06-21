import { useState } from 'react';
import { View, ActivityIndicator, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCachedAuthFile } from '../src/hooks/useCachedAuthFile';
import { MediaViewerModal } from './MediaViewerModal';

const styles = StyleSheet.create({
  // iOS에서 expo-image는 부모 aspectRatio + width/height 100% 조합이 가장 안정적
  previewBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  mediaFill: {
    width: '100%',
    height: '100%',
  },
});

function PreviewContainer({ className, children }) {
  return (
    <View className={className} style={styles.previewBox}>
      {children}
    </View>
  );
}

// 미디어 영역 중앙 로딩 (캐시 resolve 중에만)
function MediaLoadingOverlay() {
  return (
    <View style={StyleSheet.absoluteFillObject} className="items-center justify-center bg-gray-100">
      <ActivityIndicator size="large" color="#FF6A3D" />
    </View>
  );
}

function TapToViewBadge({ type }) {
  return (
    <View className="absolute bottom-2 left-2 flex-row items-center rounded-full bg-black/50 px-2.5 py-1">
      <Ionicons name={type === 'video' ? 'play-circle-outline' : 'expand-outline'} size={14} color="white" />
      <Text className="ml-1 text-xs text-white">{type === 'video' ? '탭하여 재생' : '탭하여 보기'}</Text>
    </View>
  );
}

function CachedImage({ source, contentFit = 'cover' }) {
  if (!source?.uri) return null;
  return (
    <Image
      source={source}
      style={styles.mediaFill}
      contentFit={contentFit}
      cachePolicy="disk"
      transition={0}
      recyclingKey={source.uri}
    />
  );
}

function RemoteImagePreview({ imageSource, loading, error, className, openViewer, viewerEnabled }) {
  const canView = viewerEnabled && !loading && !!imageSource;

  return (
    <PreviewContainer className={className}>
      {imageSource ? <CachedImage source={imageSource} /> : null}
      {loading ? <MediaLoadingOverlay /> : null}
      {canView ? <TapToViewBadge type="image" /> : null}
      {canView ? (
        <Pressable
          onPress={openViewer}
          accessibilityRole="button"
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      {error && !imageSource && !loading ? (
        <View style={StyleSheet.absoluteFillObject} className="items-center justify-center bg-gray-100 px-4">
          <Ionicons name="image-outline" size={28} color="#9CA3AF" />
          <Text className="font-gowunDodum mt-2 text-center text-xs text-ink-faint">
            이미지를 불러오지 못했어요
          </Text>
        </View>
      ) : null}
    </PreviewContainer>
  );
}

function RemoteVideoPlayer({ videoSource, className, openViewer, viewerEnabled }) {
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
  });

  const canView = viewerEnabled && !!videoSource;

  return (
    <PreviewContainer className={className}>
      <VideoView
        player={player}
        style={styles.mediaFill}
        contentFit="cover"
        nativeControls={false}
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject} className="items-center justify-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-black/50">
          <Ionicons name="play" size={20} color="white" />
        </View>
      </View>
      {canView ? <TapToViewBadge type="video" /> : null}
      {canView ? (
        <Pressable
          onPress={openViewer}
          accessibilityRole="button"
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
    </PreviewContainer>
  );
}

function RemoteVideoPreview({ imageSource, uri, loading, error, className, openViewer, viewerEnabled }) {
  const videoSource = imageSource ?? (uri ? { uri } : null);

  if (loading) {
    return (
      <PreviewContainer className={className}>
        <MediaLoadingOverlay />
      </PreviewContainer>
    );
  }

  if (!videoSource) {
    return (
      <PreviewContainer className={className}>
        <View style={StyleSheet.absoluteFillObject} className="items-center justify-center px-4">
          <Ionicons name="videocam-outline" size={28} color="#9CA3AF" />
          <Text className="font-gowunDodum mt-2 text-center text-xs text-ink-faint">
            {error ? '영상을 불러오지 못했어요' : '영상 없음'}
          </Text>
        </View>
      </PreviewContainer>
    );
  }

  return (
    <RemoteVideoPlayer
      videoSource={videoSource}
      className={className}
      openViewer={openViewer}
      viewerEnabled={viewerEnabled}
    />
  );
}

// 인증 첨부파일(이미지/영상) 미리보기 — 탭 시 전체 화면 뷰어
export function AuthMediaPreview({
  source,
  type = 'image',
  className = 'rounded-xl',
  viewerEnabled = true,
}) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const cached = useCachedAuthFile(source);

  if (!source?.uri) return null;

  const shared = {
    ...cached,
    className,
    openViewer: () => setViewerVisible(true),
    viewerEnabled,
  };

  return (
    <>
      {type === 'video' ? (
        <RemoteVideoPreview {...shared} />
      ) : (
        <RemoteImagePreview {...shared} />
      )}

      <MediaViewerModal
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        cached={cached}
        type={type}
      />
    </>
  );
}
