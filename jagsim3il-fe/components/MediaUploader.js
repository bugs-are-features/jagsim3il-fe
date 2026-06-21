import { useState } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';

// 동영상 미리보기 (expo-video)
function VideoPreview({ uri }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });
  return (
    <VideoView
      player={player}
      style={{ width: '100%', height: '100%' }}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

// 멤버 카드 하단의 이미지/동영상 업로드·촬영 영역
// editable=true 인 경우(=내 카드)에만 촬영/선택 가능
export function MediaUploader({ media, onPicked, editable = false }) {
  const [loading, setLoading] = useState(false);

  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('권한 필요', '갤러리 접근 권한을 허용해 주세요.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.8,
      });
      handleResult(result);
    } catch (e) {
      Alert.alert('갤러리 오류', e?.message || '갤러리를 열 수 없어요.');
    }
  };

  const takeWithCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          '권한 필요',
          '카메라 접근 권한을 허용해 주세요. (설정 > 앱 권한에서 변경할 수 있어요)'
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.8,
      });
      handleResult(result);
    } catch (e) {
      // iOS 시뮬레이터에는 카메라가 없어 여기서 실패한다(실기기에서 테스트 필요).
      Alert.alert(
        '카메라 오류',
        e?.message ||
        '카메라를 사용할 수 없어요. 시뮬레이터/에뮬레이터에는 카메라가 없으니 실기기에서 시도해 주세요.'
      );
    }
  };

  const handleResult = async (result) => {
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setLoading(true);
    try {
      await onPicked({
        uri: asset.uri,
        // expo-image-picker asset.type: 'image' | 'video'
        type: asset.type === 'video' ? 'video' : 'image',
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
    } catch (e) {
      Alert.alert('오류', e?.message || '미디어를 처리하지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  const showChoice = () => {
    Alert.alert('인증 등록', '어떻게 등록할까요?', [
      { text: '카메라로 촬영', onPress: takeWithCamera },
      { text: '갤러리에서 선택', onPress: pickFromGallery },
      { text: '취소', style: 'cancel' },
    ]);
  };

  // 미디어가 있을 때: 미리보기 (항상 16:9 고정, cover로 채움)
  if (media?.uri) {
    return (
      <Pressable
        onPress={editable ? showChoice : undefined}
        disabled={!editable}
        className="mt-2 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100"
      >
        {media.type === 'video' ? (
          <VideoPreview uri={media.uri} />
        ) : (
          <Image source={{ uri: media.uri }} className="h-full w-full" resizeMode="cover" />
        )}
        {media.type === 'video' && (
          <View className="absolute inset-0 items-center justify-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-black/50">
              <Ionicons name="play" size={20} color="white" />
            </View>
          </View>
        )}
        {editable && (
          <>
            <View className="absolute left-2 top-2 rounded-full bg-amber-500/90 px-2 py-1">
              <Text className="text-xs font-semibold text-white">미저장</Text>
            </View>
            <View className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1">
              <Text className="text-xs text-white">변경</Text>
            </View>
          </>
        )}
      </Pressable>
    );
  }

  // 미디어 없을 때: 빈 업로드 영역
  return (
    <Pressable
      onPress={editable ? showChoice : undefined}
      disabled={!editable || loading}
      className={`mt-2 aspect-[16/9] w-full items-center justify-center rounded-xl border border-dashed ${editable ? 'border-primary/40 bg-primary-light/40' : 'border-gray-200 bg-gray-50'
        }`}
    >
      {loading ? (
        <ActivityIndicator color="#FF6A3D" />
      ) : editable ? (
        <>
          <Ionicons name="camera-outline" size={26} color="#FF6A3D" />
          <Text className="mt-1 text-md font-gowunDodum font-medium text-primary">인증 올리기</Text>
        </>
      ) : (
        <>
          <Ionicons name="hourglass-outline" size={24} color="#9CA3AF" />
          <Text className="mt-1 text-md font-gowunDodum text-ink-faint">인증 대기 중</Text>
        </>
      )}
    </Pressable>
  );
}
