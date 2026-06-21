import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AUTH_TP, AUTH_TP_ORDER } from '../src/api/challenges';

// 인증 타입 메타 (아이콘/설명)
const TYPE_META = {
  [AUTH_TP.TEXT]: { icon: 'document-text-outline', label: '텍스트', desc: '한 줄 메모로 인증' },
  [AUTH_TP.IMAGE]: { icon: 'image-outline', label: '사진', desc: '이미지 파일로 인증' },
  [AUTH_TP.VIDEO]: { icon: 'videocam-outline', label: '영상', desc: '동영상 파일로 인증' },
};

// 챌린지 인증 방식(auth_set) 선택 UI (생성/수정 공용)
// value: [{ authTp, required(boolean) }]
// onChange(nextValue) — 최소 1개 선택을 강제하지는 않으니 호출부에서 검증한다.
export function AuthSetSelector({ value = [], onChange }) {
  const byTp = {};
  value.forEach((a) => {
    if (a && a.authTp != null) byTp[a.authTp] = a;
  });

  // 정렬된 배열로 다시 구성해 onChange에 넘긴다.
  const emit = (next) => {
    const arr = AUTH_TP_ORDER.filter((tp) => next[tp]).map((tp) => ({
      authTp: tp,
      required: !!next[tp].required,
    }));
    onChange?.(arr);
  };

  const toggleEnabled = (tp) => {
    const next = { ...byTp };
    if (next[tp]) delete next[tp];
    else next[tp] = { authTp: tp, required: false };
    emit(next);
  };

  const toggleRequired = (tp) => {
    if (!byTp[tp]) return;
    const next = { ...byTp, [tp]: { authTp: tp, required: !byTp[tp].required } };
    emit(next);
  };

  return (
    <View>
      {AUTH_TP_ORDER.map((tp) => {
        const meta = TYPE_META[tp];
        const item = byTp[tp];
        const enabled = !!item;
        const required = !!item?.required;
        return (
          <Pressable
            key={tp}
            onPress={() => toggleEnabled(tp)}
            className={`mb-2 flex-row items-center rounded-2xl border px-3 py-3 ${enabled ? 'border-primary bg-primary-light/40' : 'border-gray-200 bg-white'
              }`}
          >
            <View
              className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${enabled ? 'bg-primary' : 'bg-gray-100'
                }`}
            >
              <Ionicons name={meta.icon} size={20} style={{ marginLeft: 1 }} color={enabled ? '#FFFFFF' : '#9CA3AF'} />
            </View>

            <View className="flex-1">
              <Text className="font-jua text-base text-ink">{meta.label}</Text>
              <Text className="font-gowunDodum mt-0.5 text-xs text-ink-muted">{meta.desc}</Text>
            </View>

            {/* 필수 토글 (선택된 타입에서만) */}
            {enabled ? (
              <Pressable
                onPress={() => toggleRequired(tp)}
                hitSlop={8}
                className={`mr-2 flex-row items-center rounded-full px-2.5 py-1 ${required ? 'bg-primary' : 'bg-white border border-gray-300'
                  }`}
              >
                <Ionicons
                  name={required ? 'alert-circle' : 'alert-circle-outline'}
                  size={13}
                  color={required ? '#FFFFFF' : '#9CA3AF'}
                />
                <Text
                  className={`ml-1 text-xs font-semibold ${required ? 'text-white' : 'text-ink-faint'
                    }`}
                >
                  필수
                </Text>
              </Pressable>
            ) : null}

            <Ionicons
              name={enabled ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={enabled ? '#FF6A3D' : '#D1D5DB'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
