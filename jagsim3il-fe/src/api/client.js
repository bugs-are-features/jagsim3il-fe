// 통신 레이어 (Mock)
// ─────────────────────────────────────────────────────────────
// 현재는 mock 데이터를 비동기로 반환하는 가짜 클라이언트입니다.
// 실제 백엔드 연동 시 이 파일만 axios/fetch 기반으로 교체하면
// 나머지 api/*.js 모듈은 거의 그대로 재사용할 수 있습니다.
//
// 예) 실제 연동 시
//   const BASE_URL = 'https://api.jagsim3il.com';
//   export async function request(method, path, body) {
//     const res = await fetch(`${BASE_URL}${path}`, {
//       method,
//       headers: { 'Content-Type': 'application/json' },
//       body: body ? JSON.stringify(body) : undefined,
//     });
//     if (!res.ok) throw new Error((await res.json()).message);
//     return res.json();
//   }

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
