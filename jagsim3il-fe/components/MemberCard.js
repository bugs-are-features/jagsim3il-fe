import { View, Text } from 'react-native';
import { Avatar } from './Avatar';
import { MediaUploader } from './MediaUploader';

// 방 화면 멤버 카드
// isMe=true 이면 미디어 촬영/업로드 가능
export function MemberCard({ member, isMe, onPickMedia }) {
  return (
    <View
      className="flex-1 rounded-2xl bg-white p-3"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {/* 상단: 닉네임 (작고 연하게) */}
      <View className="flex-row items-center">
        <Avatar uri={member.avatar} nickname={member.nickname} size={20} />
        <Text className="ml-1.5 text-xs text-ink-faint">
          {member.nickname}
          {isMe ? ' (나)' : ''}
        </Text>
      </View>

      {/* 목표 텍스트 */}
      <Text className="mt-1.5 text-sm font-semibold leading-5 text-ink" numberOfLines={3}>
        {member.goal}
      </Text>

      {/* 하단: 미디어 업로드/미리보기 */}
      <MediaUploader
        media={member.media}
        editable={isMe}
        onPicked={(asset) => onPickMedia(member.id, asset)}
      />
    </View>
  );
}
