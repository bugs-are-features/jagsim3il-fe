import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../src/store/authStore';
import { AuthMediaPreview } from './AuthMediaPreview';

// kind에 따라 picker가 다룰 미디어 타입
function mediaTypesFor(kind) {
  if (kind === 'image') return ['images'];
  if (kind === 'video') return ['videos'];
  return ['images', 'videos'];
}

// 멤버 카드 하단의 이미지/동영상 업로드·촬영 영역
// editable=true 인 경우(=내 카드, 인증 가능 상태)에만 촬영/선택 가능
// kind: 'image' | 'video' (해당 타입만 선택/촬영)
// media: { uri, type:'image'|'video', remote?:boolean } — remote면 인증 헤더를 붙여 로드
export function MediaUploader({ media, onPicked, editable = false, kind = 'image', label }) {
  const token = useAuthStore((s) => s.token);

  const typeLabel = label || (kind === 'video' ? '영상' : '사진');

  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('권한 필요', '갤러리 접근 권한을 허용해 주세요.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypesFor(kind),
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
        mediaTypes: mediaTypesFor(kind),
        quality: 0.8,
      });
      handleResult(result);
    } catch (e) {
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
    try {
      // 제출 중 전체 화면 로딩은 상위(챌린지 화면)에서 처리한다.
      await onPicked({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
    } catch (e) {
      Alert.alert('오류', e?.message || '미디어를 처리하지 못했어요.');
    }
  };

  const showChoice = () => {
    Alert.alert(`${typeLabel} 인증`, '어떻게 등록할까요?', [
      { text: '카메라로 촬영', onPress: takeWithCamera },
      { text: '갤러리에서 선택', onPress: pickFromGallery },
      { text: '취소', style: 'cancel' },
    ]);
  };

  // 원격(이미 업로드된) 파일은 다운로드 시 Bearer 토큰이 필요하다.
  const buildSource = () => {
    if (!media?.uri) return null;
    if (media.remote && token) {
      return { uri: media.uri, headers: { Authorization: `Bearer ${token}` } };
    }
    return { uri: media.uri };
  };

  // 미디어가 있을 때: 미리보기 (항상 16:9 고정, cover로 채움)
  if (media?.uri) {
    const source = buildSource();
    return (
      <Pressable
        onPress={editable ? showChoice : undefined}
        disabled={!editable}
        className="mt-2 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100"
      >
        <AuthMediaPreview
          source={source}
          type={media.type === 'video' ? 'video' : 'image'}
          className="h-full w-full"
        />
        {editable ? (
          <View className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1">
            <Text className="text-xs text-white">변경</Text>
          </View>
        ) : null}
      </Pressable>
    );
  }

  // 미디어 없을 때: 빈 업로드 영역
  return (
    <Pressable
      onPress={editable ? showChoice : undefined}
      disabled={!editable}
      className={`mt-2 aspect-[16/9] w-full items-center justify-center rounded-xl border border-dashed ${editable ? 'border-primary/40 bg-primary-light/40' : 'border-gray-200 bg-gray-50'
        }`}
    >
      {editable ? (
        <>
          <Ionicons name={kind === 'video' ? 'videocam-outline' : 'camera-outline'} size={26} color="#FF6A3D" />
          <Text className="mt-1 text-md font-gowunDodum font-medium text-primary">
            {typeLabel} 인증 올리기
          </Text>
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
