jagsim3il이라는 Expo + React Native 프로젝트의 모바일 앱 프론트엔드를 만들어줘.
백엔드/API는 아직 없으니 모든 데이터는 mock 데이터와 컴포넌트 state(또는 zustand 같은 가벼운 상태관리)로 처리하고,
나중에 실제 API로 교체하기 쉽게 데이터 fetching 로직은 별도 함수/훅으로 분리해줘.

# 기술 스택
- Expo (managed workflow, 최신 SDK) + React Native (JavaScript, TypeScript 아님)
- expo-router (파일 기반 라우팅)
- NativeWind (Tailwind CSS 문법을 React Native에서 사용)
- 상태관리: zustand 사용 (간단하게)
- 아이콘: lucide-react-native (또는 @expo/vector-icons)
- 날짜/시간 선택: @react-native-community/datetimepicker
- 이미지/동영상 촬영 및 업로드: expo-image-picker, expo-camera
- 안전영역 처리: react-native-safe-area-context

# 전체 화면 구성

## 1. 로그인 화면 (app/login.js)
- 아이디 입력 필드 (TextInput)
- 비밀번호 입력 필드 (TextInput, secureTextEntry)
- 로그인 버튼
- 회원가입 화면으로 이동하는 버튼/링크
- 기본적인 입력 유효성 검사 (빈 값 체크) 및 에러 메시지 표시
- 키보드 노출 시 레이아웃 깨짐 방지 (KeyboardAvoidingView 적용)

## 2. 회원가입 화면 (app/signup.js)
- 아이디 입력
- 닉네임 입력
- 이메일 입력
- 비밀번호 입력
- 비밀번호 확인 입력 (일치 여부 검증)
- 약관 동의 체크박스 (커스텀 Pressable 기반 체크박스)
- 로그인 화면으로 이동하는 버튼/링크
- 유효성 검사: 필수값 체크, 이메일 형식, 비밀번호 일치 여부, 약관 미동의 시 가입 버튼 비활성화
- 키보드 노출 시 레이아웃 깨짐 방지 (KeyboardAvoidingView, ScrollView 적용)

## 3. 홈 화면 (app/index.js)
- Header (SafeAreaView 상단)
  - 서비스명 로고/텍스트
  - Room 추가 버튼 (탭 시 room 추가 모달 오픈)
  - 설정 화면 이동 버튼
- Body
  - 내가 참여 중인 방 리스트 (FlatList 기반 카드 리스트)
    - 각 카드: 방 제목, 타이틀(설명), 참여 중인 멤버 아바타/목록
    - 카드 탭 시 해당 방 화면(app/room/[roomId].js)으로 이동
  - pull-to-refresh 적용 (RefreshControl)

## 4. Room 추가 모달 (홈 화면에서 오픈되는 모달 컴포넌트, expo-router의 모달 라우트 또는 Modal 컴포넌트로 구현)
- 시작 날짜 및 시간 설정 (DateTimePicker)
- 종료 날짜 및 시간 설정 (DateTimePicker)
- 패널티 설정 (텍스트 입력 또는 프리셋 선택)
- 생성 버튼 탭 시 mock으로 방 리스트에 추가하고 모달 닫기

## 5. 방 화면 (app/room/[roomId].js)
이 화면은 "처음 입장"과 "이후 입장" 두 가지 상태를 분기해서 보여줘야 해.
mock 상태값(예: hasJoined boolean)으로 분기 처리.

### 5-1. 처음 입장 시 (목표 설정 화면)
- 종료 기한까지 수행할 목표를 입력하는 폼 (TextInput, multiline)
- 입력 후 "입장하기" 버튼 탭 시 이후 입장 화면으로 전환

### 5-2. 이후 입장 시 (메인 방 화면)
- Header
  - 방 이름
  - 상세 버튼 (탭 시 방 정보 상세 모달로 이동 - 간단한 Modal 컴포넌트로 처리)
- Body
  - 멤버 카드 리스트 (FlatList 또는 ScrollView 기반 그리드)
    - 각 멤버 카드 구성:
      - 상단: 닉네임 (작게, low 스타일 - 작은 폰트/연한 색상)
      - 그 아래: 멤버가 설정한 목표 텍스트
      - 하단: 이미지/동영상 업로드 또는 촬영 영역
        - expo-image-picker를 활용한 갤러리에서 이미지/동영상 선택
        - expo-camera 또는 expo-image-picker의 launchCameraAsync를 활용한 촬영 기능
        - 업로드된 파일 미리보기 표시 (Image 또는 video 컴포넌트)
- Footer
  - 이 방에 설정된 패널티를 보여주는 오버레이/배너 (화면 하단 고정, 항상 노출, SafeAreaView 하단 여백 고려)

# 공통 요구사항
- 모바일 전용 UI (iOS/Android 양쪽에서 자연스럽게 동작하도록)
- expo-router 기반 파일 시스템 라우팅으로 구조를 명확히 잡아줘 (/login, /signup, /(홈), /room/[roomId], /settings)
- 인증 여부에 따른 라우팅 분기 (비로그인 시 로그인 화면으로 리다이렉트)
- 컴포넌트는 기능 단위로 분리 (예: components/RoomCard, components/MemberCard, components/CreateRoomModal 등)
- mock 데이터는 src/mocks 디렉토리에 분리
- NativeWind(Tailwind 문법)를 활용해 깔끔하고 현대적인 느낌으로 스타일링 (둥근 모서리, 그림자, 여백 적절히 활용)
- 카메라/갤러리 접근에 필요한 권한 요청 처리 (expo-image-picker, expo-camera의 권한 API 사용)
- 모든 텍스트는 한국어로 작성

# 작업 순서 제안
1. 프로젝트 초기 세팅 (Expo + expo-router + NativeWind + zustand + 필요한 expo 패키지 설치)
2. 라우팅 구조 및 폴더 구조 설계 (app 디렉토리 기준)
3. mock 데이터 설계 (user, room, member)
4. 로그인/회원가입 화면 구현
5. 홈 화면 + Room 추가 모달 구현
6. 방 화면 (처음 입장 / 이후 입장 분기) 구현, 이미지/동영상 업로드 및 촬영 기능 포함
7. iOS/Android 시뮬레이터에서 레이아웃 및 안전영역 점검
8. 코드 분석 문서 작성 (.md)

각 단계마다 만든 컴포넌트/화면을 간단히 설명해주고, 전체 작업이 끝나면 실행 방법(npx expo start)도 알려줘.

# 8. 코드 분석 문서 작성 (.md)
모든 구현이 끝난 후, 프로젝트 루트에 ARCHITECTURE.md 파일을 작성해줘.
실제 코드를 다시 분석해서 아래 내용을 빠짐없이, 정확하게 기록해줘 (추측 말고 실제 작성된 코드 기준으로).

## 문서에 포함할 내용

### 1. 프로젝트 구조
- 폴더/파일 트리와 각 폴더의 역할

### 2. 화면 및 라우팅 맵
- expo-router 기준 각 라우트 경로(app 디렉토리 파일 경로) - 어떤 컴포넌트 - 주요 역할

### 3. 서버 통신 지점 전체 목록 (가장 중요)
현재는 mock 데이터로 동작하지만, 실제 백엔드 연동 시 API 호출이 필요한 모든 지점을 빠짐없이 표로 정리해줘.
각 항목마다 아래 정보를 포함:
- 위치 (파일 경로 + 함수/컴포넌트명)
- 트리거 시점 (예: "로그인 버튼 클릭 시", "방 카드 진입 시")
- 현재 mock 처리 방식 (어떤 함수가 mock 데이터를 반환하는지)
- 예상 API 역할 (예: "POST /api/auth/login - 아이디/비밀번호 검증 후 토큰 발급")
- 요청 시 필요한 데이터 (request body/params 예시)
- 응답으로 기대하는 데이터 형태 (response 예시)

다음 동작들은 반드시 위 표에 포함되어야 해:
- 로그인 요청
- 회원가입 요청
- 아이디 중복 확인 (있다면)
- 홈 화면 진입 시 참여 중인 방 리스트 조회
- Room 추가(생성) 요청
- 방 화면 진입 시 방 정보 및 멤버 리스트 조회
- 처음 입장 시 목표 입력 후 제출(방 참여 등록)
- 멤버 카드에서 이미지/동영상 업로드
- 방 상세 정보 조회 (상세 버튼 탭 시)
- 설정 화면 관련 조회/변경 동작
- 패널티 정보 조회

### 4. 상태관리(zustand) 구조
- store별로 어떤 state와 action을 가지고 있는지
- 각 state가 어느 컴포넌트에서 사용되는지

### 5. Mock 데이터 구조
- src/mocks 내 각 mock 파일의 데이터 스키마(필드명, 타입, 예시 값)
- 이 스키마가 향후 실제 API 응답 형태의 기준이 되어야 함을 명시

### 6. 향후 실제 API 연동 시 가이드
- 어떤 파일들을 수정해야 mock → 실제 API로 쉽게 교체할 수 있는지
- fetch/axios 등 통신 레이어를 어디에 위치시켰는지, 어떻게 교체하면 되는지 간단한 예시 코드 포함
- 이미지/동영상 업로드 시 expo-image-picker 결과물(uri, type 등)을 FormData로 변환해 실제 업로드 요청을 보내는 방법 예시 포함

표와 코드 블록을 적극적으로 활용해서 한눈에 보기 쉽게 작성해줘. 한국어로 작성해줘.