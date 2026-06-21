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
    // 가입 시 인증 코드 입력 필요 여부('Y'면 4자리 인증 코드 필요)
    authYn: raw.auth_yn ?? raw.join_info?.auth_yn ?? null,
    // 인증 코드(방장 본인 조회 시 응답에 포함될 수 있음)
    authCd: raw.auth_cd ?? raw.join_info?.auth_cd ?? null,
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
// 실제 응답: { user_id(UUID), id(로그인ID), alias(닉네임), joined_at }
// (멤버가 { user: {...} }로 중첩되는 변형도 함께 대응)
export function normalizeMember(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const u = raw.user ?? raw.member ?? {};
  const uuid = raw.user_id ?? u.user_id ?? null; // 내부 식별자(UUID)
  const loginId = raw.id ?? u.id ?? raw.login_id ?? null; // 로그인 ID(약속/유저 매칭 키)
  return {
    id: uuid ?? loginId ?? null, // 리스트 key (고유)
    userId: uuid, // 업로드 등 내부 API용
    loginId, // 약속/내 카드 매칭 키
    nickname: raw.alias ?? raw.nickname ?? raw.name ?? u.alias ?? u.nickname ?? '',
    avatar: raw.profile_url ?? raw.avatar ?? u.profile_url ?? u.avatar ?? null,
    // 멤버 응답이 약속을 함께 주는 변형도 대응(기본은 promises로 병합)
    goal: raw.promise_desc ?? raw.desc ?? raw.goal ?? raw.promise?.desc ?? '',
    media: raw.media ?? null,
    isMe: raw.is_me ?? raw.isMe ?? null, // 서버가 내려주면 사용
    raw,
  };
}

// 백엔드 약속(promise) 객체 → 앱 공통 형태
// 약속 목록 항목: { user: { id(로그인ID), alias }, promise: { desc, cert_days, ... } }
// 내 약속(/promise/me)은 평면 객체: { desc, cert_days, promise_id, ... }
export function normalizePromise(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const u = raw.user ?? {};
  const p = raw.promise ?? raw; // 목록은 nested(promise), /me는 평면
  return {
    loginId: u.id ?? raw.user_id ?? raw.userId ?? null, // 멤버(loginId)와 매칭
    nickname: u.alias ?? u.nickname ?? null,
    desc: p.desc ?? p.promise_desc ?? p.content ?? '',
    certDays: p.cert_days ?? p.certDays ?? null,
    promiseId: p.promise_id ?? null,
    updatedAt: p.updated_at ?? null,
    createdAt: p.created_at ?? null,
    raw,
  };
}

// 백엔드 인증(cert) 객체 → 앱 공통 형태
// CertDto: { cert_date(YYYY-MM-DD), status(uploaded|missed), content, created_at, updated_at }
export function normalizeCert(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    certDate: raw.cert_date ?? raw.certDate ?? null,
    status: raw.status ?? null, // 'uploaded' | 'missed'
    content: raw.content ?? null,
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
    raw,
  };
}

// 백엔드 패널티 집계 객체 → 앱 공통 형태
// PenaltySummaryDto: { user_id, id, alias, missed_count, uploaded_count }
// MyPenaltyDto: { missed_count, uploaded_count, penalty_desc }
export function normalizePenalty(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    userId: raw.user_id ?? null,
    loginId: raw.id ?? null,
    nickname: raw.alias ?? raw.nickname ?? null,
    missedCount: raw.missed_count ?? raw.missedCount ?? 0,
    uploadedCount: raw.uploaded_count ?? raw.uploadedCount ?? 0,
    penaltyDesc: raw.penalty_desc ?? raw.penaltyDesc ?? null,
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

// 가입 코드로 챌린지 미리보기 조회  GET /api/v1/challenge/lookup?join_cd=XXXX
// 비멤버도 인증 코드(auth_cd) 없이 조회 가능. 응답(ChallengeLookupDto)에는
// 가입 판단에 필요한 정보만 담긴다(기간/시작시각 등 민감 정보는 미포함).
// { chal_id, title, desc, status, owner{id,alias}, member_count, auth_yn, is_member, is_owner }
export async function lookupChallenge(token, joinCd) {
  const data = await request('GET', `${BASE}/lookup`, {
    token,
    params: { join_cd: joinCd },
  });
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

// 챌린지 조기 종료  POST /api/v1/challenge/{chal_id}/end  (body 없음, 방장·active만)
export async function endChallenge(token, chalId) {
  const data = await request('POST', `${BASE}/${chalId}/end`, { token });
  return normalizeChallenge(data);
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

// 가입 코드 정보 조회(방장)  GET /api/v1/challenge/{chal_id}/join-info
// 응답 JoinInfoDto: { join_cd, auth_yn, auth_cd }
// (비방장 403, 가입 코드 미설정 시 404 → 호출부에서 catch)
export async function getJoinInfo(token, chalId) {
  const data = await request('GET', `${BASE}/${chalId}/join-info`, { token });
  return {
    joinCd: data?.join_cd ?? null,
    authYn: data?.auth_yn ?? null,
    authCd: data?.auth_cd ?? null,
    raw: data,
  };
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
// 인증 생성(당일)  POST /api/v1/challenge/{chal_id}/promise/me/cert  { content }
// cert_date는 서버가 KST 오늘로 설정. content는 1~500자 텍스트 메모.
export async function createCert(token, chalId, content) {
  const data = await request('POST', `${BASE}/${chalId}/promise/me/cert`, {
    token,
    body: { content },
  });
  return normalizeCert(data);
}

// 당일 인증 수정  PATCH /api/v1/challenge/{chal_id}/promise/me/cert/{cert_date}  { content }
export async function updateCert(token, chalId, certDate, content) {
  const data = await request('PATCH', `${BASE}/${chalId}/promise/me/cert/${certDate}`, {
    token,
    body: { content },
  });
  return normalizeCert(data);
}

// 내 인증 이력  GET /api/v1/challenge/{chal_id}/promise/me/certs?from=&to=
// 응답 data: { certs: CertDto[] }
export async function listMyCerts(token, chalId, from, to) {
  const data = await request('GET', `${BASE}/${chalId}/promise/me/certs`, {
    token,
    params: { from, to },
  });
  const arr = Array.isArray(data) ? data : data?.certs ?? data?.items ?? [];
  return arr.map(normalizeCert);
}

// 챌린지 전체 인증 이력  GET /api/v1/challenge/{chal_id}/certs?from=&to=
// 응답 data: { member_certs: [{ user: MemberDto, certs: CertDto[] }] }
// 반환: [{ member(정규화), certs(정규화 배열) }]
export async function listAllCerts(token, chalId, from, to) {
  const data = await request('GET', `${BASE}/${chalId}/certs`, {
    token,
    params: { from, to },
  });
  const arr = Array.isArray(data)
    ? data
    : data?.member_certs ?? data?.memberCerts ?? data?.items ?? [];
  return arr.map((row) => ({
    member: normalizeMember(row.user ?? row.member ?? row),
    certs: Array.isArray(row.certs) ? row.certs.map(normalizeCert) : [],
  }));
}

// ── 패널티 ──────────────────────────────────────────────
// 멤버별 패널티 집계  GET /api/v1/challenge/{chal_id}/penalties  (status ≠ preparing)
// 응답 data: { penalties: PenaltySummaryDto[] }
export async function listPenalties(token, chalId) {
  const data = await request('GET', `${BASE}/${chalId}/penalties`, { token });
  const arr = Array.isArray(data) ? data : data?.penalties ?? data?.items ?? [];
  return arr.map(normalizePenalty);
}

// 내 패널티 요약  GET /api/v1/challenge/{chal_id}/penalties/me  (status ≠ preparing)
// 응답 data: MyPenaltyDto { missed_count, uploaded_count, penalty_desc }
export async function getMyPenalty(token, chalId) {
  const data = await request('GET', `${BASE}/${chalId}/penalties/me`, { token });
  return normalizePenalty(data);
}

// ── 참여 코드(공유용) ────────────────────────────────────
// 가입에는 chal_id + join_cd가 모두 필요한데 참여자는 chal_id를 알 수 없으므로,
// 방장이 둘을 합친 "참여 코드"를 공유하고 참여자는 이를 입력한다.
// 형식: "<chal_id>.<join_cd>"  (chal_id는 UUID, join_cd는 영숫자라 '.'로 안전 분리)
export function buildJoinToken(chalId, joinCd) {
  if (!chalId || !joinCd) return '';
  return `${joinCd}`;
}

export function parseJoinToken(token) {
  const t = (token || '').trim();
  const i = t.indexOf('.');
  if (i <= 0 || i === t.length - 1) return null;
  return { chalId: t.slice(0, i), joinCd: t.slice(i + 1) };
}

// 패널티 프리셋 (생성/설정 UI에서 사용)
export const penaltyPresets = [
  '미인증 시 벌금 10,000원',
  '미인증 1회당 커피 한 잔 쏘기',
  '주간 목표 미달 시 벌금 5,000원',
  '단톡방에 셀카 올리기',
];
