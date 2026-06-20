// 챌린지(Challenge) 도메인 API — 실제 백엔드 연동
// 백엔드: https://jagsim3il.szk.kr (Swagger: /docs)
// 모든 엔드포인트는 Bearer 토큰 인증이 필요하다(스토어에서 token을 넘긴다).
// 응답은 ApiResponse { code, message, data } 이며 request()가 data만 반환한다.
//
// ⚠️ 응답 data의 정확한 필드명은 백엔드 확정 전이라, snake_case를 우선으로
//    가능한 키들을 폭넓게 매핑한다(normalize* 함수). 실제 응답 확인 후 조정 필요.
import { request } from './client';
import { fromApiDateTime } from '../utils/date';

// ── 정규화 ──────────────────────────────────────────────
// 백엔드 챌린지 객체 → 앱 공통 형태
export function normalizeChallenge(raw) {
  if (!raw || typeof raw !== 'object') return null;
  // 시작/종료 일시: start_dt(YYMMDD)+start_tm(HHMM) 또는 ISO 문자열 모두 대응
  const startAt =
    raw.startAt ??
    raw.start_at ??
    (raw.start_dt ? fromApiDateTime(raw.start_dt, raw.start_tm)?.toISOString() : null);
  const endAt =
    raw.endAt ??
    raw.end_at ??
    (raw.end_dt ? fromApiDateTime(raw.end_dt, raw.end_tm)?.toISOString() : null);

  const members = Array.isArray(raw.members)
    ? raw.members.map(normalizeMember)
    : [];

  return {
    id: raw.chal_id ?? raw.id ?? raw.challengeId ?? null,
    title: raw.title ?? '',
    description: raw.desc ?? raw.description ?? '',
    penalty: raw.penalty_desc ?? raw.penalty ?? '',
    startAt,
    endAt,
    status: raw.status ?? null, // preparing | (시작 후 상태)
    startedAt: raw.started_at ?? null,
    // 백엔드가 내려주는 권한/멤버십 플래그
    isOwner: raw.is_owner ?? false,
    isMember: raw.is_member ?? false,
    // owner는 { id, alias } 객체
    ownerId: raw.owner?.id ?? raw.owner_id ?? raw.ownerId ?? null,
    ownerName: raw.owner?.alias ?? raw.owner?.name ?? null,
    joinCd: raw.join_cd ?? raw.join_info?.join_cd ?? null,
    memberCount:
      raw.member_count ?? raw.member_cnt ?? raw.memberCount ?? members.length,
    members,
    raw,
  };
}

// 백엔드 멤버 객체 → 앱 공통 형태
export function normalizeMember(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    id: raw.user_id ?? raw.id ?? raw.userId ?? null,
    userId: raw.user_id ?? raw.userId ?? raw.id ?? null,
    nickname: raw.alias ?? raw.nickname ?? raw.name ?? '',
    avatar: raw.profile_url ?? raw.avatar ?? null,
    goal: raw.promise_desc ?? raw.desc ?? raw.goal ?? '',
    media: raw.media ?? null,
    isMe: raw.is_me ?? raw.isMe ?? null, // 서버가 내려주면 사용
    raw,
  };
}

// 백엔드 약속(promise) 객체 → 앱 공통 형태
export function normalizePromise(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    userId: raw.user_id ?? raw.userId ?? null,
    desc: raw.desc ?? '',
    certDays: raw.cert_days ?? raw.certDays ?? null,
    updatedAt: raw.updated_at ?? null,
    createdAt: raw.created_at ?? null,
    raw,
  };
}

const BASE = '/api/v1/challenge';

// ── 챌린지 ──────────────────────────────────────────────
// 참여/소유 챌린지 목록  GET /api/v1/challenge?role=all|owned|joined
export async function listChallenges(token, role = 'all') {
  const data = await request('GET', BASE, { token, params: { role } });
  const arr = Array.isArray(data) ? data : data?.items ?? data?.challenges ?? [];
  return arr.map(normalizeChallenge);
}

// 챌린지 생성  POST /api/v1/challenge  { title, desc }
export async function createChallenge(token, { title, desc }) {
  const data = await request('POST', BASE, { token, body: { title, desc } });
  return normalizeChallenge(data);
}

// 챌린지 상세  GET /api/v1/challenge/{chal_id}  (비멤버는 join_cd 필수)
export async function getChallenge(token, chalId, joinCd) {
  const data = await request('GET', `${BASE}/${chalId}`, {
    token,
    params: joinCd ? { join_cd: joinCd } : undefined,
  });
  return normalizeChallenge(data);
}

// 챌린지 수정  PATCH /api/v1/challenge/{chal_id}  { title?, desc?, penalty_desc? }
export async function updateChallenge(token, chalId, patch) {
  const data = await request('PATCH', `${BASE}/${chalId}`, { token, body: patch });
  return normalizeChallenge(data);
}

// 챌린지 시작  POST /api/v1/challenge/{chal_id}/start  { start_dt, start_tm, end_dt, end_tm }
export async function startChallenge(token, chalId, body) {
  return request('POST', `${BASE}/${chalId}/start`, { token, body });
}

// 챌린지 가입  POST /api/v1/challenge/join  { chal_id, join_cd, auth_cd? }
export async function joinChallenge(token, body) {
  return request('POST', `${BASE}/join`, { token, body });
}

// 챌린지 탈퇴  DELETE /api/v1/challenge/{chal_id}/members/me
export async function leaveChallenge(token, chalId) {
  return request('DELETE', `${BASE}/${chalId}/members/me`, { token });
}

// 멤버 목록  GET /api/v1/challenge/{chal_id}/members
export async function listMembers(token, chalId) {
  const data = await request('GET', `${BASE}/${chalId}/members`, { token });
  const arr = Array.isArray(data) ? data : data?.items ?? data?.members ?? [];
  return arr.map(normalizeMember);
}

// ── 가입 코드(방장) ──────────────────────────────────────
// 가입 정보 설정  PUT /api/v1/challenge/{chal_id}/join-info  { auth_yn, auth_cd? }
export async function upsertJoinInfo(token, chalId, body) {
  return request('PUT', `${BASE}/${chalId}/join-info`, { token, body });
}

// 가입 코드 재생성  POST /api/v1/challenge/{chal_id}/join-info/regenerate
export async function regenerateJoinCd(token, chalId) {
  return request('POST', `${BASE}/${chalId}/join-info/regenerate`, { token });
}

// ── 약속(promise) ───────────────────────────────────────
// 내 약속 조회  GET /api/v1/challenge/{chal_id}/promise/me
export async function getMyPromise(token, chalId) {
  const data = await request('GET', `${BASE}/${chalId}/promise/me`, { token });
  return normalizePromise(data);
}

// 내 약속 생성/수정  PUT /api/v1/challenge/{chal_id}/promise/me  { desc, cert_days }
export async function upsertMyPromise(token, chalId, body) {
  const data = await request('PUT', `${BASE}/${chalId}/promise/me`, {
    token,
    body,
  });
  return normalizePromise(data);
}

// 전체 약속 목록  GET /api/v1/challenge/{chal_id}/promises
export async function listPromises(token, chalId) {
  const data = await request('GET', `${BASE}/${chalId}/promises`, { token });
  const arr = Array.isArray(data) ? data : data?.items ?? data?.promises ?? [];
  return arr.map(normalizePromise);
}

// ── 인증(cert) ──────────────────────────────────────────
// 인증 생성  POST /api/v1/challenge/{chal_id}/promise/me/cert  { content }
export async function createCert(token, chalId, content) {
  return request('POST', `${BASE}/${chalId}/promise/me/cert`, {
    token,
    body: { content },
  });
}

// 인증 수정  PATCH /api/v1/challenge/{chal_id}/promise/me/cert/{cert_date}  { content }
export async function updateCert(token, chalId, certDate, content) {
  return request('PATCH', `${BASE}/${chalId}/promise/me/cert/${certDate}`, {
    token,
    body: { content },
  });
}

// 내 인증 목록  GET /api/v1/challenge/{chal_id}/promise/me/certs?from=&to=
export async function listMyCerts(token, chalId, from, to) {
  return request('GET', `${BASE}/${chalId}/promise/me/certs`, {
    token,
    params: { from, to },
  });
}

// ── 패널티 ──────────────────────────────────────────────
// 전체 패널티  GET /api/v1/challenge/{chal_id}/penalties
export async function listPenalties(token, chalId) {
  return request('GET', `${BASE}/${chalId}/penalties`, { token });
}

// 내 패널티  GET /api/v1/challenge/{chal_id}/penalties/me
export async function getMyPenalty(token, chalId) {
  return request('GET', `${BASE}/${chalId}/penalties/me`, { token });
}

// 패널티 프리셋 (생성/설정 UI에서 사용)
export const penaltyPresets = [
  '미인증 시 벌금 10,000원',
  '미인증 1회당 커피 한 잔 쏘기',
  '주간 목표 미달 시 벌금 5,000원',
  '단톡방에 셀카 올리기',
];
