import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { Avatar } from './Avatar';
import { AuthMediaPreview } from './AuthMediaPreview';
import { formatCertDate } from '../src/utils/date';
import { authFileSource } from '../src/api/challenges';
import { useAuthStore } from '../src/store/authStore';

// 첨부 인증(사진/영상) 칩 + 미리보기
function CertAttachments({ image, video, token }) {
  if (!image?.url && !video?.url) return null;
  return (
    <View className="mt-2">
      <View className="flex-row flex-wrap items-center">
        {image?.url ? (
          <View className="mr-2 flex-row items-center rounded-full bg-primary-light px-2 py-0.5">
            <Ionicons name="image" size={12} color="#FF6A3D" />
            <Text className="ml-1 text-xs font-semibold text-primary">사진</Text>
          </View>
        ) : null}
        {video?.url ? (
          <View className="mr-2 flex-row items-center rounded-full bg-primary-light px-2 py-0.5">
            <Ionicons name="videocam" size={12} color="#FF6A3D" />
            <Text className="ml-1 text-xs font-semibold text-primary">영상</Text>
          </View>
        ) : null}
      </View>
      {image?.url ? (
        <AuthMediaPreview
          source={authFileSource(image.url, token)}
          type="image"
          className="mt-2 aspect-[16/9] w-full rounded-xl bg-gray-100"
        />
      ) : null}
      {video?.url ? (
        <AuthMediaPreview
          source={authFileSource(video.url, token)}
          type="video"
          className="mt-2 aspect-[16/9] w-full rounded-xl bg-gray-100"
        />
      ) : null}
    </View>
  );
}

// 멤버 카드 탭 시 — 해당 멤버의 챌린지 인증 내역
export function MemberCertHistorySheet({ visible, onClose, member }) {
  const insets = useSafeAreaInsets();
  const token = useAuthStore((s) => s.token);
  if (!member) return null;

  const history = member.certHistory ?? [];
  const uploadedCount = member.certStats?.uploadedCount ?? 0;
  const missedCount = member.certStats?.missedCount ?? 0;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View
        className="rounded-t-3xl bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 16, maxHeight: '100%' }}
      >
        <View className="mb-2 items-center">
          <View className="h-1.5 w-10 rounded-full bg-gray-300" />
        </View>

        <View className="mb-4 flex-row items-center">
          <Avatar
            uri={member.avatar}
            nickname={member.nickname}
            id={member.loginId ?? member.id}
            size={40}
          />
          <View className="ml-3 flex-1">
            <Text className="font-jua text-xl font-bold text-ink">{member.nickname}</Text>
            <Text className="font-gowunDodum mt-0.5 text-sm text-ink-muted">인증 내역</Text>
          </View>
        </View>

        {/* 누적 집계 */}
        <View className="mb-4 flex-row rounded-xl bg-gray-50 px-4 py-3">
          <View className="flex-1 items-center">
            <Text className="font-jua text-2xl font-bold text-primary">{uploadedCount}</Text>
            <Text className="font-gowunDodum mt-0.5 text-xs text-ink-muted">인증</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text
              className={`font-jua text-2xl font-bold ${missedCount > 0 ? 'text-red-500' : 'text-ink-faint'
                }`}
            >
              {missedCount}
            </Text>
            <Text className="font-gowunDodum mt-0.5 text-xs text-ink-muted">미인증(패널티)</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {history.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="document-text-outline" size={40} color="#D1D5DB" />
              <Text className="font-gowunDodum mt-3 text-sm text-ink-faint">
                아직 인증 내역이 없어요
              </Text>
            </View>
          ) : (
            history.map((cert) => {
              const uploaded = cert.status === 'uploaded';
              const textContent = cert.text?.content;
              const hasAttachment = !!(cert.image?.url || cert.video?.url);
              return (
                <View
                  key={cert.certDate ?? cert.createdAt}
                  className="mb-2 rounded-xl border border-gray-100 bg-white px-4 py-3"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="font-gowunDodum text-sm font-semibold text-ink">
                      {formatCertDate(cert.certDate)}
                    </Text>
                    <View
                      className={`flex-row items-center rounded-full px-2 py-0.5 ${uploaded ? 'bg-primary-light' : 'bg-red-50'
                        }`}
                    >
                      <Ionicons
                        name={uploaded ? 'checkmark-circle' : 'close-circle'}
                        size={14}
                        color={uploaded ? '#FF6A3D' : '#EF4444'}
                      />
                      <Text
                        className={`ml-1 text-xs font-semibold ${uploaded ? 'text-primary' : 'text-red-500'
                          }`}
                      >
                        {uploaded ? '인증' : '미인증'}
                      </Text>
                    </View>
                  </View>
                  {textContent ? (
                    <Text className="font-gowunDodum mt-1.5 text-sm leading-5 text-ink-muted">
                      {textContent}
                    </Text>
                  ) : null}
                  {hasAttachment ? (
                    <CertAttachments image={cert.image} video={cert.video} token={token} />
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}
