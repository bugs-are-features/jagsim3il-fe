import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { AlertModal } from './AlertModal';
import { useAuthStore } from '../src/store/authStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 비밀번호 찾기: 이메일 전용 입력 바텀시트
export function PasswordResetSheet({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const passwordReset = useAuthStore((s) => s.passwordReset);

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(''); // 입력 검증 메시지 (인라인)
  const [result, setResult] = useState(null); // 전송 결과 { success, message } → AlertModal

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setSubmitting(false);
    setResult(null);
    onClose();
  };

  const handleSend = async () => {
    if (submitting) return;
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setMessage('올바른 이메일 형식이 아니에요.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    const res = await passwordReset(value);
    setSubmitting(false);
    setResult({ success: res.ok, message: res.message });
  };

  const handleResultClose = () => {
    const ok = result?.success;
    setResult(null);
    // 성공한 경우 바텀시트까지 닫아 로그인 화면으로 복귀
    if (ok) handleClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <View
        className="rounded-t-3xl bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* 핸들 + 헤더 */}
        <View className="mb-2 items-center">
          <View className="h-1.5 w-10 rounded-full bg-gray-300" />
        </View>
        <View className="mt-1 mb-2 px-2 flex-row items-center justify-between">
          <Text className="font-jua text-3xl font-bold text-ink">비밀번호 찾기</Text>
          <Pressable onPress={handleClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <Text className="font-gowunDodum mb-4 px-1 text-base text-ink-muted">
          가입한 이메일을 입력하면{'\n'}비밀번호 재설정 링크를 보내드려요.
        </Text>

        <Text className="font-gowunDodum mb-2 text-lg font-semibold text-ink">이메일</Text>
        <TextInput
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (message) setMessage('');
          }}
          placeholder="example@email.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
          className="font-gowunDodum rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-ink"
        />

        {message ? (
          <Text className="mt-3 text-sm text-red-500">{message}</Text>
        ) : null}

        <Pressable
          onPress={handleSend}
          disabled={submitting}
          className={`mt-5 items-center rounded-xl py-4 ${
            submitting ? 'bg-gray-300' : 'bg-primary'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-jua text-xl font-bold text-white">
              재설정 메일 보내기
            </Text>
          )}
        </Pressable>
      </View>

      {/* 전송 결과 알럿 */}
      <AlertModal
        visible={!!result}
        success={result?.success}
        title={result?.success ? '메일을 보냈어요' : '전송에 실패했어요'}
        message={result?.message}
        onClose={handleResultClose}
      />
    </BottomSheet>
  );
}
