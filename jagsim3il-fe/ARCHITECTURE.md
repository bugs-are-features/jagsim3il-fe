# jagsim3il (작심삼일) 코드 분석 문서

Expo + React Native(JavaScript) 기반의 "함께 목표 인증" 모바일 앱입니다.
현재 백엔드는 없으며 모든 데이터는 **mock 데이터 + zustand**로 동작합니다.
데이터 fetching 로직은 `src/api/*`로 분리되어 있어 나중에 실제 API로 쉽게 교체할 수 있습니다.

---

## 1. 프로젝트 구조

```
jagsim3il-fe/
├── app/                        # expo-router 파일 기반 라우팅 (화면)
│   ├── _layout.js              # 루트 레이아웃 + 인증 라우팅 분기(Provider 래핑)
│   ├── login.js                # 로그인 화면
│   ├── signup.js               # 회원가입 화면
│   ├── index.js                # 홈 화면 (참여 중인 방 리스트)
│   ├── settings.js             # 설정 화면
│   └── room/
│       └── [roomId].js         # 방 화면 (처음 입장 / 이후 입장 분기)
│
├── components/                 # 재사용 UI 컴포넌트
│   ├── Avatar.js               # 단일 아바타 + 겹친 아바타 스택(AvatarStack)
│   ├── Checkbox.js             # Pressable 기반 커스텀 체크박스
│   ├── RoomCard.js             # 홈 화면 방 카드
│   ├── CreateRoomModal.js      # 방 추가 모달 (RN Modal)
│   ├── DateTimeField.js        # 날짜+시간 선택 필드 (iOS/Android 분기)
│   ├── RoomDetailModal.js      # 방 정보 상세 모달
│   ├── MemberCard.js           # 방 화면 멤버 카드
│   ├── MediaUploader.js        # 이미지/동영상 촬영·선택·미리보기
│   └── PenaltyBanner.js        # 하단 고정 패널티 배너
│
├── src/                        # 비-UI 로직
│   ├── api/                    # 통신 레이어 (★ 실제 API 교체 지점)
│   │   ├── client.js           # mock 응답/지연/에러 헬퍼 (← 여기만 교체하면 됨)
│   │   ├── auth.js             # 로그인/회원가입/아이디 중복확인
│   │   ├── rooms.js            # 방 리스트/생성/상세 조회
│   │   └── members.js          # 목표 등록/미디어 업로드
│   ├── store/                  # zustand 상태관리
│   │   ├── authStore.js        # 인증 상태
│   │   └── roomStore.js        # 방/멤버 상태
│   ├── mocks/                  # mock 데이터 (★ 향후 API 응답 스키마 기준)
│   │   ├── users.js
│   │   ├── rooms.js
│   │   └── members.js
│   └── utils/
│       └── date.js             # 날짜 포맷/D-day 계산
│
├── global.css                  # NativeWind(Tailwind) 엔트리
├── tailwind.config.js          # Tailwind 설정 (커스텀 컬러 primary/ink)
├── babel.config.js             # babel-preset-expo + nativewind/babel
├── metro.config.js             # withNativeWind 설정
└── app.json                    # Expo 설정 (권한 플러그인 포함)
```

---

## 2. 화면 및 라우팅 맵

| 라우트 (app 경로) | 컴포넌트 | 주요 역할 |
|---|---|---|
| `app/_layout.js` | `RootLayout` | 전역 Provider(SafeArea/GestureHandler), `global.css` 로드, **인증 라우팅 분기** |
| `app/login.js` | `LoginScreen` | 아이디/비밀번호 로그인, 빈 값 검증, 회원가입 이동 |
| `app/signup.js` | `SignupScreen` | 회원가입(아이디/닉네임/이메일/비번/비번확인), 약관 동의, 유효성 검사 |
| `app/index.js` | `HomeScreen` | 참여 중인 방 리스트(FlatList), pull-to-refresh, 방 추가 모달, 설정 이동 |
| `app/settings.js` | `SettingsScreen` | 프로필 표시, 알림 토글, 로그아웃 |
| `app/room/[roomId].js` | `RoomScreen` | **처음 입장(목표 설정)** / **이후 입장(멤버 카드 + 패널티 배너)** 분기 |

### 인증 라우팅 분기 (`app/_layout.js`)
`useProtectedRoute(isAuthenticated)` 훅이 `useSegments()`로 현재 위치를 감지하여:
- 비로그인 + 보호 화면 접근 → `/login`으로 `replace`
- 로그인 + 인증 화면(`login`/`signup`) 접근 → `/`로 `replace`

---

## 3. 서버 통신 지점 전체 목록 (가장 중요)

> 현재는 모두 mock으로 동작하며, 각 함수는 `src/api/*`에 위치합니다.
> 실제 연동 시 아래 "예상 API"대로 `src/api/client.js`의 호출만 바꾸면 됩니다.

| # | 위치 (파일 · 함수) | 트리거 시점 | 현재 mock 처리 | 예상 API | 요청 데이터 | 응답(기대) 형태 |
|---|---|---|---|---|---|---|
| 1 | `src/api/auth.js` · `loginRequest` (`store/authStore.login` 경유) | 로그인 화면 "로그인" 버튼 클릭 | `mockUsers`에서 username/password 일치 검색 | `POST /api/auth/login` | `{ username, password }` | `{ token, user: { id, username, nickname, email, avatar } }` |
| 2 | `src/api/auth.js` · `signupRequest` (`store/authStore.signup` 경유) | 회원가입 "가입하기" 버튼 클릭 | 중복 아이디 검사 후 새 user 생성 | `POST /api/auth/signup` | `{ username, nickname, email, password }` | `{ token, user: {...} }` |
| 3 | `src/api/auth.js` · `checkUsernameRequest` | 아이디 중복 확인(현재 화면 미연결, 함수만 제공) | `mockUsers`에 동일 username 존재 여부 | `GET /api/auth/check-username?username=` | `username` (query) | `{ available: boolean }` |
| 4 | `src/api/rooms.js` · `fetchRooms` (`store/roomStore.loadRooms`/`refreshRooms`) | 홈 화면 진입 시 + pull-to-refresh | `mockRooms` 반환 | `GET /api/rooms` | (인증 토큰) | `Room[]` |
| 5 | `src/api/rooms.js` · `createRoom` (`store/roomStore.addRoom`) | 방 추가 모달 "방 만들기" 클릭 | 새 Room 객체 생성 후 리스트 prepend | `POST /api/rooms` | `{ title, description, startAt, endAt, penalty }` | `Room` |
| 6 | `src/api/rooms.js` · `fetchRoomDetail` (`store/roomStore.loadRoomDetail`) | 방 화면 진입 시 | `mockRooms` + `mockRoomMembers[roomId]` | `GET /api/rooms/:roomId` | `roomId` (path) | `{ room: Room, members: RoomMember[] }` |
| 7 | `src/api/members.js` · `submitGoal` (`store/roomStore.joinRoom`) | 처음 입장 "입장하기"(목표 입력 후) | 내 RoomMember 생성, `joinedRooms[roomId]=true` | `POST /api/rooms/:roomId/join` | `{ goal }` | `RoomMember` |
| 8 | `src/api/members.js` · `uploadMedia` (`store/roomStore.setMemberMedia`) | 멤버 카드에서 이미지/동영상 촬영·선택 | asset → `{ uri, type }` 반환 | `POST /api/rooms/:roomId/members/:memberId/media` (multipart) | `FormData { file: { uri, name, type } }` | `{ media: { uri, type } }` |
| 9 | (재사용) `fetchRoomDetail`의 `room` | 방 화면 "상세" 버튼 탭 → `RoomDetailModal` | 이미 로드된 `currentRoom` 사용 | `GET /api/rooms/:roomId` (또는 캐시) | `roomId` | `Room` |
| 10 | 설정 화면 (`app/settings.js`) | 프로필 표시 / 로그아웃 / 알림 토글 | `authStore.user` 표시, `logout()` 로컬 처리, 알림은 로컬 state | `GET /api/me`, `PATCH /api/me`, `POST /api/auth/logout`, `PATCH /api/me/notifications` | 변경 필드 | `{ user }` / `{ success }` |
| 11 | 패널티 정보 | 방 화면 하단 배너 / 상세 모달 | `Room.penalty` 필드 사용(별도 호출 없음) | `GET /api/rooms/:roomId`에 포함 | `roomId` | `Room.penalty: string` |

---

## 4. 상태관리 (zustand) 구조

### `src/store/authStore.js`
| 종류 | 이름 | 설명 | 사용 컴포넌트 |
|---|---|---|---|
| state | `user` | 로그인 사용자 `{id, username, nickname, email, avatar}` | `index.js`, `settings.js`, `room/[roomId].js` |
| state | `token` | 인증 토큰 (mock) | (향후 API 헤더) |
| state | `isAuthenticated` | 로그인 여부 | `app/_layout.js` (라우팅 분기) |
| state | `loading` / `error` | 요청 중/에러 | `login.js`, `signup.js` |
| action | `login(username, password)` | 로그인 → 성공 시 `isAuthenticated=true` | `login.js` |
| action | `signup(payload)` | 회원가입 → 자동 로그인 | `signup.js` |
| action | `logout()` | 상태 초기화 | `settings.js` |
| action | `clearError()` | 에러 초기화 | - |

### `src/store/roomStore.js`
| 종류 | 이름 | 설명 | 사용 컴포넌트 |
|---|---|---|---|
| state | `rooms` | 홈 방 리스트 | `index.js` |
| state | `loading` / `refreshing` | 로딩/새로고침 | `index.js` |
| state | `currentRoom` | 현재 방 상세 | `room/[roomId].js`, `RoomDetailModal` |
| state | `members` | 현재 방 멤버 목록 | `room/[roomId].js` → `MemberCard` |
| state | `detailLoading` | 상세 로딩 | `room/[roomId].js` |
| state | `joinedRooms` | `roomId → boolean` (입장 여부) | `room/[roomId].js` (처음/이후 분기) |
| action | `loadRooms()` / `refreshRooms()` | 방 리스트 조회 | `index.js` |
| action | `addRoom(form)` | 방 생성 후 리스트 추가 | `index.js`(CreateRoomModal) |
| action | `loadRoomDetail(roomId)` | 방+멤버 조회 | `room/[roomId].js` |
| action | `joinRoom(roomId, goal)` | 목표 등록 + 입장 처리 | `room/[roomId].js` |
| action | `setMemberMedia(roomId, memberId, asset)` | 미디어 업로드 반영 | `MediaUploader` 경유 |

---

## 5. Mock 데이터 구조

> 이 스키마들이 **향후 실제 API 응답 형태의 기준**이 됩니다.

### `src/mocks/users.js` — User
| 필드 | 타입 | 예시 |
|---|---|---|
| `id` | string | `'u1'` |
| `username` | string | `'gildong'` |
| `password` | string | `'1234'` (mock 전용, 실제 응답엔 미포함) |
| `nickname` | string | `'홍길동'` |
| `email` | string | `'gildong@example.com'` |
| `avatar` | string(URL) | `'https://i.pravatar.cc/150?img=12'` |

`currentUser` = `mockUsers[0]` (방 생성/목표 등록 시 "나"로 사용)

### `src/mocks/rooms.js` — Room
| 필드 | 타입 | 예시 |
|---|---|---|
| `id` | string | `'r1'` |
| `title` | string | `'아침 6시 기상 챌린지'` |
| `description` | string | `'한 달 동안 매일...'` |
| `startAt` | string(ISO) | `'2026-06-01T06:00:00.000Z'` |
| `endAt` | string(ISO) | `'2026-06-30T23:59:59.000Z'` |
| `penalty` | string | `'미인증 시 벌금 10,000원'` |
| `memberCount` | number | `4` |
| `members` | Avatar[] | `[{ id, nickname, avatar }]` |

`penaltyPresets: string[]` — 방 추가 모달의 패널티 프리셋

### `src/mocks/members.js` — `mockRoomMembers: { [roomId]: RoomMember[] }`
| 필드 | 타입 | 예시 |
|---|---|---|
| `id` | string | `'rm1'` |
| `userId` | string | `'u1'` |
| `nickname` | string | `'홍길동'` |
| `avatar` | string(URL) | `'https://...'` |
| `goal` | string | `'매일 아침 6시에...'` |
| `media` | `{ uri, type } \| null` | `{ uri:'https://...', type:'image' }` |

Media.type: `'image' | 'video'`

---

## 6. 향후 실제 API 연동 시 가이드

### 6-1. 교체 대상 파일
실제 API로 바꿀 때 건드릴 파일은 **`src/api/` 폴더뿐**입니다. 화면/스토어는 그대로 둡니다.

1. **`src/api/client.js`** — mock 헬퍼를 실제 HTTP 클라이언트로 교체 (핵심)
2. `src/api/auth.js`, `rooms.js`, `members.js` — `mockResponse(...)` 호출부를 `request(...)`로 변경
3. (선택) `src/mocks/*` 는 더 이상 import하지 않게 되면 삭제

### 6-2. 통신 레이어 교체 예시
`src/api/client.js`:
```js
const BASE_URL = 'https://api.jagsim3il.com';
let authToken = null;
export const setToken = (t) => { authToken = t; };

export async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json()).message ?? '요청 실패');
  return res.json();
}
```

그러면 예컨대 `src/api/auth.js`는 이렇게 바뀝니다:
```js
import { request } from './client';
export const loginRequest = (body) => request('POST', '/api/auth/login', body);
```

### 6-3. 이미지/동영상 업로드 (expo-image-picker → FormData)
`MediaUploader`는 선택 결과를 `{ uri, type, fileName, mimeType }` 형태로 넘깁니다.
실제 업로드 시 `src/api/members.js`의 `uploadMedia`를 아래처럼 작성하면 됩니다:

```js
export async function uploadMedia(roomId, memberId, asset) {
  const form = new FormData();
  const name = asset.fileName ?? `upload.${asset.type === 'video' ? 'mp4' : 'jpg'}`;
  const mime = asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');

  form.append('file', {
    uri: asset.uri,      // expo-image-picker가 준 로컬 uri
    name,
    type: mime,
  });

  const res = await fetch(`${BASE_URL}/api/rooms/${roomId}/members/${memberId}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }, // Content-Type은 지정하지 않음(자동 boundary)
    body: form,
  });
  return res.json(); // { media: { uri, type } }
}
```

---

## 부록 · 실행 방법

```bash
npm install          # 의존성 설치 (최초 1회)
npx expo start       # 개발 서버 실행

# 시뮬레이터/디바이스에서 열기
#  i  → iOS 시뮬레이터
#  a  → Android 에뮬레이터
#  또는 Expo Go 앱으로 QR 스캔
```

테스트 로그인 계정: **gildong / 1234** (`src/mocks/users.js`)

> 참고: 카메라/갤러리 기능은 시뮬레이터보다 실제 디바이스(Expo Go 또는 dev build)에서 정상 동작합니다.
> 권한 문구는 `app.json`의 `expo-image-picker`/`expo-camera` 플러그인에 한국어로 설정되어 있습니다.


fontsize
  title: 3xl
  subTitle: 2xl
  mainText: xl
  subText: lg
  button: lg