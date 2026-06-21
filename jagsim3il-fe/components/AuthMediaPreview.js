import { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCachedAuthFile } from '../src/hooks/useCachedAuthFile';

// 미디어 영역 중앙 로딩 표시
function MediaLoadingOverlay() {
  return (
    <View className="absolute inset-0 items-center justify-center bg-gray-100">
      <ActivityIndicator size="large" color="#FF6A3D" />
    </View>
  );
}

// 원격 인증 이미지 미리보기 (캐시 → 로컬 file:// 로드)
function RemoteImagePreview({ source, className }) {
  const { uri, loading: cacheLoading, error } = useCachedAuthFile(source);
  const [decodeLoading, setDecodeLoading] = useState(true);

  useEffect(() => {
    setDecodeLoading(true);
  }, [uri]);

  const loading = cacheLoading || (!!uri && decodeLoading);

  return (
    <View className={`relative ${className ?? 'aspect-[16/9] w-full'}`}>
      {uri ? (
        <Image
          source={{ uri }}
          className="h-full w-full"
          resizeMode="cover"
          onLoadStart={() => setDecodeLoading(true)}
          onLoad={() => setDecodeLoading(false)}
          onError={() => setDecodeLoading(false)}
        />
      ) : null}
      {loading ? <MediaLoadingOverlay /> : null}
      {error && !loading ? (
        <View className="absolute inset-0 items-center justify-center bg-gray-100 px-4">
          <Ionicons name="image-outline" size={28} color="#9CA3AF" />
          <Text className="font-gowunDodum mt-2 text-center text-xs text-ink-faint">
            이미지를 불러오지 못했어요
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// 원격 인증 영상 미리보기 (캐시 → 로컬 file:// 로드)
function RemoteVideoPreview({ source, className }) {
  const { uri, loading: cacheLoading, error } = useCachedAuthFile(source);
  const [playLoading, setPlayLoading] = useState(true);
  const player = useVideoPlayer(uri ? { uri } : null, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    setPlayLoading(true);
    if (!player || !uri) return undefined;

    if (player.status === 'readyToPlay') {
      setPlayLoading(false);
    }

    let sub = null;
    if (typeof player.addListener === 'function') {
      sub = player.addListener('statusChange', ({ status }) => {
        if (status === 'loading') setPlayLoading(true);
        if (status === 'readyToPlay' || status === 'error') setPlayLoading(false);
      });
    }

    const fallback = setTimeout(() => setPlayLoading(false), 8000);

    return () => {
      sub?.remove?.();
      clearTimeout(fallback);
    };
  }, [player, uri]);

  const loading = cacheLoading || (!!uri && playLoading);

  return (
    <View className={`relative ${className ?? 'aspect-[16/9] w-full'}`}>
      {uri ? (
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          nativeControls={false}
        />
      ) : null}
      {!loading && uri ? (
        <View className="absolute inset-0 items-center justify-center">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-black/50">
            <Ionicons name="play" size={20} color="white" />
          </View>
        </View>
      ) : null}
      {loading ? <MediaLoadingOverlay /> : null}
      {error && !loading ? (
        <View className="absolute inset-0 items-center justify-center bg-gray-100 px-4">
          <Ionicons name="videocam-outline" size={28} color="#9CA3AF" />
          <Text className="font-gowunDodum mt-2 text-center text-xs text-ink-faint">
            영상을 불러오지 못했어요
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// 인증 첨부파일(이미지/영상) 미리보기
// source: { uri, headers? } — 원격 인증 URL은 파일명 기준 디스크 캐시 후 로컬에서 표시
// type: 'image' | 'video'
export function AuthMediaPreview({ source, type = 'image', className = 'aspect-[16/9] w-full rounded-xl bg-gray-100' }) {
  if (!source?.uri) return null;

  if (type === 'video') {
    return <RemoteVideoPreview source={source} className={className} />;
  }
  return <RemoteImagePreview source={source} className={className} />;
}
