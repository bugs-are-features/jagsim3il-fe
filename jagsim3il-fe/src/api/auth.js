// 인증 관련 API (Mock)
// 실제 연동 시 mockResponse/mockError 부분을 client.request(...) 호출로 교체하세요.
import { mockResponse, mockError } from './client';
import { mockUsers } from '../mocks/users';

// 로그인
// 예상 API: POST /api/auth/login
// request:  { username, password }
// response: { token, user: { id, username, nickname, email, avatar } }
export async function loginRequest({ username, password }) {
  const found = mockUsers.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) {
    return mockError('아이디 또는 비밀번호가 올바르지 않습니다.');
  }
  const { password: _pw, ...user } = found;
  return mockResponse({ token: `mock-token-${user.id}`, user });
}

// 회원가입
// 예상 API: POST /api/auth/signup
// request:  { username, nickname, email, password }
// response: { token, user: { id, username, nickname, email, avatar } }
export async function signupRequest({ username, nickname, email, password }) {
  const exists = mockUsers.some((u) => u.username === username);
  if (exists) {
    return mockError('이미 사용 중인 아이디입니다.');
  }
  const user = {
    id: `u${Date.now()}`,
    username,
    nickname,
    email,
    avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
  };
  return mockResponse({ token: `mock-token-${user.id}`, user });
}

// 아이디 중복 확인
// 예상 API: GET /api/auth/check-username?username=...
// response: { available: boolean }
export async function checkUsernameRequest(username) {
  const taken = mockUsers.some((u) => u.username === username);
  return mockResponse({ available: !taken });
}
