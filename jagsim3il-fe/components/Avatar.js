import { View, Image, Text } from 'react-native';

// 단일 아바타
export function Avatar({ uri, nickname, size = 32 }) {
  return (
    <Image
      source={{ uri }}
      accessibilityLabel={nickname}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-gray-200"
    />
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
          <Avatar uri={m.avatar} nickname={m.nickname} size={size} />
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
