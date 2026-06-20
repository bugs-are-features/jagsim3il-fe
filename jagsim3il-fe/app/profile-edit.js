import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../src/store/authStore';

export default function ProfileEditScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [submitting, setSubmitting] = useState(false);

  const trimmed = nickname.trim();
  const changed =
    trimmed !== (user?.nickname || '') || avatar !== (user?.avatar || null);
  const canSave = trimmed.length > 0 && changed && !submitting;

  const pickAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('권한 필요', '갤러리 접근 권한을 허용해 주세요.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length) {
        setAvatar(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('오류', e?.message || '이미지를 불러오지 못했어요.');
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    const res = await updateProfile({ nickname: trimmed, avatar });
    setSubmitting(false);
    if (res.ok) {
      router.back();
    } else {
      Alert.alert('저장 실패', res.message || '잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 헤더 */}
        <View className="flex-row items-center px-4 py-2">
          <Pressable onPress={() => router.back()} hitSlop={10} className="p-1">
            <Ionicons name="chevron-back" size={26} color="#1A1A2E" />
          </Pressable>
          <Text className="font-jua ml-1 text-2xl text-ink">프로필 수정</Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 아바타 */}
          <View className="mb-6 items-center">
            <Pressable onPress={pickAvatar} className="items-center">
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  className="h-24 w-24 rounded-full bg-gray-200"
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-light">
                  <Text className="text-3xl font-bold text-primary">
                    {(nickname || user?.username || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary">
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </Pressable>
            <Text className="font-gowunDodum mt-2 text-sm text-primary">사진 변경</Text>
          </View>

          {/* 닉네임 */}
          <Text className="font-gowunDodum mb-2 text-base font-semibold text-ink">닉네임</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임을 입력해 주세요"
            placeholderTextColor="#9CA3AF"
            maxLength={20}
            className="font-gowunDodum mb-5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-ink"
          />

          {/* 읽기 전용 정보 */}
          <Text className="font-gowunDodum mb-2 text-base font-semibold text-ink">아이디</Text>
          <View className="mb-4 rounded-xl border border-gray-100 bg-gray-100 px-4 py-3">
            <Text className="font-gowunDodum text-base text-ink-muted">
              {user?.username ? `@${user.username}` : '-'}
            </Text>
          </View>

          <Text className="font-gowunDodum mb-2 text-base font-semibold text-ink">이메일</Text>
          <View className="mb-2 rounded-xl border border-gray-100 bg-gray-100 px-4 py-3">
            <Text className="font-gowunDodum text-base text-ink-muted">
              {user?.email || '-'}
            </Text>
          </View>
          <Text className="font-gowunDodum mb-6 px-1 text-xs text-ink-faint">
            아이디와 이메일은 변경할 수 없어요.
          </Text>
        </ScrollView>

        {/* 저장 버튼 */}
        <View className="px-5 pb-5">
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            className={`items-center rounded-xl py-4 ${canSave ? 'bg-primary' : 'bg-gray-300'}`}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-jua text-xl font-bold text-white">저장</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
