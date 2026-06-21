import { View, Image, Text } from 'react-native';

// 아이디(또는 닉네임)별 고유 배경색 팔레트
const AVATAR_COLORS = [
  '#F87171', // red
  '#FB923C', // orange
  '#F59E0B', // amber
  '#34D399', // emerald
  '#22D3EE', // cyan
  '#60A5FA', // blue
  '#818CF8', // indigo
  '#A78BFA', // violet
  '#F472B6', // pink
  '#FB7185', // rose
];

// 문자열(유저 아이디)로부터 결정적(deterministic) 색상 선택
export function colorFromSeed(seed) {
  const s = String(seed ?? '');
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// 닉네임 첫 글자 (한글/영문 모두 1글자, 영문은 대문자)
function initial(nickname) {
  const chars = Array.from((nickname ?? '').trim());
  return chars.length ? chars[0].toUpperCase() : '?';
}

// 단일 아바타
// - uri(profile_url)가 있으면 이미지, 없으면 닉네임 첫 글자 + 아이디 기반 색상 원
// - id: 색상 시드로 쓸 유저 고유 아이디(없으면 nickname 사용)
export function Avatar({ uri, nickname, id, size = 32 }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        accessibilityLabel={nickname}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className="bg-gray-200"
      />
    );
  }

  return (
    <View
      accessibilityLabel={nickname}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colorFromSeed(id ?? nickname),
      }}
      className="items-center justify-center"
    >
      <Text
        style={{ fontSize: Math.round(size * 0.45) }}
        className="font-bold text-white"
      >
        {initial(nickname)}
      </Text>
    </View>
  );
}

// 겹쳐진 아바타 목록 + 남은 인원 수 표시
export function AvatarStack({ members = [], max = 4, size = 32 }) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;

  return (
    <View className="flex-row items-center">
      {shown.map((m, i) => (
        <View
          key={m.id}
          style={{ marginLeft: i === 0 ? 0 : -size / 3 }}
          className="rounded-full border-2 border-white"
        >
          <Avatar
            uri={m.avatar}
            nickname={m.nickname}
            id={m.loginId ?? m.id}
            size={size}
          />
        </View>
      ))}
      {rest > 0 && (
        <View
          style={{ width: size, height: size, marginLeft: -size / 3 }}
          className="items-center justify-center rounded-full border-2 border-white bg-gray-100"
        >
          <Text className="text-xs font-semibold text-ink-muted">+{rest}</Text>
        </View>
      )}
    </View>
  );
}
