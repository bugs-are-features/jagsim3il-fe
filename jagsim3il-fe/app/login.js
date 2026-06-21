import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { PasswordResetSheet } from '../components/PasswordResetSheet';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const serverError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetVisible, setResetVisible] = useState(false);

  // 화면 진입 시 이전(회원가입 등) 에러 메시지 초기화
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async () => {
    setError('');
    if (!identifier.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }
    // 로그인 성공 시 _layout의 Stack.Protected guard가 홈으로 리다이렉트한다.
    // 실패 사유(잘못된 정보/이메일 미인증 등)는 store의 error 메시지로 표시.
    const ok = await login(identifier.trim(), password);
    if (!ok) {
      setError('');
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
            <Image
              source={require('../assets/images/coin-badge-256.png')}
              className="mb-3 h-20 w-20"
              resizeMode="contain"
            />
            <Text className="font-jua text-4xl text-ink">작심삼일</Text>
            <Text className="font-gowunDodum mt-1 text-lg text-ink-muted">함께라면 삼일을 넘길 수 있어요</Text>
          </View>

          {/* 아이디 또는 이메일 */}
          <Text className="font-gowunDodum mb-2 text-lg font-semibold text-ink">아이디 또는 이메일</Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="아이디 또는 이메일을 입력하세요"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            className="font-gowunDodum mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-ink"
          />

          {/* 비밀번호 */}
          <Text className="font-gowunDodum mb-2 text-lg font-semibold text-ink">비밀번호</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            className="font-gowunDodum rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-ink"
          />

          {/* 에러 메시지 (입력 검증 또는 서버 응답) */}
          {error || serverError ? (
            <Text className="mt-3 text-lg text-red-500">
              {error || serverError}
            </Text>
          ) : null}

          {/* 로그인 버튼 */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className={`mt-6 items-center rounded-xl py-4 ${loading ? 'bg-gray-300' : 'bg-primary'
              }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-jua text-xl font-bold text-white">로그인</Text>
            )}
          </Pressable>

          {/* 회원가입 이동 */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-sm text-ink-muted">아직 계정이 없으신가요?</Text>
            <Link href="/signup" asChild>
              <Pressable hitSlop={8}>
                <Text className="ml-1 text-sm font-bold text-primary underline">회원가입</Text>
              </Pressable>
            </Link>
          </View>

          <View className="mt-4 flex-row items-center justify-center">
            <Text className="text-sm text-ink-muted">비밀번호를 잊으셨나요?</Text>
            <Pressable hitSlop={8} onPress={() => setResetVisible(true)}>
              <Text className="ml-1 text-sm font-bold text-primary underline">비밀번호 찾기</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 비밀번호 찾기 (이메일 입력) 바텀시트 */}
      <PasswordResetSheet
        visible={resetVisible}
        onClose={() => setResetVisible(false)}
      />
    </SafeAreaView>
  );
}
