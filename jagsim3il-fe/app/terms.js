import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 약관 한 조항
function Article({ title, children }) {
  return (
    <View className="mb-5">
      <Text className="font-jua mb-1.5 text-lg text-ink">{title}</Text>
      <Text className="font-gowunDodum text-sm leading-6 text-ink-muted">{children}</Text>
    </View>
  );
}

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="p-1">
          <Ionicons name="chevron-back" size={26} color="#1A1A2E" />
        </Pressable>
        <Text className="font-jua ml-1 text-2xl text-ink">이용약관</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-gowunDodum mb-6 text-xs text-ink-faint">
          최종 업데이트: 2026년 6월 21일
        </Text>

        <Article title="제1조 (목적)">
          본 약관은 작심삼일(이하 “서비스”)이 제공하는 챌린지 기반 목표 달성 서비스의
          이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정하는 것을
          목적으로 합니다.
        </Article>

        <Article title="제2조 (정의)">
          1. “이용자”란 본 약관에 따라 서비스를 이용하는 회원을 말합니다.{'\n'}
          2. “챌린지”란 이용자가 생성하거나 참여하는 목표 달성 활동을 말합니다.{'\n'}
          3. “약속”이란 챌린지 내에서 이용자가 설정한 수행 목표 및 인증 계획을
          말합니다.{'\n'}
          4. “패널티”란 약속을 이행하지 못한 경우 챌린지 내에서 적용되는 벌칙을
          말합니다.
        </Article>

        <Article title="제3조 (회원가입 및 계정)">
          1. 이용자는 정확한 정보를 제공하여 회원가입을 신청해야 하며, 타인의 정보를
          도용해서는 안 됩니다.{'\n'}
          2. 계정 정보의 관리 책임은 이용자에게 있으며, 이를 제3자가 이용하도록
          하여서는 안 됩니다.
        </Article>

        <Article title="제4조 (챌린지 및 약속)">
          1. 이용자는 챌린지를 생성하거나 가입 코드를 통해 챌린지에 참여할 수 있습니다.{'\n'}
          2. 방장이 챌린지를 시작하기 전까지 이용자는 자유롭게 참여 및 퇴장할 수 있고,
          약속을 생성·수정할 수 있습니다.{'\n'}
          3. 챌린지가 시작된 이후에는 약속 변경 및 멤버 구성 변경이 제한될 수 있습니다.
        </Article>

        <Article title="제5조 (인증 및 콘텐츠)">
          1. 이용자는 약속 이행을 증명하기 위해 사진·동영상 등의 콘텐츠를 업로드할 수
          있습니다.{'\n'}
          2. 이용자는 본인이 권리를 보유하거나 적법하게 이용할 수 있는 콘텐츠만
          업로드해야 하며, 타인의 권리를 침해하는 콘텐츠를 게시해서는 안 됩니다.
        </Article>

        <Article title="제6조 (서비스의 변경 및 중단)">
          회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경하거나, 운영상·기술상의
          필요에 따라 서비스의 전부 또는 일부를 중단할 수 있습니다.
        </Article>

        <Article title="제7조 (책임의 제한)">
          회사는 천재지변, 이용자의 귀책사유 또는 통신 서비스의 장애 등 회사의 통제를
          벗어난 사유로 인하여 발생한 손해에 대하여 책임을 지지 않습니다. 챌린지 내
          패널티의 집행은 이용자 간의 합의에 따르며, 회사는 이에 관여하지 않습니다.
        </Article>

        <Article title="제8조 (약관의 개정)">
          회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정
          시에는 적용일자 및 변경사유를 명시하여 서비스 내에 공지합니다.
        </Article>

        <Text className="font-gowunDodum mt-2 text-xs leading-5 text-ink-faint">
          본 약관은 서비스 이용을 돕기 위한 예시 문서이며, 실제 법적 효력을 위한
          약관은 별도로 검토·고지될 수 있습니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
