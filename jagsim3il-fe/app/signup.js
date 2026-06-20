import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from '../components/Checkbox';
import { useAuthStore } from '../src/store/authStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ label, error, ...props }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-ink">{label}</Text>
      <TextInput
        placeholderTextColor="#9CA3AF"
        className={`rounded-xl border bg-gray-50 px-4 py-3.5 text-base text-ink ${
          error ? 'border-red-400' : 'border-gray-200'
        }`}
        {...props}
      />
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}

export default function SignupScreen() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const loading = useAuthStore((s) => s.loading);

  const [form, setForm] = useState({
    username: '',
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  // 유효성 검사
  const errors = {
    username: !form.username.trim() ? '아이디를 입력해 주세요.' : '',
    nickname: !form.nickname.trim() ? '닉네임을 입력해 주세요.' : '',
    email: !form.email.trim()
      ? '이메일을 입력해 주세요.'
      : !EMAIL_RE.test(form.email.trim())
      ? '올바른 이메일 형식이 아니에요.'
      : '',
    password: !form.password
      ? '비밀번호를 입력해 주세요.'
      : form.password.length < 4
      ? '비밀번호는 4자 이상이어야 해요.'
      : '',
    passwordConfirm:
      form.password !== form.passwordConfirm ? '비밀번호가 일치하지 않아요.' : '',
  };

  const isValid = Object.values(errors).every((e) => !e) && agreed;

  const handleSignup = async () => {
    setSubmitted(true);
    setServerError('');
    if (!isValid) return;

    // 가입 성공 시 _layout의 Stack.Protected guard가 홈으로 리다이렉트한다.
    const ok = await signup({
      username: form.username.trim(),
      nickname: form.nickname.trim(),
      email: form.email.trim(),
      password: form.password,
    });
    if (!ok) {
      setServerError('이미 사용 중인 아이디입니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 헤더 */}
        <View className="flex-row items-center px-4 py-2">
          <Pressable onPress={() => router.back()} hitSlop={10} className="p-1">
            <Ionicons name="chevron-back" size={26} color="#1A1A2E" />
          </Pressable>
          <Text className="ml-1 text-lg font-bold text-ink">회원가입</Text>
        </View>

        <ScrollView
          className="px-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-6 mt-2 text-2xl font-extrabold text-ink">
            계정을 만들어{'\n'}함께 도전해요 💪
          </Text>

          <Field
            label="아이디"
            value={form.username}
            onChangeText={set('username')}
            placeholder="아이디"
            autoCapitalize="none"
            error={submitted ? errors.username || serverError : ''}
          />
          <Field
            label="닉네임"
            value={form.nickname}
            onChangeText={set('nickname')}
            placeholder="닉네임"
            error={submitted ? errors.nickname : ''}
          />
          <Field
            label="이메일"
            value={form.email}
            onChangeText={set('email')}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={submitted ? errors.email : ''}
          />
          <Field
            label="비밀번호"
            value={form.password}
            onChangeText={set('password')}
            placeholder="비밀번호 (4자 이상)"
            secureTextEntry
            error={submitted ? errors.password : ''}
          />
          <Field
            label="비밀번호 확인"
            value={form.passwordConfirm}
            onChangeText={set('passwordConfirm')}
            placeholder="비밀번호 확인"
            secureTextEntry
            error={submitted ? errors.passwordConfirm : ''}
          />

          {/* 약관 동의 */}
          <View className="mb-2 mt-1 rounded-xl bg-gray-50 px-3">
            <Checkbox
              checked={agreed}
              onToggle={() => setAgreed((v) => !v)}
              label="(필수) 서비스 이용약관 및 개인정보 처리방침에 동의합니다."
            />
          </View>

          {/* 가입 버튼 (약관 미동의 시 비활성화) */}
          <Pressable
            onPress={handleSignup}
            disabled={!agreed || loading}
            className={`mb-4 mt-4 items-center rounded-xl py-4 ${
              agreed && !loading ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-bold text-white">가입하기</Text>
            )}
          </Pressable>

          {/* 로그인 이동 */}
          <View className="mb-8 flex-row items-center justify-center">
            <Text className="text-sm text-ink-muted">이미 계정이 있으신가요?</Text>
            <Link href="/login" asChild>
              <Pressable hitSlop={8}>
                <Text className="ml-1 text-sm font-bold text-primary">로그인</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
