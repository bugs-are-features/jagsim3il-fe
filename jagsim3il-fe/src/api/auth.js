// 인증 관련 API (실제 백엔드 연동)
// 백엔드: https://jagsim3il.szk.kr  (Swagger: /docs)
// 모든 응답은 ApiResponse 봉투 { code, message, data } 형태이며,
// client.request()가 data만 반환하고 실패 시 message로 throw 합니다.
import { request } from './client';

// 백엔드 user 응답을 앱 공통 형태로 정규화한다.
// 백엔드 필드명이 확정 전이라 가능한 키들을 폭넓게 매핑한다.
// (가입 필드는 id / alias / email 이므로 이를 우선 사용)
export function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const nickname = raw.alias ?? raw.nickname ?? raw.name ?? null;
  return {
    // 로그인 아이디
    username: raw.id ?? raw.username ?? raw.login_id ?? raw.loginId ?? null,
    // 닉네임
    nickname,
    alias: nickname,
    // 이메일
    email: raw.email ?? null,
    // 프로필 이미지(없을 수 있음). 백엔드는 profile_url 키 사용.
    avatar:
      raw.avatar ?? raw.profile_url ?? raw.profile_image ?? raw.profileImage ?? null,
    // 원본 보관(추가 필드 필요 시 참조)
    raw,
  };
}

// 로그인
// API: POST /api/v1/user/login
// request:  { identifier (아이디 또는 이메일), pw }
// response data: 로그인 토큰 (정확한 키는 백엔드 확정 시 조정)
// 반환: { token, user }  (user는 토큰으로 /user/ 조회)
export async function loginRequest({ identifier, pw }) {
  const data = await request('POST', '/api/v1/user/login', {
    body: { identifier, pw },
  });

  // data 형태가 백엔드 확정 전이라 토큰 키를 유연하게 추출한다.
  const token =
    typeof data === 'string'
      ? data
      : data?.token ?? data?.access_token ?? data?.accessToken ?? null;

  // 토큰으로 현재 사용자 정보를 조회 (실패해도 로그인 자체는 유지)
  let user = null;
  if (token) {
    try {
      user = await getMeRequest(token);
    } catch {
      user = null;
    }
  }

  // ⚠️ /user 응답에는 email이 없다. 이메일로 로그인한 경우 이를 보완해
  //    비밀번호 재설정 등 email이 필요한 기능에서 사용할 수 있게 한다.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (user && !user.email && EMAIL_RE.test(identifier)) {
    user.email = identifier;
  }

  return { token, user };
}

// 현재 로그인한 사용자 정보 조회
// API: GET /api/v1/user  (Bearer 인증)
// response data: 사용자 객체 → 앱 공통 형태로 정규화해 반환
export async function getMeRequest(token) {
  const data = await request('GET', '/api/v1/user', { token });
  return normalizeUser(data);
}

// 프로필 수정
// API: PATCH /api/v1/user  (Bearer 인증)  ⚠️ 엔드포인트/키는 백엔드 확정 시 조정
// request:  { alias?(닉네임) }
// response data: 갱신된 사용자 객체(없을 수 있음) → 정규화해 반환
export async function updateProfileRequest(token, { alias } = {}) {
  const body = {};
  if (alias != null) body.alias = alias;
  const data = await request('PATCH', '/api/v1/user', { token, body });
  return normalizeUser(data);
}

// 회원가입
// API: POST /api/v1/user/register
// request:  { id, pw, alias(닉네임), email }
// 주의: 가입 후 이메일 인증을 완료해야 로그인 가능 (자동 로그인 불가)
// response: ApiResponse (data 없음) — message를 그대로 사용
export async function signupRequest({ id, pw, alias, email }) {
  await request('POST', '/api/v1/user/register', {
    body: { id, pw, alias, email },
  });
  return true;
}

// 아이디 중복 확인
// API: GET /api/v1/user/check-id?id=...
// response data: { duplicate: boolean }
// 반환: { available: boolean }
export async function checkIdRequest(id) {
  const data = await request('GET', '/api/v1/user/check-id', {
    params: { id },
  });
  return { available: !data?.duplicate };
}

// 이메일 중복 확인
// API: GET /api/v1/user/check-email?email=...
// response data: { duplicate: boolean }
// 반환: { available: boolean }
export async function checkEmailRequest(email) {
  const data = await request('GET', '/api/v1/user/check-email', {
    params: { email },
  });
  return { available: !data?.duplicate };
}

// 패스워드 초기화
// API: POST /api/v1/user/password-reset
// request: { email }
// response: ApiResponse (data 없음) — message를 그대로 사용
export async function passwordReset(email) {
  await request('POST', '/api/v1/user/password-reset', {
    body: { email },
  });
  return true;
}

// 로그아웃 (서버 세션/토큰 무효화)
// API: POST /api/v1/user/logout  (Bearer 인증 필요)
// 서버 응답 message를 반환한다.
export async function logout(token) {
  const res = await request('POST', '/api/v1/user/logout', { token, full: true });
  return res?.message ?? '';
}