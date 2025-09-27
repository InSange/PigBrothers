# Pig Brothers Project Brief

## 프로젝트 한눈에 보기
토론 기반 소셜 디덕션 게임 **Pig Brothers**는 소규모 매장에서 바로 플레이할 수 있는 멀티 플랫폼 웹 앱입니다. 방 생성부터 게임 진행, 라운드 승패까지를 하나의 코드베이스에서 처리하며, 실시간 WebSocket 파이프라인과 Firebase를 활용해 단말 간 상태를 즉시 동기화합니다. POS 단말 같은 제약 환경에서도 안정적인 경험을 제공하는 것이 목표입니다.

## 내가 리드한 핵심 가치
- **실시간 세션 관리**: `frontend/app/room/[roomId]/_related/ChatProvider.tsx`의 컨텍스트로 연결·재연결·에러를 포괄하는 WebSocket 라이프사이클을 제어하고, 투표·암살 같은 게임 액션을 서버 상태에 맞춰 안전하게 오케스트레이션했습니다.
- **도메인 추상화**: 서버 → 클라이언트 스트림을 `process`, `state`, `role` 타입으로 세분화(`frontend/app/room/[roomId]/_related/type.ts`)해 복잡한 게임 규칙도 유지보수가 쉬운 모델로 정리했습니다.
- **신뢰도 높은 API 계층**: Swagger 생성 API 래퍼 위에 인증/타임존 인터셉터를 얹은 `apiClient`와 React Query 캐시(`frontend/types/apiClient.ts`, `frontend/app/api/room/room.api.ts`)로 멀티 디바이스 환경에서도 안정적인 데이터 흐름을 보장했습니다.
- **SSR/CSR 전환 최적화**: `frontend/lib/styled-components-registry.tsx`로 Next 13 환경에서 styled-components 플래시를 제거하고, `frontend/app/GlobalContext.tsx`로 사용자 세션을 로컬 스토리지와 동기화하여 하이드레이션 이슈를 해소했습니다.

## 주요 기능 요약
- 방 목록 조회 및 생성, UUID 기반 초대 링크 라우팅(`frontend/app/room/_sections/CreateRoomButton.tsx`).
- 플레이어 목록/역할/사망 상태 렌더링과 권한 기반 UI 가드(`frontend/app/room/[roomId]/_sections/UserComponent.tsx`).
- 단계별 UI 전환 (낮/투표/밤)과 게임 제시어 모달, 타이머 헤더(`frontend/app/room/[roomId]/page.tsx`, `frontend/app/_components/Header.tsx`).
- 실시간 채팅·시스템 알림 스트림, 발언권에 따라 전송 버튼 자동 제어(`frontend/app/room/[roomId]/_sections/Chatting.tsx`, `ChattingInput.tsx`).

## 기술 스택
| 구분 | 사용 기술 | 적용 포인트 |
| --- | --- | --- |
| 프런트엔드 | Next.js 13(App Router), React 18, TypeScript, styled-components 6, @tanstack/react-query 5, notistack | 서버/클라이언트 경계 명확화, 실시간 UI, 토스트 피드백 |
| 백엔드 | FastAPI, WebSocket, Firebase Firestore & Realtime DB, asyncio | 방 상태 관리, 라운드 진행, 주제어 배포, 실시간 브로드캐스트 |
| 인프라 & 기타 | Swagger TypeScript API, Axios, Docker | 타입 안전한 API 클라이언트, 로컬 개발 컨테이너 |

## 설계 & 아키텍처 하이라이트
- **WebSocket Game Loop**: `backend/main.py`의 `Game` 클래스가 낮/투표/밤 단계를 비동기 루프로 관리하며, `Process`, `GameInfo`, `Alert` 메시지를 브로드캐스트해 프런트 상태와 동기화합니다.
- **Context-Driven UI**: GlobalContext로 사용자/방 이름을 전역화하고, ChatContext로 실시간 이벤트를 하위 섹션에 주입해 화면 간 prop drilling 없이도 상태 공유를 유지합니다.
- **타입 세이프 API**: `swagger-typescript-api`로 생성한 타입(`frontend/types/Api.ts`)을 기반으로 Query Hook을 래핑해, 서버 스키마 변경에 따른 런타임 오류를 컴파일 단계에서 방지했습니다.
- **디자인 시스템화**: `GlobalStyle`, `Button`, `TextField` 등을 테마 프로바이더로 묶어 단일 테마에서 다크/라이트와 상태별 스타일을 일관되게 제어했습니다.

## 아키텍처 설계 관점 (JD Alignment)
- **App Router 기반 SPA 셸 구성**: `frontend/app/layout.tsx:1`에서 SSR 초기 렌더 후 `StyledComponentsRegistry → GlobalContextProvider → SnackLib → ApiProvider → ClientLayout` 순으로 감싸 단일 페이지 내에서 글로벌 상태, 알림, 캐싱을 공유하면서도 첫 진입은 SSR로 빠르게 제공합니다.
- **도메인 중심 Context 경계**: 사용자 세션은 `frontend/app/GlobalContext.tsx:1`, 실시간 룸 상태는 `frontend/app/room/[roomId]/_related/ChatProvider.tsx:59`로 분리해 SPA 내에서 책임을 명확히 나누고, 하위 섹션은 필요한 컨텍스트만 구독하게 했습니다.
- **정적 타입 모델링**: WebSocket 이벤트 스펙을 `frontend/app/room/[roomId]/_related/type.ts:3`의 유니온 타입으로 정의하고, 서버 API는 `frontend/types/Api.ts:240`에서 자동 생성된 제네릭을 통해 안전하게 호출해 TypeScript 기반 정적 검증을 강화했습니다.
- **상태 동기화 전략**: React Query는 룸 리스트와 유저 정보처럼 서버 캐시가 필요한 데이터에 적용(`frontend/app/api/room/hooks/useQueryRoom.ts:5`), WebSocket 실시간 스트림은 컨텍스트 상태로 관리하며 두 레이어가 충돌하지 않도록 설계했습니다.
- **문제 선제 발견 & 보호 로직**: `frontend/app/room/[roomId]/_sections/UserComponent.tsx:14`에서 게임 단계·역할 조합을 가드 로직으로 캡슐화해 불법 액션을 UI 층에서 차단, 서버 사이드 예외 발생 전 문제를 해소했습니다.
- **운영 자동화 파이프라인**: `frontend/package.json:4`의 `swagger` 스크립트로 OpenAPI 스펙을 재생성하면 즉시 타입/훅이 업데이트되어, 사양 변경 시 개발자가 주도적으로 스키마 일관성을 유지할 수 있습니다.

## 데이터 파이프라인 & 운영 안정성
- **Firebase 이중 스토리지 전략**: 라운드 진행 내역과 룸 메타데이터는 Realtime DB에, 주제어 풀은 Firestore에 분리 저장(`backend/main.py`, `firebase_config.py`). 덕분에 채팅은 저지연으로, 게임 리소스는 캐시 가능하게 운용했습니다.
- **API-UI 일관성 확보**: `npm run swagger` 명령으로 최신 OpenAPI 스키마를 타입으로 재생성하고(`frontend/package.json`), `frontend/types/Api.ts`와 React Query 훅을 자동 재빌드하여 서버 스펙 변경 시 회귀 리스크를 최소화했습니다.
- **룸 수명주기 관리**: 시작/종료/참가/탈주 각각을 전용 엔드포인트로 나눠(`backend/main.py:929`, `:967`, `:988`, `:1030`) 상태를 명시적으로 갱신하고, 클라이언트에서도 동일한 뮤테이션 훅으로 대응해 레이스 컨디션을 줄였습니다.
- **컨테이너 기반 로컬 운영**: FastAPI 백엔드를 Dockerfile로 패키징하고 Firebase Admin, WebSocket 의존성을 이미지에 포함해 온보딩 시간을 단축했습니다.

## 트러블슈팅 & 인사이트
- **SSR 시 스타일 플래시**: Next 13 App Router에서 styled-components 6가 두 번 렌더링되며 스타일이 사라지는 이슈가 있어, `StyledComponentsRegistry` 안에서 `useServerInsertedHTML`과 `ServerStyleSheet`를 수동 관리해 문제를 해결했습니다.
- **WebSocket 재연결 문제**: 브라우저에서 탭 전환 시 연결이 닫히는 문제를 `ChatProvider`의 `wsRef`와 `isConnecting` 가드로 재접속을 방지/제어하면서 해결했습니다. 실패 시 notistack 토스트로 사용자에게 즉시 알렸습니다.
- **권한 없는 액션 차단**: 밤 단계에서 일반 유저가 암살 버튼을 눌러 서버에 잘못된 명령이 가는 문제를 경험했고, `canKill`/`canVote` 계산 로직으로 UI에서 선제적으로 막아 서버 로드와 오류 로그를 줄였습니다.

## 향후 확장 아이디어
1. Firebase 토픽 컬렉션 캐싱 및 사전 로딩으로 라운드 시작 지연 최소화
2. React Query Devtools/로그 추적 파이프라인 도입으로 운영 중 인사이트 강화
3. 멀티 언어/테마 토글을 ThemeProvider 위에서 확장하여 글로벌 사용성 향상

## 이 프로젝트가 보여주는 역량
- POS·오프라인 단말 같은 특수한 환경에서도 동작하는 **실시간 프런트엔드 엔지니어링** 경험
- 복잡한 게임 규칙을 타입과 컨텍스트로 모델링해 **도메인 추상화 능력**을 입증
- Next.js + FastAPI + Firebase를 유기적으로 연결하는 **엔드투엔드 문제 해결력**

Pig Brothers에서 다룬 트러블과 설계 경험은 토스플레이스처럼 오프라인 결제 현장을 상대하는 프런트엔드 환경에서 바로 적용 가능한 역량입니다. 채널·단말을 가리지 않고 안정적인 사용자 경험을 만들 준비가 되어 있습니다.
