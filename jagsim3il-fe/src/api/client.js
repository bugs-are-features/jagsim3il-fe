// 통신 레이어
// ─────────────────────────────────────────────────────────────
// user/auth 관련 엔드포인트는 실제 백엔드(jagsim3il API)에 연결되어 있고,
// 아직 백엔드가 없는 challenge/member 관련은 아래 mock 헬퍼로 동작합니다.
//
// 백엔드 응답은 모두 ApiResponse 봉투 형태입니다:
//   { code: number, message: string, data: any | null }
// request()는 이 봉투를 풀어 data만 반환하고, code가 4xx/5xx면
// message를 담은 Error를 던집니다.

// 실제 API 서버 주소 (필요 시 .env 등으로 분리 가능)
export const BASE_URL = 'https://jagsim3il.szk.kr';

// 실제 백엔드 호출
// method: 'GET' | 'POST' ...
// path:   '/api/v1/...'
// opts:   { body, params, token, full }
//   full=true 이면 data 대신 전체 응답 봉투 { code, message, data }를 반환
export async function request(method, path, { body, params, token, full } = {}) {
  // 쿼리 파라미터 직렬화
  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null)
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  // ── 요청 로그 ──
  console.log(`[API →] ${method} ${url}`, {
    body: body ?? null,
    token: token ? `${String(token).slice(0, 8)}…` : null,
  });

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    // 네트워크 자체 실패
    console.log(`[API ✗] ${method} ${url} 네트워크 실패`, e?.message);
    throw new Error('네트워크 연결을 확인해 주세요.');
  }

  // 응답 본문은 성공/실패 모두 ApiResponse(JSON) 형태
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  // ── 응답 로그 ──
  console.log(`[API ←] ${method} ${url} (HTTP ${res.status})`, json);

  // code가 없으면 HTTP 상태로 판단
  const code = json?.code ?? res.status;
  if (code >= 400) {
    const message = json?.message || '요청 처리 중 오류가 발생했습니다.';
    console.log(`[API ✗] ${method} ${url} 실패 (code ${code}): ${message}`);
    const err = new Error(message);
    err.code = code;
    err.data = json?.data ?? null;
    throw err;
  }

  return full ? json : json?.data ?? null;
}

// ─────────────────────────────────────────────────────────────
// 아래는 아직 백엔드가 없는 영역(challenge/member 등)을 위한 mock 헬퍼
// ─────────────────────────────────────────────────────────────

// 네트워크 지연을 흉내내는 헬퍼
export function delay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// mock 응답을 약간의 지연 후 돌려주는 헬퍼
export async function mockResponse(data, ms = 600) {
  await delay(ms);
  // 참조 공유로 인한 mutation을 막기 위해 깊은 복사본을 반환
  return JSON.parse(JSON.stringify(data));
}

// mock 에러를 발생시키는 헬퍼
export async function mockError(message, ms = 400) {
  await delay(ms);
  throw new Error(message);
}
