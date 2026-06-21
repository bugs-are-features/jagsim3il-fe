import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { Avatar } from './Avatar';
import { formatCertDate } from '../src/utils/date';

// 멤버 카드 탭 시 — 해당 멤버의 챌린지 인증 내역
export function MemberCertHistorySheet({ visible, onClose, member }) {
  const insets = useSafeAreaInsets();
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
                  {uploaded && cert.content ? (
                    <Text className="font-gowunDodum mt-1.5 text-sm leading-5 text-ink-muted">
                      {cert.content}
                    </Text>
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
