import { Modal, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AvatarStack } from './Avatar';
import { formatDateTime } from '../src/utils/date';

function Row({ icon, label, value }) {
  return (
    <View className="mb-4 flex-row items-start">
      <View className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-primary-light">
        <Ionicons name={icon} size={16} color="#5B5BD6" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-ink-faint">{label}</Text>
        <Text className="mt-0.5 text-sm font-medium text-ink">{value}</Text>
      </View>
    </View>
  );
}

// 방 정보 상세 모달 (상세 버튼 탭 시)
export function RoomDetailModal({ visible, onClose, room }) {
  const insets = useSafeAreaInsets();
  if (!room) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View
          className="rounded-t-3xl bg-white px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="mb-3 items-center">
            <View className="h-1.5 w-10 rounded-full bg-gray-300" />
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="flex-1 pr-2 text-xl font-bold text-ink">{room.title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          <Text className="mb-5 text-sm text-ink-muted">{room.description}</Text>

          <Row icon="play-outline" label="시작" value={formatDateTime(room.startAt)} />
          <Row icon="flag-outline" label="종료" value={formatDateTime(room.endAt)} />
          <Row icon="warning-outline" label="패널티" value={room.penalty} />

          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs text-ink-faint">참여 멤버 {room.memberCount}명</Text>
            <AvatarStack members={room.members} size={30} max={6} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
