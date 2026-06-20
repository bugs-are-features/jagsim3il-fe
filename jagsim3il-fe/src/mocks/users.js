// 사용자 mock 데이터
// 실제 API 연동 시 이 스키마가 응답(user) 형태의 기준이 됩니다.
//
// User 스키마
// - id:       string  사용자 고유 ID
// - username: string  로그인 아이디
// - password: string  비밀번호 (mock 전용, 실제 응답에는 포함되지 않음)
// - nickname: string  닉네임
// - email:    string  이메일
// - avatar:   string  프로필 이미지 URL

export const mockUsers = [
  {
    id: 'u1',
    username: 'gildong',
    password: '1234',
    nickname: '홍길동',
    email: 'gildong@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'u2',
    username: 'sumin',
    password: '1234',
    nickname: '수민',
    email: 'sumin@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
];

// 현재 로그인 사용자로 가정하는 mock 계정
export const currentUser = mockUsers[0];
