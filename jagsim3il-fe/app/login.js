import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/authStore';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }
    // 로그인 성공 시 _layout의 Stack.Protected guard가 홈으로 리다이렉트한다.
    const ok = await login(username.trim(), password);
    if (!ok) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 justify-center px-6">
          {/* 로고 */}
          <View className="mb-10 items-center">
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-3xl bg-primary">
              <Ionicons name="flame" size={32} color="white" />
            </View>
            <Text className="text-3xl font-extrabold text-ink">작심삼일</Text>
            <Text className="mt-1 text-sm text-ink-muted">함께라면 삼일을 넘길 수 있어요</Text>
          </View>

          {/* 아이디 */}
          <Text className="mb-2 text-sm font-semibold text-ink">아이디</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="아이디를 입력하세요"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-ink"
          />

          {/* 비밀번호 */}
          <Text className="mb-2 text-sm font-semibold text-ink">비밀번호</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-ink"
          />

          {/* 에러 메시지 */}
          {error ? (
            <Text className="mt-3 text-sm text-red-500">{error}</Text>
          ) : (
            <Text className="mt-3 text-xs text-ink-faint">
              테스트 계정: gildong / 1234
            </Text>
          )}

          {/* 로그인 버튼 */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className={`mt-6 items-center rounded-xl py-4 ${
              loading ? 'bg-gray-300' : 'bg-primary'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-bold text-white">로그인</Text>
            )}
          </Pressable>

          {/* 회원가입 이동 */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-sm text-ink-muted">아직 계정이 없으신가요?</Text>
            <Link href="/signup" asChild>
              <Pressable hitSlop={8}>
                <Text className="ml-1 text-sm font-bold text-primary">회원가입</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
