import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { MediaUploader } from './MediaUploader';

// 챌린지 화면 멤버 카드
// - isMe=true 이면 미디어 촬영/업로드 및 텍스트 인증 가능
// - started=true(active/ended)이면 오늘 인증(텍스트) 상태를 표시
// - status: 'preparing' | 'active' | 'ended'
// - todayIsCertDay: 내 약속 기준 오늘이 인증 요일인지 (내 카드에서만 의미)
// - onWriteCert(member): 인증 작성/수정 시트 열기
export function MemberCard({
  member,
  isMe,
  onPickMedia,
  started = false,
  status = 'preparing',
  todayIsCertDay = false,
  onWriteCert,
}) {
  const cert = member.todayCert;
  const uploaded = cert?.status === 'uploaded';
  const isActive = status === 'active';

  return (
    <View
      className="w-full rounded-2xl bg-white p-3"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {/* 상단: 닉네임 (작고 연하게) + 오늘 인증 상태 배지 */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <Avatar uri={member.avatar} nickname={member.nickname} size={20} />
          <Text className="font-gowunDodum ml-1.5 text-lg text-ink-faint" numberOfLines={1}>
            {member.nickname}
            {isMe ? ' (나)' : ''}
          </Text>
        </View>
        {started && uploaded ? (
          <View className="flex-row items-center rounded-full bg-primary-light px-2 py-0.5">
            <Ionicons name="checkmark-circle" size={14} color="#FF6A3D" />
            <Text className="ml-1 text-xs font-semibold text-primary">오늘 인증 완료</Text>
          </View>
        ) : null}
      </View>

      {/* 목표 텍스트 */}
      <Text className="font-jua mt-1.5 text-lg font-semibold leading-5 text-ink" numberOfLines={3}>
        {member.goal}
      </Text>

      {/* 오늘 인증(텍스트) — 시작된 챌린지에서만 노출 */}
      {started ? (
        <View className="mt-2">
          {uploaded ? (
            // 인증 완료: 메모 내용 표시 (내 카드는 진행 중일 때 수정 가능)
            <View className="rounded-xl border border-primary/30 bg-primary-light/30 px-3 py-2.5">
              <Text className="font-gowunDodum text-sm leading-5 text-ink">
                {cert?.content || '인증 완료'}
              </Text>
              {isMe && isActive && todayIsCertDay ? (
                <Pressable
                  onPress={() => onWriteCert?.(member)}
                  hitSlop={8}
                  className="mt-1.5 flex-row items-center self-start"
                >
                  <Ionicons name="pencil" size={13} color="#FF6A3D" />
                  <Text className="ml-1 text-xs font-semibold text-primary">인증 수정</Text>
                </Pressable>
              ) : null}
            </View>
          ) : isMe && isActive && todayIsCertDay ? (
            // 내 카드 · 진행 중 · 오늘이 인증 요일 → 인증 버튼
            <Pressable
              onPress={() => onWriteCert?.(member)}
              className="flex-row items-center justify-center rounded-xl border border-dashed border-primary/40 bg-primary-light/40 py-3"
            >
              <Ionicons name="create-outline" size={18} color="#FF6A3D" />
              <Text className="font-gowunDodum ml-1.5 text-md font-semibold text-primary">
                오늘 인증하기
              </Text>
            </Pressable>
          ) : (
            // 미인증 상태 안내
            <View className="flex-row items-center rounded-xl bg-gray-50 px-3 py-2.5">
              <Ionicons
                name={isMe && isActive && !todayIsCertDay ? 'cafe-outline' : 'hourglass-outline'}
                size={16}
                color="#9CA3AF"
              />
              <Text className="font-gowunDodum ml-1.5 text-sm text-ink-faint">
                {isMe && isActive && !todayIsCertDay
                  ? '오늘은 인증 요일이 아니에요'
                  : '아직 인증 전'}
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {/* 하단: 미디어 업로드/미리보기 (선택, 로컬) */}
      <MediaUploader
        media={member.media}
        editable={isMe}
        onPicked={(asset) => onPickMedia(member.id, asset)}
      />
    </View>
  );
}
