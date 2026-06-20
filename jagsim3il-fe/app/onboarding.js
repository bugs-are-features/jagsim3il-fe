import { useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import PagerView from 'react-native-pager-view';
import { Target, Camera, Flame } from 'lucide-react-native';
import { useOnboardingStore } from '../src/store/onboardingStore';

// 온보딩 슬라이드 데이터 (아이콘 + 문구)
const SLIDES = [
  {
    key: 'goal',
    Icon: Target,
    title: '함께 목표를 세워요',
    desc: '혼자선 작심삼일이지만,\n친구들과 함께라면 끝까지 갈 수 있어요.',
  },
  {
    key: 'verify',
    Icon: Camera,
    title: '사진·영상으로 인증해요',
    desc: '오늘의 목표를 사진이나 영상으로 남기고\n서로의 인증을 확인하세요.',
  },
  {
    key: 'penalty',
    Icon: Flame,
    title: '패널티로 동기부여',
    desc: '못 지키면 약속한 패널티!\n적당한 긴장감이 꾸준함을 만들어요.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const pagerRef = useRef(null);
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;

  // 온보딩 완료 후 로그인 화면으로 이동.
  // (_layout의 guard로도 리다이렉트되지만, 명시적으로 replace해 깔끔하게 처리)
  const finish = async () => {
    await completeOnboarding();
    router.replace('/login');
  };

  const handleNext = () => {
    if (isLast) {
      finish();
    } else {
      pagerRef.current?.setPage(page + 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 건너뛰기 */}
      <View className="h-12 flex-row items-center justify-end px-5">
        {!isLast && (
          <Pressable onPress={finish} hitSlop={8}>
            <Text className="text-sm font-semibold text-ink-muted">건너뛰기</Text>
          </Pressable>
        )}
      </View>

      {/* 슬라이드 */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {SLIDES.map(({ key, Icon, title, desc }) => (
          <View key={key} className="flex-1 items-center justify-center px-8">
            <View className="mb-10 h-32 w-32 items-center justify-center rounded-full bg-primary-light">
              <Icon size={56} color="#5B5BD6" strokeWidth={1.8} />
            </View>
            <Text className="mb-4 text-center text-2xl font-extrabold text-ink">
              {title}
            </Text>
            <Text className="text-center text-base leading-6 text-ink-muted">
              {desc}
            </Text>
          </View>
        ))}
      </PagerView>

      {/* 페이지 인디케이터 */}
      <View className="mb-6 flex-row items-center justify-center">
        {SLIDES.map((s, i) => (
          <View
            key={s.key}
            className={`mx-1 h-2 rounded-full ${
              i === page ? 'w-6 bg-primary' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </View>

      {/* 하단 버튼 */}
      <View className="px-6 pb-4">
        <Pressable
          onPress={handleNext}
          className="items-center rounded-xl bg-primary py-4"
        >
          <Text className="text-base font-bold text-white">
            {isLast ? '시작하기' : '다음'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
