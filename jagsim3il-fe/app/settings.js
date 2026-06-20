import { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/authStore';

function SettingRow({ icon, label, value, onPress, right }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-white px-5 py-4 active:bg-gray-50"
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={20} color="#FF6A3D" />
        <Text className="font-gowunDodum ml-3 text-base text-ink">{label}</Text>
      </View>
      {right ?? (
        <View className="flex-row items-center">
          {value ? (
            <Text className="font-gowunDodum mr-1 text-sm text-ink-faint">{value}</Text>
          ) : null}
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const loadMe = useAuthStore((s) => s.loadMe);
  const passwordReset = useAuthStore((s) => s.passwordReset);

  const [pushEnabled, setPushEnabled] = useState(true);

  // 회원 정보가 비어 있으면 토큰으로 다시 조회
  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          // 로그아웃 시 _layout의 Stack.Protected guard가 로그인 화면으로 리다이렉트한다.
          const res = await logout();
          Alert.alert('로그아웃', res.message);
        },
      },
    ]);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      Alert.alert('오류', '이메일 정보를 찾을 수 없습니다.');
      return;
    }

    const res = await passwordReset(user.email);

    if (res.ok) {
      Alert.alert('비밀번호 재설정', res.message);
    } else {
      // 실패 시 서버 응답 메시지를 그대로 출력
      Alert.alert('비밀번호 재설정 실패', res.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="p-1">
          <Ionicons name="chevron-back" size={26} color="#1A1A2E" />
        </Pressable>
        <Text className="font-jua ml-1 text-2xl text-ink">설정</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 (회원 정보) */}
        <View className="mb-3 flex-row items-center bg-white px-5 py-5">
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              className="h-16 w-16 rounded-full bg-gray-200"
            />
          ) : (
            // 아바타가 없으면 닉네임 첫 글자로 대체
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <Text className="text-2xl font-bold text-primary">
                {(user?.nickname || user?.username || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-4 flex-1">
            <Text className="font-jua text-2xl text-ink">
              {user?.nickname || '회원'}
            </Text>
            {user?.email ? (
              <Text className="font-gowunDodum text-sm text-ink-muted">{user.email}</Text>
            ) : null}
            {user?.username ? (
              <Text className="font-gowunDodum mt-0.5 text-xs text-ink-faint">
                @{user.username}
              </Text>
            ) : null}
          </View>
        </View>

        {/* 계정 */}
        <Text className="font-jua px-5 pb-2 text-md font-semibold text-ink-faint">계정</Text>
        <View className="mb-3 overflow-hidden">
          <SettingRow icon="person-outline" label="프로필 수정" onPress={() => router.push('/profile-edit')} />
          <View className="h-px bg-gray-100" />
          <SettingRow icon="lock-closed-outline" label="비밀번호 재설정" onPress={handlePasswordReset} />
        </View>

        {/* 알림 */}
        <Text className="font-jua px-5 pb-2 text-md font-semibold text-ink-faint">알림</Text>
        <View className="mb-3">
          <SettingRow
            icon="notifications-outline"
            label="푸시 알림"
            right={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ true: '#FF6A3D' }}
              />
            }
          />
        </View>

        {/* 기타 */}
        <Text className="font-jua px-5 pb-2 text-md font-semibold text-ink-faint">기타</Text>
        <View className="mb-3">
          <SettingRow icon="information-circle-outline" label="버전" value="1.0.0" right={
            <Text className="font-gowunDodum text-sm text-ink-faint">1.0.0</Text>
          } />
          <View className="h-px bg-gray-100" />
          <SettingRow icon="document-text-outline" label="이용약관" onPress={() => router.push('/terms')} />
        </View>

        {/* 로그아웃 */}
        <Pressable
          onPress={handleLogout}
          className="mx-5 mb-10 mt-2 items-center rounded-xl border border-red-200 bg-white py-4"
        >
          <Text className="font-jua text-lg text-red-500">로그아웃</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
