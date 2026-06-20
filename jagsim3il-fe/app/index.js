import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChallengeCard } from '../components/ChallengeCard';
import { CreateChallengeModal } from '../components/CreateChallengeModal';
import { useChallengeStore } from '../src/store/challengeStore';
import { useAuthStore } from '../src/store/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const challenges = useChallengeStore((s) => s.challenges);
  const loading = useChallengeStore((s) => s.loading);
  const refreshing = useChallengeStore((s) => s.refreshing);
  const loadChallenges = useChallengeStore((s) => s.loadChallenges);
  const refreshChallenges = useChallengeStore((s) => s.refreshChallenges);
  const addChallenge = useChallengeStore((s) => s.addChallenge);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleCreate = async (form) => {
    await addChallenge(form);
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-5 pb-6 pt-2">
        <View className="flex-row items-center">
          <Image
            source={require('../assets/images/coin-badge-256.png')}
            className="mr-2 h-8 w-8"
            resizeMode="contain"
          />
          <Text className="font-jua text-4xl text-ink">작심삼일</Text>
        </View>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => setModalVisible(true)}
            hitSlop={8}
            className="mr-3 h-12 w-12 items-center justify-center rounded-full"
          >
            <Ionicons name="add-circle-outline" size={32} color="#1A1A2E" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={8}
            className="h-12 w-12 items-center justify-center rounded-full"
          >
            <Ionicons name="settings-outline" size={28} color="#1A1A2E" />
          </Pressable>
        </View>
      </View>

      {/* 인사말 */}
      <View className="px-5 pb-1">
        <Text className="font-gowunDodum text-lg text-ink-muted">
          안녕하세요, <Text className="font-jua font-bold text-ink">{user?.nickname || '회원'}</Text>님
        </Text>
        <Text className="font-jua mt-0.5 text-lg font-semibold text-ink">
          참여 중인 챌린지 {challenges.length}개
        </Text>
      </View>

      {/* 챌린지 리스트 */}
      {loading && challenges.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF6A3D" />
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingTop: 12 }}
          renderItem={({ item }) => (
            <ChallengeCard
              challenge={item}
              onPress={() => router.push(`/challenge/${item.id}`)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshChallenges}
              tintColor="#FF6A3D"
            />
          }
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <Ionicons name="albums-outline" size={48} color="#D1D5DB" />
              <Text className="mt-3 text-ink-faint">아직 참여 중인 챌린지가 없어요</Text>
              <Pressable
                onPress={() => setModalVisible(true)}
                className="mt-4 rounded-xl bg-primary px-5 py-3"
              >
                <Text className="font-bold text-white">첫 챌린지 만들기</Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* 챌린지 추가 모달 */}
      <CreateChallengeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreate}
      />
    </SafeAreaView>
  );
}
