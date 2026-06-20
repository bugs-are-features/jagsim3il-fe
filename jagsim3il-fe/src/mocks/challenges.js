// 방(Challenge) mock 데이터
// 실제 API 연동 시 이 스키마가 응답(challenge) 형태의 기준이 됩니다.
//
// Challenge 스키마
// - id:          string   방 고유 ID
// - title:       string   방 제목
// - description: string   방 설명/타이틀
// - startAt:     string   시작 일시 (ISO 8601)
// - endAt:       string   종료 일시 (ISO 8601)
// - penalty:     string   패널티 내용
// - memberCount: number   참여 멤버 수
// - members:     Avatar[] 참여 멤버 아바타 요약 목록
//
// Avatar 스키마
// - id:       string  멤버(사용자) ID
// - nickname: string  닉네임
// - avatar:   string  프로필 이미지 URL

export const mockChallenges = [
  {
    id: 'r1',
    title: '아침 6시 기상 챌린지',
    description: '한 달 동안 매일 아침 6시 기상 인증하기',
    startAt: '2026-06-01T06:00:00.000Z',
    endAt: '2026-06-30T23:59:59.000Z',
    penalty: '미인증 시 벌금 10,000원',
    memberCount: 4,
    members: [
      { id: 'u1', nickname: '홍길동', avatar: 'https://i.pravatar.cc/150?img=12' },
      { id: 'u2', nickname: '수민', avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: 'u3', nickname: '지훈', avatar: 'https://i.pravatar.cc/150?img=15' },
      { id: 'u4', nickname: '하늘', avatar: 'https://i.pravatar.cc/150?img=32' },
    ],
  },
  {
    id: 'r2',
    title: '하루 30분 독서',
    description: '퇴근 후 30분 독서 인증 모임',
    startAt: '2026-06-10T21:00:00.000Z',
    endAt: '2026-07-10T23:00:00.000Z',
    penalty: '미인증 1회당 커피 한 잔 쏘기',
    memberCount: 3,
    members: [
      { id: 'u1', nickname: '홍길동', avatar: 'https://i.pravatar.cc/150?img=12' },
      { id: 'u5', nickname: '예린', avatar: 'https://i.pravatar.cc/150?img=20' },
      { id: 'u6', nickname: '도윤', avatar: 'https://i.pravatar.cc/150?img=8' },
    ],
  },
  {
    id: 'r3',
    title: '주 3회 헬스 인증',
    description: '운동 안 하면 벌금! 같이 운동해요',
    startAt: '2026-06-15T18:00:00.000Z',
    endAt: '2026-08-15T22:00:00.000Z',
    penalty: '주간 목표 미달 시 벌금 5,000원',
    memberCount: 2,
    members: [
      { id: 'u1', nickname: '홍길동', avatar: 'https://i.pravatar.cc/150?img=12' },
      { id: 'u7', nickname: '민재', avatar: 'https://i.pravatar.cc/150?img=11' },
    ],
  },
];

// 패널티 프리셋 (방 추가 모달에서 사용)
export const penaltyPresets = [
  '미인증 시 벌금 10,000원',
  '미인증 1회당 커피 한 잔 쏘기',
  '주간 목표 미달 시 벌금 5,000원',
  '단톡방에 셀카 올리기',
];
