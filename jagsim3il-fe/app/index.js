import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RoomCard } from '../components/RoomCard';
import { CreateRoomModal } from '../components/CreateRoomModal';
import { useRoomStore } from '../src/store/roomStore';
import { useAuthStore } from '../src/store/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const rooms = useRoomStore((s) => s.rooms);
  const loading = useRoomStore((s) => s.loading);
  const refreshing = useRoomStore((s) => s.refreshing);
  const loadRooms = useRoomStore((s) => s.loadRooms);
  const refreshRooms = useRoomStore((s) => s.refreshRooms);
  const addRoom = useRoomStore((s) => s.addRoom);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreate = async (form) => {
    await addRoom(form);
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <View className="flex-row items-center">
          <View className="mr-2 h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <Ionicons name="flame" size={18} color="white" />
          </View>
          <Text className="text-2xl font-extrabold text-ink">작심삼일</Text>
        </View>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => setModalVisible(true)}
            hitSlop={8}
            className="mr-1 h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="add-circle-outline" size={28} color="#1A1A2E" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="settings-outline" size={24} color="#1A1A2E" />
          </Pressable>
        </View>
      </View>

      {/* 인사말 */}
      <View className="px-5 pb-1">
        <Text className="text-sm text-ink-muted">
          안녕하세요, <Text className="font-bold text-ink">{user?.nickname || '회원'}</Text>님 👋
        </Text>
        <Text className="mt-0.5 text-base font-semibold text-ink">
          참여 중인 방 {rooms.length}개
        </Text>
      </View>

      {/* 방 리스트 */}
      {loading && rooms.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#5B5BD6" />
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingTop: 12 }}
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              onPress={() => router.push(`/room/${item.id}`)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshRooms}
              tintColor="#5B5BD6"
            />
          }
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <Ionicons name="albums-outline" size={48} color="#D1D5DB" />
              <Text className="mt-3 text-ink-faint">아직 참여 중인 방이 없어요</Text>
              <Pressable
                onPress={() => setModalVisible(true)}
                className="mt-4 rounded-xl bg-primary px-5 py-3"
              >
                <Text className="font-bold text-white">첫 방 만들기</Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* 방 추가 모달 */}
      <CreateRoomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreate}
      />
    </SafeAreaView>
  );
}
