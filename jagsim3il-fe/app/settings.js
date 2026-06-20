import { useState } from 'react';
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
        <Ionicons name={icon} size={20} color="#5B5BD6" />
        <Text className="ml-3 text-base text-ink">{label}</Text>
      </View>
      {right ?? (
        <View className="flex-row items-center">
          {value ? <Text className="mr-1 text-sm text-ink-faint">{value}</Text> : null}
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

  const [pushEnabled, setPushEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          // 로그아웃 시 _layout의 Stack.Protected guard가 로그인 화면으로 리다이렉트한다.
          logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="p-1">
          <Ionicons name="chevron-back" size={26} color="#1A1A2E" />
        </Pressable>
        <Text className="ml-1 text-lg font-bold text-ink">설정</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 */}
        <View className="mb-3 flex-row items-center bg-white px-5 py-5">
          <Image
            source={{ uri: user?.avatar }}
            className="h-16 w-16 rounded-full bg-gray-200"
          />
          <View className="ml-4">
            <Text className="text-lg font-bold text-ink">{user?.nickname}</Text>
            <Text className="text-sm text-ink-muted">{user?.email}</Text>
            <Text className="mt-0.5 text-xs text-ink-faint">@{user?.username}</Text>
          </View>
        </View>

        {/* 계정 */}
        <Text className="px-5 pb-2 text-xs font-semibold text-ink-faint">계정</Text>
        <View className="mb-3 overflow-hidden">
          <SettingRow icon="person-outline" label="프로필 수정" onPress={() => {}} />
          <View className="h-px bg-gray-100" />
          <SettingRow icon="lock-closed-outline" label="비밀번호 변경" onPress={() => {}} />
        </View>

        {/* 알림 */}
        <Text className="px-5 pb-2 text-xs font-semibold text-ink-faint">알림</Text>
        <View className="mb-3">
          <SettingRow
            icon="notifications-outline"
            label="푸시 알림"
            right={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ true: '#5B5BD6' }}
              />
            }
          />
        </View>

        {/* 기타 */}
        <Text className="px-5 pb-2 text-xs font-semibold text-ink-faint">기타</Text>
        <View className="mb-3">
          <SettingRow icon="information-circle-outline" label="버전" value="1.0.0" right={
            <Text className="text-sm text-ink-faint">1.0.0</Text>
          } />
          <View className="h-px bg-gray-100" />
          <SettingRow icon="document-text-outline" label="이용약관" onPress={() => {}} />
        </View>

        {/* 로그아웃 */}
        <Pressable
          onPress={handleLogout}
          className="mx-5 mb-10 mt-2 items-center rounded-xl border border-red-200 bg-white py-4"
        >
          <Text className="text-base font-bold text-red-500">로그아웃</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
