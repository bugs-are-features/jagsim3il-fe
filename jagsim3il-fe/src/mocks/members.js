// 방 멤버(ChallengeMember) mock 데이터
// challengeId 별로 멤버 목록을 가집니다.
// 실제 API 연동 시 이 스키마가 응답(challengeMembers) 형태의 기준이 됩니다.
//
// ChallengeMember 스키마
// - id:       string         방 멤버 고유 ID
// - userId:   string         사용자 ID
// - nickname: string         닉네임
// - avatar:   string         프로필 이미지 URL
// - goal:     string         이 방에서 설정한 목표 텍스트
// - media:    Media | null   업로드한 인증 미디어
//
// Media 스키마
// - uri:  string             파일 경로/URL
// - type: 'image' | 'video'  미디어 타입

export const mockChallengeMembers = {
  r1: [
    {
      id: 'rm1',
      userId: 'u1',
      nickname: '홍길동',
      avatar: 'https://i.pravatar.cc/150?img=12',
      goal: '매일 아침 6시에 일어나서 모닝 루틴 사진 올리기',
      media: null,
    },
    {
      id: 'rm2',
      userId: 'u2',
      nickname: '수민',
      avatar: 'https://i.pravatar.cc/150?img=5',
      goal: '기상 후 물 한 잔 마시고 인증샷',
      media: {
        uri: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400',
        type: 'image',
      },
    },
    {
      id: 'rm3',
      userId: 'u3',
      nickname: '지훈',
      avatar: 'https://i.pravatar.cc/150?img=15',
      goal: '6시 기상 후 가벼운 스트레칭 영상 찍기',
      media: null,
    },
    {
      id: 'rm4',
      userId: 'u4',
      nickname: '하늘',
      avatar: 'https://i.pravatar.cc/150?img=32',
      goal: '아침 햇살 보면서 산책 인증',
      media: {
        uri: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400',
        type: 'image',
      },
    },
  ],
  r2: [
    {
      id: 'rm5',
      userId: 'u1',
      nickname: '홍길동',
      avatar: 'https://i.pravatar.cc/150?img=12',
      goal: '매일 밤 책 30분 읽고 책 표지 인증',
      media: null,
    },
    {
      id: 'rm6',
      userId: 'u5',
      nickname: '예린',
      avatar: 'https://i.pravatar.cc/150?img=20',
      goal: '독서 후 한 줄 메모와 함께 인증',
      media: {
        uri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        type: 'image',
      },
    },
    {
      id: 'rm7',
      userId: 'u6',
      nickname: '도윤',
      avatar: 'https://i.pravatar.cc/150?img=8',
      goal: '자기 전 30분 독서 챌린지',
      media: null,
    },
  ],
  r3: [
    {
      id: 'rm8',
      userId: 'u1',
      nickname: '홍길동',
      avatar: 'https://i.pravatar.cc/150?img=12',
      goal: '주 3회 헬스장 가서 운동 영상 찍기',
      media: null,
    },
    {
      id: 'rm9',
      userId: 'u7',
      nickname: '민재',
      avatar: 'https://i.pravatar.cc/150?img=11',
      goal: '운동 끝나고 거울 셀카 인증',
      media: {
        uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        type: 'image',
      },
    },
  ],
};
