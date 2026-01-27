# INTEGRAL MVP - 개발 가이드

## 프로젝트 개요

- **프로젝트명**: INTEGRAL
- **목적**: 제주 물류 공유 플랫폼 - 공간과 경로를 상품화하는 공유 물류 서비스
- **버전**: MVP v3.0 (설득용 시연 목적)

> **핵심**: 투자자/이해관계자에게 3-5분 내 서비스 가치를 전달하는 프로토타입
> 백엔드/데이터베이스 없음, 모든 데이터는 mockData 기반

---

## 기술 스택

- **프레임워크**: Vite + React + TypeScript
- **스타일링**: Tailwind CSS
- **지도**: Mapbox GL JS (light-v11)
- **폰트**: Pretendard (메인), Inter (숫자)

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

---

## 핵심 설계 원칙

1. **직관성 우선** - 별도 설명 없이 화면만으로 서비스 이해 가능
2. **지도 중심 UI** - 모든 가치는 지도에서 시각적으로 전달
3. **싱글 페이지 구조** - 별도 라우팅 없이 모달로 모든 정보 접근
4. **더미 데이터 기반** - 백엔드 없음, 모든 데이터는 mockData에서 관리
5. **룰 기반 로직** - 복잡한 알고리즘 대신 단순 조건문 기반

---

## 통합 엔진 설계 (불변 규칙)

### Cube 단일 내부 계산 단위

```
┌─────────────────────────────────────────────────────────┐
│  Cube = 250×250×250mm (0.015625 m³)                    │
│  - 모든 내부 계산의 유일한 단위                          │
│  - Pallet은 검색/매칭 기준에 사용하지 않음               │
└─────────────────────────────────────────────────────────┘
```

### 환산 비율

| 관계 | 비율 |
|------|------|
| 1 Pallet = N Cubes | **cubesPerPallet = 128** |
| 1 Pallet 바닥면적 | 1.21 m² (1.1m × 1.1m) |
| 1 Pallet 체적 | 2.178 m³ (1.1 × 1.1 × 1.8m) |

### 거래 단위

| 서비스 | 거래 단위 | 내부 계산 단위 |
|--------|----------|---------------|
| 보관 (Storage) | **Pallet** | Cube |
| 운송 (Route) | **Cube** | Cube |

### 포장 모듈의 역할

```
┌─────────────────────────────────────────────────────────┐
│  포장 모듈 = "형상 검증 + 표준 분류" (계산 중심 아님)     │
│  - 소형(8분할): 550×275mm                               │
│  - 중형(6분할): 550×366mm                               │
│  - 대형(4분할): 650×450mm                               │
│  - 분류 버퍼: ±10mm (절대값), 90도 회전 허용            │
└─────────────────────────────────────────────────────────┘
```

---

## Code Data System (Local-first)

플랫폼의 두 번째 핵심 축. "선 규정, 후 거래" 원칙을 데이터 구조로 구현.

### 데이터 분류

| 분류 | 타입 | 역할 |
|------|------|------|
| Info Data | `CargoInfo`, `DemandSession` | 정보 저장 (CRUD 가능) |
| Event Data | `PlatformEvent` | 사건 기록 (append-only) |

### 플랫폼 표준 코드셋

| 코드 | 범위 | 용도 |
|------|------|------|
| ItemCode | IC01~IC99 | 품목 분류 (일반잡화, 농수산물 등) |
| WeightBand | WBX/WBY/WBZ/WBH | 중량대 (5kg/10kg/20kg/초과) |
| SizeBand | SB1~SBX | 크기대 (3변합 기준) |

### 핵심 플로우

```
CargoInfo 생성 → signature 부여 → 규정 체크 → DemandSession 연결 → 큐브 계산 → 자원 준비
```

### 이벤트 로그 (append-only)

모든 플랫폼 행위는 이벤트로 기록:
- `CARGO_CREATED`, `CARGO_SIGNATURE_UPDATED`, `CARGO_REMOVED`
- `RULE_CHECKED`, `RULES_PASSED`
- `QUANTITY_SET`, `CUBE_CALCULATED`, `RESOURCE_READY`
- `STORAGE_*`, `TRANSPORT_*`, `SEARCH_EXECUTED`

### 저장소 구조

| 파일 | 역할 |
|------|------|
| `store/cargoStore.ts` | CargoInfo CRUD |
| `store/demandStore.ts` | DemandSession 관리 |
| `store/eventLog.ts` | 이벤트 기록/조회 |
| `store/id.ts` | ULID 스타일 ID 생성 |
| `engine/rules/ruleCheck.ts` | MVP 규정 체크 (크기/중량/제한품목) |

---

## 프로젝트 구조

```
src/
├── engine/                    # 플랫폼 통합 엔진 (순수 함수만)
│   ├── rules/                # 규정 체크 로직
│   └── regulation/           # PR4: 규정 엔진 (상품 필터링)
├── store/                     # Code Data System (localStorage 기반)
├── contexts/                  # PR4: React Context
│   └── SearchResultContext   # 검색 결과 공유 (ServiceConsole ↔ Map)
├── data/
│   ├── mockData.ts           # 더미 데이터 (상품별 규정 필드 포함)
│   ├── itemCodes.ts          # 플랫폼 품목 코드 (IC01~IC99)
│   └── bands.ts              # 중량/크기 밴드 정의
├── components/
│   ├── Layout/
│   │   ├── CommandLayout.tsx # 지도 하이라이트 마커 연동
│   │   └── ServiceConsole/   # 3행 그리드 레이아웃 UI
│   │       ├── ServiceConsole.tsx
│   │       ├── sections/     # StorageTab, TransportTab, BothTab
│   │       ├── ui/           # GridCell, InputModal, SearchResultModal, ResetButton 등
│   │       └── hooks/        # useServiceConsoleState
│   ├── Map/MapboxContainer/
│   │   └── utils/style.ts    # 마커 스타일 (하이라이트 마커 포함)
│   └── ...
├── types/models.ts           # 상품 모델 (규정 필드 포함)
└── styles/fonts.css
```

---

## Regulation Engine (PR4)

화물 정보 기반으로 상품을 필터링하는 규정 엔진.

### 핵심 규정 (4가지)

| 규정 | 필드 | 설명 |
|------|------|------|
| 크기 제한 | `maxSumCm` | 3변합 초과 시 제외 |
| 중량 제한 | `maxWeightKg` | 중량 초과 시 제외 |
| 품목 제한 | `allowedItemCodes` | 허용 품목 외 제외 |
| 최소 물량 | `minCubes` | 최소 큐브 미달 시 제외 |

### 선택적 플래그

| 플래그 | 설명 |
|--------|------|
| `tempSupported` | 온도 관리 필요 화물 지원 여부 |
| `hazmatSupported` | 위험물 지원 여부 |
| `allowedModuleClasses` | 허용 포장 모듈 클래스 |

### 주요 함수 (`engine/regulation/`)

```typescript
checkRegulation(cargo, offer) → RegulationDecision  // 단일 화물-상품 규정 체크
filterOffersByRegulation(cargos, offers) → FilterResult  // 전체 필터링
adaptCargoForRegulation(registeredCargo) → CargoForRegulation  // UI→엔진 변환
```

### 지도 연동

- **실시간 필터링**: 화물 등록 시 즉시 지도에 반영
- **하이라이트 마커**: 구매 가능 상품에 물방울 마커 + 연두색 O 표시
- **SearchResultContext**: ServiceConsole ↔ Map 간 검색 결과 공유

---

## Service Console UI 구조 규칙 (MVP 기준)

### 1. UI 설계 목적

Service Console UI는 단순 입력 화면이 아니라,
플랫폼의 **정보 데이터 수집 흐름**과 **이벤트 조건 필터링 흐름**을
시각적으로 드러내는 구조로 설계한다.

입력 순서는 곧 플랫폼 데이터 처리 순서와 동일해야 한다.

### 2. 탭 내부 레이아웃 원칙 (고정 규칙)

탭 내부는 **스크롤 없이 한 화면에 조건이 모두 보이도록 구성**한다.
입력 영역은 항상 3행 그리드 구조를 유지한다.

#### ▸ 3행 구조

**1행 (2열)**
- 좌측: 화물 정보
- 우측: 물량 정보 (큐브/파레트 환산 결과와 연결)

**2행**
- 보관 탭: 보관 장소
- 운송 탭: 출발지 ↔ 도착지
- 보관+운송 탭: 단계 순서에 따라 동일 구조 재사용

**3행**
- 보관 탭: 시작일 / 종료일
- 운송 탭: 운송 날짜

이 구조는 기능 추가 시에도 유지되며, 행 순서는 변경하지 않는다.

### 3. 화물 영역 설계 규칙

화물 입력은 플랫폼 정보 데이터의 시작점이다.

- 화물 추가 버튼은 항상 노출
- 등록된 화물은 요약 카드 형태로 표시
- 카드 단위 삭제 가능
- 화물 수가 많을 경우 기본 화면은 요약 중심, 확장은 내부 처리

화물 정보 → 이후 모든 필터링의 기준이 되므로 UI에서 가장 먼저 배치한다.

### 4. 색상 및 시각 스타일 원칙

탭별 색상 구분은 사용하지 않는다.
Service Console 전체 톤은 **Neutral/Black 기반, 상징 컬러 navy blue**로 통일한다.

| 요소 | 컬러 |
|------|------|
| 헤더 로고 INTEGRAL | `text-blue-900` |
| 탭 Active | `text-blue-900`, `border-blue-900` |
| 검색 버튼 | `from-blue-800 to-blue-900` |
| 모달 헤더 | `bg-blue-900` |
| 확인 버튼 | `bg-blue-900 hover:bg-blue-950` |
| 쌍방향 화살표 | `text-blue-900` |

### 5. UI와 엔진의 관계

이 UI는 단순 폼이 아니라:

- **1행**: 정보 데이터 입력
- **2~3행**: 이벤트 조건 입력
- **하단 검색 버튼**: 조건 확정 트리거

라는 **플랫폼 운영 구조를 시각화한 화면**이다.

UI 변경 시:
플랫폼 통합 거래 엔진(큐브 단위 계산)과
플랫폼 운영 프로세스(데이터 수집 구조)를
훼손하지 않도록 설계해야 한다.

---

## 디자인 시스템

### 지도 요소

| 요소 | 색상 |
|------|------|
| 지도 배경 | Mapbox light-v11 |
| 공간 상품 마커 | #ff6b35 (주황색) |
| 도내 경로 | #3b82f6 (파란색, 실선) |
| 입도 경로 | #10b981 (녹색, 점선) |
| 출도 경로 | #a855f7 (보라색, 점선) |
| 구매 가능 하이라이트 | #1e40af (물방울) + #22c55e (연두색 O) |

---

## 제약사항

### 절대 구현하지 말 것
- 로그인/회원가입, 실제 결제, 백엔드/DB
- 별도 페이지 라우팅, 실시간 데이터, 실제 거래

### 허용되는 범위
- 더미 데이터 기반 UI, 모달 상세, 룰 기반 매칭, 더미 비용 계산

---

## 코드 컨벤션 (PR3-2.5 확정)

> **중요**: 코드 컨벤션 내용은 문서 업데이트 시에도 **절대 삭제하면 안된다**

### 폴더 및 책임 규칙

| 위치 | 용도 |
|------|------|
| `components/common/` | 공용 컴포넌트 (2곳 이상 사용, 도메인 무관) |
| `{feature}/ui/` | Feature 내부 UI 컴포넌트 |
| `{feature}/sections/` | 화면 섹션 단위 구성 |
| `{feature}/hooks/` | 상태/로직 훅 |
| `{feature}/utils/` | 변환/검증/보조 로직 |

**중요**: Feature 내부에 `components/` 폴더 생성 금지, 반드시 `ui/` 사용

### 컴포넌트 크기 가드레일

- 조립(컨테이너) 컴포넌트: 200줄 목표
- 단일 컴포넌트: 최대 300줄 초과 금지
- 300줄 초과 시 `sections/` 또는 `ui/`로 분리

### UI / 로직 / 계산 분리 원칙

- JSX 내부에서 계산/변환 로직 작성 금지
- 계산/변환은 `engine/` 또는 `utils/`에서 수행
- 상태 및 핸들러는 `hooks/`로 분리
- `engine/`에는 순수 함수만 허용 (React import 금지)

### 타입 정책

| 타입 종류 | 위치 |
|----------|------|
| UI / 입력 / 상품 모델 | `types/models.ts` |
| 엔진 / 매칭 도메인 | `engine/matchingTypes.ts` |
| UI ↔ 엔진 변환 | `utils/`에서 담당 |

### 확장 대비 가드레일

**탭 섹션 비대화 방지**
- `sections/`의 탭 컴포넌트는 조립/분기 역할만 수행
- 내부 로직/폼/UI는 `ui/` 또는 더 작은 섹션으로 분리

**상태 훅 비대화 방지**
- 상태 훅은 단일 진실 소스 역할만 수행
- 계산/파생 로직은 `utils/` 또는 `engine/`으로 이동
- 상태가 커질 경우 slice 개념으로 분리 훅 추가 허용

**검증 로직 분산 금지**
- 입력/조건 검증 로직은 `utils/`의 validation 파일로 집중
- UI 컴포넌트에 검증 로직 분산 작성 금지

### 작업 청소 규칙

작업 종료 시 반드시 수행:
- 미사용 파일/컴포넌트 삭제
- 미사용 export 제거
- dead code 제거
- import 정리

---

## PR 로드맵

| PR | 내용 | 상태 |
|----|------|------|
| PR1~PR3-2.5 | 초기 설정, UI 개편, 통합 엔진, 구조 리팩토링 | ✅ 완료 |
| PR3-3 | ServiceConsole 3행 그리드 UI + Navy blue 통일 | ✅ 완료 |
| PR3-4 | Code Data System MVP (Local-first / 규정→자원 플로우) | ✅ 완료 |
| PR4 | Regulation Engine + 검색/지도 연동 | ✅ 완료 |
| PR5 | 거래 모달 + 규정 매칭 | 📋 예정 |
| PR6 | 마무리 + 최적화 | 📋 예정 |

---

**최종 수정**: 2025.01.27 (PR4 Regulation Engine + 검색/지도 연동 완료)
