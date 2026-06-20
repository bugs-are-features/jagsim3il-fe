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
import { checkIdRequest, checkEmailRequest } from '../src/api/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 비밀번호: 8~32자, 영문·숫자·기호(!@#$%^&*) 모두 포함 (백엔드 규칙)
const PW_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,32}$/;

function Field({ label, error, ...props }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-lg font-semibold text-ink">{label}</Text>
      <TextInput
        placeholderTextColor="#9CA3AF"
        className={`rounded-xl border bg-gray-50 px-4 py-3.5 text-base text-ink ${
          error ? 'border-red-400' : 'border-gray-200'
        }`}
        {...props}
      />
      {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
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
  const [fieldErrors, setFieldErrors] = useState({}); // 서버 중복확인 등 필드별 에러
  const [done, setDone] = useState(false); // 가입 완료(이메일 인증 안내) 상태

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
      : !PW_RE.test(form.password)
      ? '8~32자, 영문·숫자·기호(!@#$%^&*)를 모두 포함해야 해요.'
      : '',
    passwordConfirm:
      form.password !== form.passwordConfirm ? '비밀번호가 일치하지 않아요.' : '',
  };

  const isValid = Object.values(errors).every((e) => !e) && agreed;

  const handleSignup = async () => {
    setSubmitted(true);
    setServerError('');
    setFieldErrors({});
    if (!isValid) return;

    const id = form.username.trim();
    const email = form.email.trim();

    // 1) 아이디/이메일 중복 확인
    try {
      const [idCheck, emailCheck] = await Promise.all([
        checkIdRequest(id),
        checkEmailRequest(email),
      ]);
      const fe = {};
      if (!idCheck.available) fe.username = '이미 사용 중인 아이디입니다.';
      if (!emailCheck.available) fe.email = '이미 사용 중인 이메일입니다.';
      if (Object.keys(fe).length) {
        setFieldErrors(fe);
        return;
      }
    } catch (e) {
      setServerError(e.message);
      return;
    }

    // 2) 회원가입 요청 (성공해도 이메일 인증 전까지는 로그인 불가)
    const ok = await signup({
      id,
      pw: form.password,
      alias: form.nickname.trim(),
      email,
    });
    if (ok) {
      setDone(true);
    } else {
      // store.error에 서버 메시지가 담겨 있음
      setServerError(useAuthStore.getState().error || '회원가입에 실패했습니다.');
    }
  };

  // 가입 완료 → 이메일 인증 안내 화면
  if (done) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary-light">
            <Ionicons name="mail-unread-outline" size={40} color="#FF6A3D" />
          </View>
          <Text className="mb-3 text-center text-2xl font-extrabold text-ink">
            가입이 완료되었어요!
          </Text>
          <Text className="mb-8 text-center text-base leading-6 text-ink-muted">
            {form.email.trim()}로{'\n'}인증 메일을 보냈어요.{'\n'}
            메일의 링크를 클릭한 뒤 로그인해 주세요.
          </Text>
          <Pressable
            onPress={() => router.replace('/login')}
            className="w-full items-center rounded-xl bg-primary py-4"
          >
            <Text className="text-base font-bold text-white">로그인하러 가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text className="font-jua ml-1 text-lg font-bold text-ink">회원가입</Text>
        </View>

        <ScrollView
          className="px-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-jua mb-6 mt-2 text-3xl font-extrabold text-ink">
            계정을 만들어{'\n'}함께 도전해요
          </Text>

          <Field
            label="아이디"
            value={form.username}
            onChangeText={set('username')}
            placeholder="아이디"
            autoCapitalize="none"
            error={submitted ? errors.username || fieldErrors.username : ''}
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
            error={submitted ? errors.email || fieldErrors.email : ''}
          />
          <Field
            label="비밀번호"
            value={form.password}
            onChangeText={set('password')}
            placeholder="비밀번호 (8~32자, 영문·숫자·기호)"
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

          {/* 서버 에러 메시지 */}
          {serverError ? (
            <Text className="mt-2 text-sm text-red-500">{serverError}</Text>
          ) : null}

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
              <Text className="text-lg font-bold text-white">가입하기</Text>
            )}
          </Pressable>

          {/* 로그인 이동 */}
          <View className="mb-8 flex-row items-center justify-center">
            <Text className="text-sm text-ink-muted">이미 계정이 있으신가요?</Text>
            
              <Pressable hitSlop={8} onPress={() => router.back()}>
                <Text className="ml-1 text-sm font-bold text-primary underline">로그인</Text>
              </Pressable>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
