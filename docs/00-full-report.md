# INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서

> **작성 기준**: 현재 레포 실제 코드 (2026-02-19)
> **총 섹션**: 11개 섹션 전체 통합본

---

## 목차

| 섹션 | 주제 |
|------|------|
| [1] | 전체 프로젝트 구조 |
| [2] | UI/UX 및 사용자 흐름 분석 |
| [3] | 큐브 거래 엔진 분석 |
| [4] | Code Data System 분석 |
| [5] | 데이터 모델 / 타입 / SoT (단일 진실 소스) |
| [6] | 매칭 로직 분석 |
| [7] | 레이어 구조 (규정/자원/조건/거래) |
| [8] | 상품 등록 페이지 연결 분석 |
| [9] | 페이지 구조 및 라우팅 설계 |
| [10] | 기술 부채 및 리스크 |
| [11] | 최종 결론 |

---

# [1] 전체 프로젝트 구조 분석

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 1/11: 전체 프로젝트 구조

---

## 1-1. 요약

INTEGRAL MVP는 **Vite + React + TypeScript** 기반 싱글 페이지 애플리케이션이다. 라우팅 없이 단일 페이지에서 모든 기능을 모달/아코디언으로 처리하며, 백엔드/DB 없이 `localStorage` + `mockData`로 동작한다. 현재 PR7까지 완료된 상태로, 거래 레이어(Deal Layer)까지 구현되어 있다.

---

## 1-2. 실행 구조 (엔트리 포인트)

```
main.tsx
  └─ ReactDOM.createRoot → <React.StrictMode>
       └─ App.tsx
            └─ <SearchResultProvider>   ← PR4에서 추가 (Context)
                 └─ <CommandLayout>     ← 루트 레이아웃 컴포넌트
```

### 파일별 역할

| 파일 | 역할 | 경로 |
|------|------|------|
| `main.tsx` | React 앱 마운트 | `src/main.tsx` |
| `App.tsx` | Provider 래핑, CommandLayout 렌더링 | `src/App.tsx` |
| `CommandLayout.tsx` | 45%/55% 그리드 레이아웃, 하이라이트 마커 연동 | `src/components/Layout/CommandLayout.tsx` |

**핵심**: `SearchResultProvider`는 `App.tsx` 최상위에 존재하여 `ServiceConsole` ↔ `MapboxContainer` 양방향 데이터 공유를 가능하게 한다.

---

## 1-3. 전체 폴더 구조 및 역할

```
src/
├── main.tsx                   # 앱 엔트리
├── App.tsx                    # Root: Provider + Layout
├── index.css                  # 글로벌 CSS (Tailwind)
├── vite-env.d.ts             # Vite 환경변수 타입 선언
│
├── engine/                    # 플랫폼 통합 엔진 (순수 함수만)
│   ├── cubeConfig.ts          # Cube/Pallet 상수 정의 (불변 설정)
│   ├── cubeEngine.ts          # 박스→큐브 변환 핵심 계산기
│   ├── shapeClassifier.ts     # 포장 모듈 형상 분류 (소형/중형/대형)
│   ├── unitConvert.ts         # 단위 변환 (큐브↔파렛트)
│   ├── index.ts               # 엔진 진입점 (computeDemand export)
│   ├── rules/                 # MVP 규정 체크 (규격/중량/제한품목)
│   │   ├── ruleCheck.ts       # checkQuickRules, checkQuickRulesWithLogging
│   │   └── index.ts
│   ├── regulation/            # PR4: 규정 엔진 (상품 필터링)
│   │   ├── regulationEngine.ts # checkRegulation, filterOffersByRegulation
│   │   ├── regulationTypes.ts  # 타입 정의 (RegulationDecision 등)
│   │   └── index.ts
│   ├── resource/              # PR5: 자원 엔진 (용량 체크)
│   │   ├── resourceEngine.ts  # checkResource, filterByResource
│   │   ├── resourceAllocation.ts # PR7: 재고 차감 (allocateResource)
│   │   ├── resourceTypes.ts   # 타입 정의
│   │   └── index.ts
│   ├── matching/              # PR6: 매칭 파이프라인
│   │   ├── matchingPipeline.ts # runMatchingPipeline (단일 진실 소스)
│   │   ├── conditionFilters.ts # 지역/날짜 조건 필터링
│   │   ├── matchingPipelineTypes.ts # 타입 정의
│   │   └── index.ts
│   ├── session/               # PR5: 세션 관리
│   │   ├── demandSession.ts   # DemandSession 생성/관리 함수
│   │   ├── demandSessionTypes.ts
│   │   └── index.ts
│   └── settlement/            # PR7: 정산 엔진
│       └── cubeSettlement.ts  # calcBillableCubes, calcEstimatedTotal
│
├── store/                     # Code Data System (localStorage 기반)
│   ├── cargoStore.ts          # CargoInfo CRUD
│   ├── demandStore.ts         # DemandSession 관리
│   ├── dealStore.ts           # PR7: Deal CRUD
│   ├── eventLog.ts            # PlatformEvent append-only 기록
│   ├── id.ts                  # ULID 스타일 ID 생성 (makeCargoId 등)
│   ├── storageKeys.ts         # localStorage 키 상수 정의
│   └── index.ts               # store 전체 진입점
│
├── contexts/
│   └── SearchResultContext.tsx # PR4/PR6: 검색 결과 공유 Context
│
├── data/                      # 더미 데이터 & 코드 정의
│   ├── mockData.ts            # StorageProduct×8, RouteProduct×8, PROVIDERS, DEMO_USER
│   ├── itemCodes.ts           # PLATFORM_ITEM_CODES (IC01~IC99)
│   ├── bands.ts               # WeightBand/SizeBand 정의 + 계산 함수
│   ├── featureCodes.ts        # PLATFORM_FEATURE_CODES (F_xxx)
│   ├── regionCodesJeju.ts     # 제주 법정동 코드 (RegionCode)
│   └── regionRepresentativeCoords.ts # 지역/항만 대표좌표 (REGION_REPRESENTATIVE_COORDS)
│
├── types/
│   └── models.ts              # 전체 UI/상품/거래 타입 정의
│
├── components/
│   ├── Layout/
│   │   ├── CommandLayout.tsx  # 45%/55% 그리드, 하이라이트 마커
│   │   ├── ServiceConsole.tsx # (레거시 - 현재 사용 안됨, 아래 것이 실사용)
│   │   └── ServiceConsole/    # ServiceConsole 모듈
│   │       ├── ServiceConsole.tsx  # 탭 UI + 검색 버튼
│   │       ├── index.ts
│   │       ├── hooks/
│   │       │   ├── useServiceConsoleState.ts  # 핵심 상태 훅 (560줄)
│   │       │   └── index.ts
│   │       ├── sections/      # 탭별 섹션 (조립/분기 역할)
│   │       │   ├── StorageTabSection.tsx
│   │       │   ├── TransportTabSection.tsx
│   │       │   ├── BothTabSection.tsx
│   │       │   └── index.ts
│   │       └── ui/            # 세부 UI 컴포넌트
│   │           ├── CargoRegistrationCard.tsx  # 화물 등록 UI
│   │           ├── CargoSummaryCard.tsx       # 등록된 화물 요약
│   │           ├── QuantityInputCard.tsx      # 물량 입력
│   │           ├── ConversionResult.tsx       # 큐브 환산 결과
│   │           ├── GridCell.tsx               # 3행 그리드 셀
│   │           ├── InputModal.tsx             # 범용 입력 모달
│   │           ├── ItemCodeDropdown.tsx       # 품목 코드 선택
│   │           ├── LocationDropdown.tsx       # 지역 선택 드롭다운
│   │           ├── DatePicker.tsx             # 날짜 선택
│   │           ├── SlotCounter.tsx            # 슬롯 카운터 (탭 뱃지)
│   │           ├── ResetButton.tsx            # 초기화 버튼
│   │           ├── SearchResultModal.tsx      # 검색 결과 리스트 모달
│   │           ├── SearchResultList.tsx       # 검색 결과 리스트
│   │           ├── ProductDetailModal.tsx     # 상품 상세 모달 (PR7)
│   │           ├── DealPage.tsx               # 거래 페이지 (PR7, 8개 섹션)
│   │           └── index.ts
│   ├── Map/
│   │   └── MapboxContainer/
│   │       ├── MapboxContainer.tsx  # Mapbox 지도 컨테이너
│   │       ├── index.ts
│   │       ├── hooks/
│   │       │   ├── useMapbox.ts    # 지도 초기화, 카메라 제어
│   │       │   └── useMapLayers.ts # 마커 레이어 (창고/경로)
│   │       └── ui/
│   │           └── HeaderWidget.tsx # 지도 우상단 위젯
│   ├── common/                # 공용 UI 컴포넌트 (2곳 이상 사용)
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── ProductCard.tsx
│   │   └── Toast.tsx
│   ├── routes/
│   │   └── RouteProductCard.tsx    # 경로 상품 카드
│   ├── storages/
│   │   └── StorageProductCard.tsx  # 보관 상품 카드
│   └── visualizations/        # 아이콘/시각화 컴포넌트
│       ├── CubeIcon3D.tsx
│       ├── PalletIcon3D.tsx
│       ├── TruckIcon.tsx
│       ├── WarehouseIcon.tsx
│       └── index.ts
│
├── styles/
│   └── fonts.css              # Pretendard 폰트 설정
│
└── assets/
    └── icons/console/         # 콘솔 아이콘 (svg)
        ├── logo.svg
        ├── cargo.svg
        ├── calendar.svg
        ├── location.svg
        ├── origin.svg
        ├── destination.svg
        └── volume.svg
```

---

## 1-4. 도메인 기준 폴더 재해석

| 도메인 | 폴더 | 역할 |
|--------|------|------|
| **거래** | `engine/settlement/`, `store/dealStore.ts`, `ui/DealPage.tsx` | 정산 계산, 거래 데이터 저장, 거래 UI |
| **지도** | `components/Map/`, `contexts/SearchResultContext.tsx` | Mapbox 렌더링, 하이라이트 동기화 |
| **상품** | `data/mockData.ts`, `types/models.ts` | StorageProduct/RouteProduct 정의 및 더미 데이터 |
| **상태** | `store/`, `contexts/` | localStorage CRUD, React Context 상태 공유 |
| **엔진** | `engine/` | 큐브 계산, 규정 체크, 자원 필터, 매칭 파이프라인 |
| **코드** | `data/itemCodes.ts`, `data/bands.ts`, `data/featureCodes.ts` | 플랫폼 표준 코드 정의 |
| **지역** | `data/regionCodesJeju.ts`, `data/regionRepresentativeCoords.ts` | 지역 코드 + 대표 좌표 |

---

## 1-5. 핵심 파일 Top 30

| 순위 | 파일 경로 | 역할 | 시스템 위치 |
|------|-----------|------|------------|
| 1 | `types/models.ts` | 전체 타입 정의 허브 | 타입 |
| 2 | `engine/matching/matchingPipeline.ts` | 단일 매칭 파이프라인 SoT | 엔진/매칭 |
| 3 | `components/Layout/ServiceConsole/hooks/useServiceConsoleState.ts` | 핵심 상태 훅 (560줄) | 상태 |
| 4 | `data/mockData.ts` | StorageProduct×8, RouteProduct×8 더미 데이터 | 데이터 |
| 5 | `contexts/SearchResultContext.tsx` | 지도↔리스트 결과 공유 Context | 상태/지도 |
| 6 | `engine/settlement/cubeSettlement.ts` | 정산 엔진 (부피/중량 큐브 계산) | 엔진/거래 |
| 7 | `engine/regulation/regulationEngine.ts` | 규정 체크 (4대 기준) | 엔진/규정 |
| 8 | `engine/cubeEngine.ts` | 박스→큐브 핵심 계산 | 엔진 |
| 9 | `engine/cubeConfig.ts` | Cube/Pallet 상수 (불변 설정) | 엔진 |
| 10 | `engine/resource/resourceEngine.ts` | 자원(잔여 큐브) 체크 | 엔진/자원 |
| 11 | `engine/resource/resourceAllocation.ts` | PR7: 재고 차감 | 엔진/자원 |
| 12 | `engine/matching/conditionFilters.ts` | 지역/날짜 조건 필터 | 엔진/매칭 |
| 13 | `store/cargoStore.ts` | CargoInfo CRUD | 저장소 |
| 14 | `store/demandStore.ts` | DemandSession 관리 | 저장소 |
| 15 | `store/dealStore.ts` | Deal CRUD (PR7) | 저장소/거래 |
| 16 | `store/eventLog.ts` | append-only 이벤트 기록 | 저장소 |
| 17 | `components/Layout/CommandLayout.tsx` | 루트 레이아웃 + 마커 연동 | UI/지도 |
| 18 | `components/Layout/ServiceConsole/ServiceConsole.tsx` | 탭 + 검색 버튼 | UI |
| 19 | `components/Layout/ServiceConsole/ui/DealPage.tsx` | 거래 페이지 (8섹션) | UI/거래 |
| 20 | `components/Layout/ServiceConsole/ui/SearchResultModal.tsx` | 검색 결과 모달 | UI |
| 21 | `components/Layout/ServiceConsole/ui/ProductDetailModal.tsx` | 상품 상세 모달 | UI |
| 22 | `components/Map/MapboxContainer/hooks/useMapbox.ts` | 지도 초기화/카메라 | 지도 |
| 23 | `components/Map/MapboxContainer/hooks/useMapLayers.ts` | 지도 마커 레이어 | 지도 |
| 24 | `data/itemCodes.ts` | 품목 코드셋 (IC01~IC99) | 코드 데이터 |
| 25 | `data/bands.ts` | 중량/사이즈 밴드 정의 | 코드 데이터 |
| 26 | `data/featureCodes.ts` | Feature 코드셋 (F_xxx) | 코드 데이터 |
| 27 | `data/regionCodesJeju.ts` | 제주 법정동 코드 | 코드 데이터 |
| 28 | `data/regionRepresentativeCoords.ts` | 지역 대표 좌표 | 데이터 |
| 29 | `engine/shapeClassifier.ts` | 포장 모듈 형상 분류 | 엔진 |
| 30 | `engine/session/demandSession.ts` | DemandSession 생성/관리 | 엔진/세션 |

---

## 1-6. 주목할 구조적 특이점

### (A) 이중 ServiceConsole 파일 존재

- `src/components/Layout/ServiceConsole.tsx` — **레거시, 미사용 가능성 있음**
- `src/components/Layout/ServiceConsole/ServiceConsole.tsx` — **실사용 (모듈 구조)**

`CommandLayout.tsx:108`에서 `import ServiceConsole from './ServiceConsole'`로 임포트하는데, 이는 `ServiceConsole/index.ts`를 통해 `ServiceConsole/ServiceConsole.tsx`를 가리킨다. 루트 레벨의 `ServiceConsole.tsx`는 dead code 여부를 추가 확인 필요.

### (B) `__tests__` 폴더 존재

- `src/__tests__/codeDataSystem.test.ts`
- `src/__tests__/conditionFilters.test.ts`

테스트가 있으나 CI 파이프라인이 없음. 참고용 단위 테스트.

### (C) `useServiceConsoleState.ts` 560줄 초과

컨벤션(최대 300줄) 위반. 상태 훅이 비대화되어 있으나, 기능적으로는 정상 동작.

---

## 1-7. 기술 스택 정리

| 항목 | 버전/라이브러리 |
|------|----------------|
| 프레임워크 | Vite + React 18 + TypeScript |
| 스타일 | Tailwind CSS |
| 지도 | Mapbox GL JS (light-v11 스타일) |
| 폰트 | Pretendard (메인), Inter (숫자) |
| 상태 관리 | React useState/useMemo + Context API |
| 데이터 저장 | localStorage (CRUD), mockData (더미) |
| 패키지 매니저 | npm (package.json 기준) |
| 라우팅 | **없음** (싱글 페이지, 모달 기반) |
| 백엔드/DB | **없음** (MVP 더미 데이터) |

---

*근거 파일: `src/main.tsx`, `src/App.tsx`, `src/components/Layout/CommandLayout.tsx`, 전체 파일 트리 (`find /home/user/integral-mvp/src -type f | sort`)*


---


# [2] UI/UX 및 사용자 흐름 분석

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 2/11: UI/UX 및 사용자 흐름

---

## 2-1. 요약

UI는 **싱글 페이지 구조**로 라우팅 없이 동작한다. 전체 화면은 `45% 좌측(ServiceConsole) + 55% 우측(MapboxContainer)`의 그리드 레이아웃이다. 모든 사용자 상호작용은 아코디언/모달/탭으로 처리된다.

---

## 2-2. 레이아웃 구조

```
┌──────────────────── 전체 화면 h-screen ──────────────────────┐
│  ┌──── 45% ───────────────────┐  ┌──── 55% ────────────────┐ │
│  │  [Blur 배경 = 지도 블러]    │  │  [MapboxContainer]      │ │
│  │  ┌─────────────────────┐   │  │  제주도 지도             │ │
│  │  │ 로고 CUBE           │   │  │  (창고 마커, 경로 선)    │ │
│  │  ├─────────────────────┤   │  │                         │ │
│  │  │ ServiceConsole      │   │  │  [HeaderWidget]         │ │
│  │  │ (탭 + 폼 + 검색버튼) │   │  │  (우측 상단 위젯)       │ │
│  │  └─────────────────────┘   │  └─────────────────────────┘ │
│  └────────────────────────────┘                               │
└──────────────────────────────────────────────────────────────┘
```

**근거**: `CommandLayout.tsx:79` — `grid grid-cols-[45%_55%] overflow-hidden`

---

## 2-3. 흐름 A: 탐색 (지도 → 필터 → 리스트 → 상품 선택)

```
[사용자] 지도 진입
    ↓
[MapboxContainer] 제주 지도 렌더링 (창고 마커 + 경로 레이어)
    ↓
[ServiceConsole] 탭 선택 (보관/운송/보관+운송)
    │  이벤트: setActiveTab() → handleTabChange()
    │  효과: registeredCargos/conditions 리셋, 새 DemandSession 시작
    ↓
[화물 등록] CargoRegistrationCard
    │  - 규격 입력 (w×d×h mm)
    │  - 품목 코드 선택 (ItemCodeDropdown → ICxx)
    │  - 중량 입력 (kg)
    │  completeCargo() → checkQuickRulesWithLogging() → addCargoToStore()
    ↓
[물량 입력] QuantityInputCard
    │  - 수량 입력 → updateCargoQuantity()
    │  - computeDemand() 자동 계산 (useMemo)
    │  confirmQuantityInput() → setQuantitiesAndCubes()
    ↓
[조건 입력] GridCell (StorageTabSection / TransportTabSection)
    │  - 지역 선택: LocationDropdown → locationCode (법정동 코드)
    │  - 날짜 선택: DatePicker
    │  updateStorageCondition() / updateTransportCondition()
    ↓
[실시간 프리뷰] (useMemo, 조건 변경마다 자동 실행)
    │  runMatchingPipeline() → matchedOfferIds
    │  → setPreviewResult() → SearchResultContext 업데이트
    │  → highlightedIds 갱신 → 지도 마커 하이라이트 (CommandLayout.tsx:39-62)
    ↓
[검색 버튼] "N건의 상품 검색하기"
    │  SearchButton.onClick → handleSearchClick()
    │  → actions.handleSearch() → searchResult 스냅샷 저장
    │  → setIsModalOpen(true)
    ↓
[SearchResultModal] 검색 결과 리스트
    │  - StorageProductCard / RouteProductCard
    │  - "상세" 버튼 → ProductDetailModal
    │  - "선택" 버튼 → onSelectStorage / onSelectRoute
```

### 단계별 컴포넌트/훅/컨텍스트 매핑

| 단계 | 컴포넌트/훅 | 데이터 소스 |
|------|-------------|-------------|
| 탭 선택 | `ServiceConsole.tsx` | `useServiceConsoleState.activeTab` |
| 화물 등록 | `CargoRegistrationCard.tsx` | `cargos[]` 상태 → `cargoStore.ts` |
| 물량 계산 | `QuantityInputCard.tsx` | `computeDemand()` → `totalCubes` |
| 조건 입력 | `GridCell.tsx` + `LocationDropdown.tsx` | `storageCondition.locationCode` |
| 프리뷰 계산 | `useServiceConsoleState.ts:218` (useMemo) | `runMatchingPipeline()` |
| 지도 하이라이트 | `CommandLayout.tsx:39-62` (useEffect) | `SearchResultContext.highlightedIds` |
| 검색 결과 | `SearchResultModal.tsx` | `SearchResultContext.searchResult` |

---

## 2-4. 흐름 B: 거래 (상품 선택 → 상세 → 요청/거래)

```
[SearchResultModal] 상품 카드 클릭
    │
    ├─ "상세" 버튼
    │    → setDetailProduct(product)
    │    → <ProductDetailModal> 오픈
    │       - 상품 전체 정보 표시
    │       - 잔여 큐브, 단가, 업체 정보
    │       - "이 상품 선택" 버튼 → onSelect()
    │
    └─ "선택" 버튼
         → onSelectStorage(id) / onSelectRoute(id)
         → state.selectedStorageId / selectedRouteId 업데이트

[SearchResultModal 하단] 선택 요약 + "거래 진행" 버튼
    │  조건: storage면 selectedStorageId 필수
    │         transport면 selectedRouteId 필수
    │         both면 둘 다 필수
    │
    → onStartDeal() 클릭
    → setIsModalOpen(false), setIsDealPageOpen(true)

[DealPage] 8개 섹션 거래 신청서
    │  1. 사용자 정보 (DEMO_USER)
    │  2. 화물 정보 및 조건 요약
    │  3. 부가 옵션 (보험/포장/빠른배송)
    │  4. 거래 요약 (PR7: 정산 breakdown)
    │     - calcBillableCubes(volumeCubes, totalWeightKg, maxKgPerCube)
    │     - 부피 큐브 vs 중량 큐브 → max = 과금 큐브
    │  5. 사용자 요청 메모
    │  6. 하단 "거래 신청" 버튼
    │  7. 계약 동의 (체크박스 + 계약서 전문 모달)
    │  8. 거래 확정 확인 카드
    │
    → contractAgreed 체크 후 handleSubmitDeal()
    → showConfirmCard = true
    → handleConfirmDeal() 클릭:
         1. logDealConfirmed()
         2. allocateResource() - 재고 차감 (localStorage)
         3. logSettlementCalculated()
         4. logResourceAllocated()
         5. onDealComplete() → onClose()
```

### 거래 흐름 컴포넌트 매핑

| 단계 | 컴포넌트 | 핵심 함수 |
|------|----------|----------|
| 상품 선택 | `SearchResultModal.tsx:547-583` | `onSelectStorage/Route` |
| 상세 보기 | `ProductDetailModal.tsx` | `setDetailProduct` |
| 거래 페이지 오픈 | `ServiceConsole.tsx:84-86` | `handleStartDeal` |
| 비용 계산 | `DealPage.tsx:120-194` (useMemo) | `calcBillableCubes`, `calcEstimatedTotal` |
| 계약 동의 | `DealPage.tsx:655-677` | `contractAgreed` 체크박스 |
| 거래 확정 | `DealPage.tsx:215-306` | `handleConfirmDeal` → `allocateResource` |

---

## 2-5. 흐름 C: 상태 반영 (검색 결과 → 지도 하이라이트 → 리스트 반영)

```
[조건/화물 변경] (상태 변경 발생)
    ↓
[useServiceConsoleState.ts:218] previewMatch (useMemo)
    │  runMatchingPipeline({ mode, offers, session, conditions })
    │  → matchedOffers[], matchedOfferIds[]
    ↓
[useServiceConsoleState.ts:311-338] useEffect (previewMatch 의존)
    │  hasCargoOrCondition 체크:
    │    - registeredCargos.length > 0
    │    - storageCondition.locationCode
    │    - transportCondition.originCode/destinationCode
    │  → setPreviewResult({ ...previewMatch, updatedAt })
    │  (조건 없으면 setPreviewResult(null))
    ↓
[SearchResultContext.tsx:60-65] highlightedIds (useMemo)
    │  new Set(previewResult.matchedOfferIds)
    ↓
[CommandLayout.tsx:39-62] useEffect (highlightedIds 의존)
    │  - DOM에서 .pallet-marker 요소 탐색
    │  - data-product-id가 highlightedIds에 있으면 물방울 마커 추가
    │  - 없으면 기존 마커 제거
    ↓
[지도 표시] 하이라이트된 상품 위치에 물방울 마커 bounce 애니메이션

[검색 버튼 클릭 시] handleSearch()
    │  previewMatch를 스냅샷으로 저장
    │  setSearchResult({ ...previewMatch, searchedAt })
    ↓
[SearchResultModal] Context.searchResult 기반으로 리스트 렌더링
```

### 지도 ↔ 리스트 연동 분석

| 상태 | 지도 반응 | 리스트 반응 |
|------|----------|------------|
| 조건 없음 | 모든 마커 기본 표시 | 검색 전 빈 상태 |
| 조건 입력 중 | 매칭 마커에 물방울 하이라이트 | 검색 버튼 건수 업데이트 |
| 검색 버튼 클릭 | 하이라이트 유지 | SearchResultModal 오픈 |
| 탭 변경 | 초기화 | 초기화 |

---

## 2-6. ServiceConsole 3행 그리드 레이아웃 구조

```
┌─────────────────────────────────────────────────────┐
│  탭 바 (보관 / 운송 / 보관+운송)                     │
├─────────────────────────────────────────────────────┤
│  [1행] 화물 정보 (CargoRegistrationCard)             │
│        물량 입력 (QuantityInputCard + ConversionResult)│
├─────────────────────────────────────────────────────┤
│  [2행] 보관 장소 / 출발지↔도착지 (LocationDropdown)  │
├─────────────────────────────────────────────────────┤
│  [3행] 보관 기간 / 운송 날짜 (DatePicker)            │
├─────────────────────────────────────────────────────┤
│  [검색 버튼] N건의 상품 검색하기 (SlotCounter 애니메이션) │
└─────────────────────────────────────────────────────┘
```

각 행은 `GridCell.tsx`로 래핑, 아코디언 형태로 열림/닫힘 (`expandedField` 상태).

---

## 2-7. 모달 스택 구조

```
기본 화면
  └─ SearchResultModal (isModalOpen)
       └─ ProductDetailModal (detailProduct !== null)
            └─ [DealPage로 이동]
  └─ DealPage (isDealPageOpen)
       └─ 계약서 모달 (showContractModal)
            └─ 거래 확정 카드 (showConfirmCard)
```

**주의**: ProductDetailModal에서 DealPage로 이동 시 SearchResultModal은 닫힌다 (`handleStartDeal:setIsModalOpen(false)`).

---

## 2-8. 현재 상태의 UX 흐름 문제점

| # | 문제 | 위치 | 심각도 |
|---|------|------|--------|
| 1 | `getLocationName()`이 locationCode가 아닌 locationId(레거시)로 표시 | `SearchResultModal.tsx:19-23` | 중 |
| 2 | both 탭 "연계" 탭이 빈 배열 (`TODO: 연계 상품은 별도 데이터 필요`) | `SearchResultModal.tsx:358-360` | 중 |
| 3 | DealPage에서 보관 일수가 항상 1일 고정 (`const days = 1`) | `DealPage.tsx:144` | 중 |
| 4 | 모달이 중첩되어 z-index 관리 복잡 (50→60→70) | `DealPage.tsx:311,706,755` | 하 |
| 5 | 검색 버튼 클릭 시 isSearching은 즉시 false로 전환 (실질 로딩 없음) | `useServiceConsoleState.ts:598` | 하 |

---

*근거 파일: `CommandLayout.tsx`, `ServiceConsole.tsx`, `useServiceConsoleState.ts`, `SearchResultModal.tsx`, `DealPage.tsx`, `SearchResultContext.tsx`*


---


# [3] 큐브 거래 엔진 분석

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 3/11: 큐브 거래 엔진

---

## 3-1. 요약

큐브 거래 엔진은 `src/engine/` 폴더에 **순수 함수만** 모아둔 플랫폼의 계산 핵심이다. React import가 없으며, 입력→계산→출력이 명확히 분리되어 있다. 거래 단위는 외부 표시에서 Pallet(보관) 또는 Cube(운송)를 쓰지만, **모든 내부 계산은 Cube 단일 단위**로만 처리한다.

---

## 3-2. engine 폴더 파일 목록 및 역할

| 파일 | 역할 | 핵심 함수 |
|------|------|----------|
| `cubeConfig.ts` | 플랫폼 전역 상수 정의 (불변) | `CUBE_SPEC`, `PALLET_SPEC`, `PACKING_FACTOR`, `MODULE_SPECS` |
| `shapeClassifier.ts` | 박스 → 포장 모듈 형상 분류 | `classifyModule()`, `classifyBoxes()`, `hasUnclassified()` |
| `cubeEngine.ts` | 박스 리스트 → 큐브 수요 계산 (핵심) | `calcCubeDemand()` |
| `unitConvert.ts` | 큐브↔파렛트↔CBM↔면적 변환 | `cubesToPallets()`, `palletsToCubes()`, `cubesToCBM()` 등 |
| `index.ts` | 엔진 단일 진입점 | `computeDemand()` (통합 인터페이스) |
| `rules/ruleCheck.ts` | MVP 빠른 규정 체크 (UI용) | `checkQuickRules()`, `checkQuickRulesWithLogging()` |
| `regulation/regulationEngine.ts` | 상품 필터용 규정 체크 (엔진용) | `checkRegulation()`, `filterOffersByRegulation()` |
| `resource/resourceEngine.ts` | 잔여 큐브 자원 체크 | `checkResource()`, `filterStorageByResource()` |
| `resource/resourceAllocation.ts` | PR7: 거래 확정 시 재고 차감 | `allocateResource()` |
| `matching/matchingPipeline.ts` | 단일 매칭 파이프라인 (SoT) | `runMatchingPipeline()`, `runCombinedPipeline()` |
| `matching/conditionFilters.ts` | 지역/날짜 조건 필터 | `filterStorageByConditions()`, `filterRouteByConditions()` |
| `session/demandSession.ts` | DemandSession 생성/관리 | `createDemandSession()`, `updateDemandSession()` |
| `settlement/cubeSettlement.ts` | PR7: 정산 엔진 (큐브 단가 기반) | `calcBillableCubes()`, `calcEstimatedTotal()`, `calcStorageEstimate()` |

---

## 3-3. 큐브 수요 계산 흐름 (I/O 명세)

### 메인 흐름: `computeDemand()` (engine/index.ts)

```
INPUT:
  boxes: BoxInput[] = [
    { widthMm, depthMm, heightMm, count, weightKg?, stackable? }
  ]
  mode: 'STORAGE' | 'ROUTE'

PROCESS:
  1. calcCubeDemand(boxes, mode)          [cubeEngine.ts]
     ├─ 박스별 체적 계산: widthMm × depthMm × heightMm / 1e9 = m³
     ├─ 총 체적: totalVolumeM3 = Σ(volumeM3 × count)
     ├─ 포장 효율 적용: effectiveVolumeM3 = totalVolumeM3 × packingFactor[mode]
     │    STORAGE: ×1.15 (여유 공간 보정)
     │    ROUTE:   ×1.10 (적재 효율 보정)
     ├─ 큐브 계산: totalCubes = ceil(effectiveVolumeM3 / 0.015625)
     └─ 모듈별 집계: byModule[] (설명용)

  2. mode === 'STORAGE' → demandPallets = ceil(totalCubes / 128)

OUTPUT:
  DemandResult = {
    demandCubes: number     // 정수 (ceil)
    demandPallets?: number  // STORAGE만 (ceil)
    moduleSummary: ModuleSummary[]
    hasUnclassified: boolean
    detail: CubeDemand      // 상세 계산 정보
  }
```

### 큐브 상수 (cubeConfig.ts)

| 상수 | 값 | 의미 |
|------|-----|------|
| `CUBE_SPEC.sizeMm` | 250 | Cube 한 변 길이 (mm) |
| `CUBE_SPEC.volumeM3` | 0.015625 | Cube 체적 (0.25³ m³) |
| `CUBES_PER_PALLET` | 128 | 1 Pallet = 128 Cube |
| `PACKING_FACTOR.STORAGE` | 1.15 | 보관 포장 효율 보정 |
| `PACKING_FACTOR.ROUTE` | 1.10 | 운송 포장 효율 보정 |

### 형상 분류 (shapeClassifier.ts)

| 모듈 | 가로×세로 (mm) | 버퍼 | 분류 방법 |
|------|---------------|------|----------|
| 소형 | 550×275 | ±10mm | 면적 우선, 90도 회전 허용, 최소 면적 모듈 선택 |
| 중형 | 550×366 | ±10mm | 동일 |
| 대형 | 650×450 | ±10mm | 동일 |
| UNCLASSIFIED | - | - | 위 3개 불일치 시 |

---

## 3-4. 정산 엔진 흐름 (PR7: cubeSettlement.ts)

거래 확정 시 **부피 기준 큐브**와 **중량 환산 큐브** 중 큰 값으로 과금한다.

```
INPUT:
  volumeCubes: number       // 수요 계산에서 나온 큐브 수 (부피 기준)
  totalWeightKg: number     // 등록된 화물 총 중량 합산
  maxKgPerCube: number      // 상품의 1 Cube당 최대 허용 중량

PROCESS:
  weightCubes = ceil(totalWeightKg / maxKgPerCube)   [calcWeightCubes]
  billableCubes = max(volumeCubes, weightCubes)      [calcBillableCubes]
  weightSurchargeApplied = weightCubes > volumeCubes

OUTPUT:
  BillableCubesResult = {
    volumeCubes, weightCubes, billableCubes, weightSurchargeApplied
  }
```

### 최종 금액 계산

```
Storage:
  base = billableCubes × unitPricePerCube × days    [calcStorageEstimate]

Route:
  base = billableCubes × unitPricePerCube            [calcEstimatedTotal]

total = base + Σ(옵션 금액)
```

### unitPricePerCube 사용 위치

| 파일 | 용도 |
|------|------|
| `data/mockData.ts` | StorageProduct/RouteProduct 각 상품에 정의 (SoT) |
| `engine/settlement/cubeSettlement.ts` | `calcBaseAmount(billableCubes, unitPricePerCube)` |
| `components/Layout/ServiceConsole/ui/DealPage.tsx:519,582` | 화면에 단가 표시 |
| `components/Layout/ServiceConsole/ui/SearchResultModal.tsx:107,185` | 카드에 단가 표시 |

**legacy `price` 필드**: `StorageProduct.price`, `RouteProduct.price`는 여전히 존재하나 실제 계산에서는 사용하지 않음. 모달 카드에서도 `unitPricePerCube`를 표시한다. → `price` 필드는 **dead code에 가깝다** (mockData에만 남아있음).

---

## 3-5. payload(kg) → Cube 환산 흐름

```
화물 등록 시:
  CargoUI.weightKg (사용자 입력)

물량 확정 시:
  DemandSession.totalWeightKg = Σ(cargo.weightKg × quantity)

거래 정산 시 (DealPage.tsx:122-125):
  totalWeightKg = registeredCargos.reduce(
    (sum, cargo) => sum + cargo.weightKg * cargo.quantity, 0
  )

  weightCubes = ceil(totalWeightKg / offer.maxKgPerCube)

예시: totalWeightKg=100kg, maxKgPerCube=5kg → weightCubes = ceil(100/5) = 20
```

---

## 3-6. STORAGE vs ROUTE 모드 차이

| 항목 | STORAGE | ROUTE |
|------|---------|-------|
| packingFactor | 1.15 | 1.10 |
| 거래 단위 (표시) | Pallet | Cube |
| 내부 계산 단위 | Cube | Cube |
| demandPallets 계산 | O (`ceil(cubes/128)`) | X |
| unitPricePerCube 의미 | ₩/Cube/일 | ₩/Cube |
| 정산 함수 | `calcStorageEstimate(billableCubes, price, days)` | `calcEstimatedTotal(billableCubes, price)` |
| capacityCubes 계산 | Pallet 수 × 128 | 차량 용량 기반 직접 설정 |
| 조건 필터 | locationCode | originCode/destinationCode |

---

## 3-7. 재고 차감 흐름 (resourceAllocation.ts)

```typescript
// allocateResource (engine/resource/resourceAllocation.ts)
INPUT:
  { offerId, offerType: 'storage'|'route', billableCubes, totalWeightKg }

PROCESS:
  // 현재 mockData에서 상품 찾기
  find product by offerId in STORAGE_PRODUCTS | ROUTE_PRODUCTS
  check remainingCubes >= billableCubes
  // localStorage에 차감 결과 저장 (별도 키)

OUTPUT:
  { success: boolean, message: string }
```

**주의**: 현재 `allocateResource`는 mockData 배열을 직접 수정하지 않고 localStorage 별도 키에 차감량을 기록하는 방식으로 추정. **실제 `STORAGE_PRODUCTS.remainingCubes`를 런타임에 변경하지 않는다** — 페이지 새로고침 시 초기화됨.

---

## 3-8. 엔진 I/O 표준 명세 (요약)

```
[화물 등록]
  Input: { widthMm, depthMm, heightMm, weightKg, itemCode, count }
  Output: CargoInfo { id, signature, fields }

[물량 계산]
  Input: BoxInput[], mode
  Output: DemandResult { demandCubes, demandPallets? }

[매칭 파이프라인]
  Input: { mode, offers[], session, conditions, sort }
  Output: MatchingPipelineResult { matchedOffers[], matchedOfferIds[], counts }

[정산]
  Input: { volumeCubes, totalWeightKg, maxKgPerCube, unitPricePerCube, days? }
  Output: { billableCubes, base, options, total, breakdown }

[재고 차감]
  Input: { offerId, offerType, billableCubes, totalWeightKg }
  Output: { success, message }
```

---

*근거 파일: `engine/cubeConfig.ts`, `engine/cubeEngine.ts`, `engine/shapeClassifier.ts`, `engine/unitConvert.ts`, `engine/index.ts`, `engine/settlement/cubeSettlement.ts`, `engine/resource/resourceAllocation.ts`, `components/Layout/ServiceConsole/ui/DealPage.tsx`*


---


# [4] Code Data System 분석

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 4/11: Code Data System

---

## 4-1. 요약

Code Data System은 플랫폼의 두 번째 핵심 축이다. "선 규정, 후 거래" 원칙을 데이터 구조로 구현한다. 모든 데이터는 **localStorage 기반**이며, 이벤트 로그는 **append-only**로 관리된다. 백엔드 DB로 전환 시 localStorage 키를 API 호출로 대체하는 구조다.

---

## 4-2. 코드 정의 파일 위치

| 코드셋 | 파일 경로 | 설명 |
|--------|-----------|------|
| 품목 코드 (ItemCode) | `src/data/itemCodes.ts` | IC01~IC99 (30개) |
| 중량 밴드 (WeightBand) | `src/data/bands.ts` | WBX/WBY/WBZ/WBH (4개) |
| 사이즈 밴드 (SizeBand) | `src/data/bands.ts` | SB1/SB2/SB3/SB4/SBX (5개) |
| Feature 코드 | `src/data/featureCodes.ts` | F_xxx (8개, Storage 전용) |
| 지역 코드 (RegionCode) | `src/data/regionCodesJeju.ts` | 제주 법정동 코드 (10자리) |
| 포장 모듈 | `src/engine/cubeConfig.ts` | 소형/중형/대형/UNCLASSIFIED |
| 이벤트 타입 | `src/types/models.ts` | PlatformEventType (22종) |

---

## 4-3. Code Data Dictionary

### A. 품목 코드 (ItemCode)

| group | code | label | flags |
|-------|------|-------|-------|
| 일반 | IC01 | 일반잡화(비파손) | - |
| 일반 | IC02 | 의류/패션/섬유 | - |
| 일반 | IC03 | 도서/인쇄물/서류 | - |
| 일반 | IC04 | 완구/취미/스포츠 | - |
| 일반 | IC05 | 가구/인테리어(소형) | oversizeRisk |
| 식품 | IC10 | 식품(상온·가공) | - |
| 식품 | IC11 | 농산물(신선) | perishable |
| 식품 | IC12 | 축산/수산(신선) | perishable, **tempRequired** |
| 식품 | IC13 | 냉장/냉동 식품(포장완료) | **tempRequired** |
| 식품 | IC14 | 음료(병/캔/페트) | liquid |
| 취급주의 | IC20 | 유리/도자기/사기 | fragile |
| 취급주의 | IC21 | 전자기기/가전(배터리 없음) | fragile |
| 취급주의 | IC22 | 배터리 포함 전자/리튬배터리 | battery, hazmatLike |
| 취급주의 | IC23 | 정밀/고가품 | fragile |
| 취급주의 | IC24 | 예술품/액자/피규어 | fragile, oversizeRisk |
| 액체/화학 | IC30 | 액체류(비위험) | liquid |
| 액체/화학 | IC31 | 페인트/도료(수성) | liquid |
| 액체/화학 | IC32 | 윤활유/오일 | liquid, hazmatLike |
| 액체/화학 | IC33 | 화학제품/세정제 | hazmatLike |
| 액체/화학 | **IC34** | **위험물/인화성/폭발물** | hazmatLike (**RESTRICTED**) |
| 의료 | IC40 | 의약품/의료기기(상온) | - |
| 의료 | IC41 | 검체/생물/냉장필수 | tempRequired, hazmatLike |
| 특수 | IC50 | 중량물(특수) | oversizeRisk |
| 특수 | IC51 | 장척/대형(특수) | oversizeRisk |
| 특수 | IC52 | 이사/벌크/혼합짐 | oversizeRisk |
| 기타 | IC99 | 기타(분류불가/미정) | - |

**RESTRICTED_CODES**: `['IC34']` — 플랫폼 게이트에서 기본 차단
**SPECIAL_HANDLING_CODES**: `['IC34', 'IC41']` — 특수 취급 필요
**tempRequired**: IC10(농산물), IC12(축산/수산), IC13(냉장냉동), IC41(검체)
→ `isTempRequiredItem()` — 실제 코드에서는 IC10, IC12만 체크 (IC13, IC41 누락)

**코드 사용처**: `CargoSignature.itemCode`, `OfferRegulationFields.allowedItemCodes`, `checkRegulation()`, `adaptCargoForRegulation()`

### B. 중량 밴드 (WeightBand)

| code | label | 범위 |
|------|-------|------|
| WBX | 초경량 (≤5kg) | 0 < kg ≤ 5 |
| WBY | 경량 (≤20kg) | 5 < kg ≤ 20 |
| WBZ | 중량 (≤30kg) | 20 < kg ≤ 30 |
| WBH | 중량물 (>30kg) | kg > 30 |

**계산 함수**: `getWeightBand(weightKg: number): WeightBand` (`data/bands.ts`)
**사용처**: `CargoSignature.weightBand`, `CargoInfo.signature`

### C. 사이즈 밴드 (SizeBand)

| code | label | 범위 (3변합) |
|------|-------|------------|
| SB1 | 소형 (≤80cm) | sumCm ≤ 80 |
| SB2 | 표준 (≤120cm) | 80 < sumCm ≤ 120 |
| SB3 | 중형 (≤160cm) | 120 < sumCm ≤ 160 |
| SB4 | 대형 (≤170cm) | 160 < sumCm ≤ 170 |
| SBX | 특대형 (>170cm) | sumCm > 170 |

**계산 함수**: `getSizeBand(sumCm: number): SizeBand` (`data/bands.ts`)
**사용처**: `CargoSignature.sizeBand`, `CargoInfo.signature`

### D. 포장 모듈 (ModuleClassification)

| code | label | 치수 (mm) | 분류 기준 |
|------|-------|----------|----------|
| 소형 | 소형 | 550×275 | fitsModule() 최소 면적 |
| 중형 | 중형 | 550×366 | fitsModule() |
| 대형 | 대형 | 650×450 | fitsModule() |
| UNCLASSIFIED | 분류불가 | - | 위 3개 불일치 |

**계산 함수**: `classifyModule(box: BoxInput): ShapeCheck` (`engine/shapeClassifier.ts`)
**버퍼**: ±10mm, 90도 회전 허용
**사용처**: `CargoSignature.moduleClass`, `OfferRegulationFields.allowedModuleClasses`

### E. Feature 코드 (Storage 전용)

| code | label |
|------|-------|
| F_24H_INOUT | 24시간 입출고 |
| F_FORKLIFT | 지게차 보유 |
| F_CCTV | CCTV |
| F_TEMP_MONITORING | 온도 모니터링 |
| F_FAST_FREEZE | 급속 냉동 |
| F_PARKING | 주차 공간 |
| F_FOOD_SPECIALIZED | 식품 특화 |
| F_AGRI_SPECIALIZED | 농산물 특화 |

**사용처**: `StorageProduct.features[]` (mockData)
**현재 상태**: 코드 타입만 정의, 실제 상품 데이터는 아직 한글 문자열로 사용 중 — **정합성 문제**

### F. 지역 코드 (RegionCode)

- **형식**: 10자리 문자열 (법정동 코드)
- **예시**: `'5011000000'` = 제주시, `'5013000000'` = 서귀포시
- **파일**: `data/regionCodesJeju.ts` (JEJU_REGION_CODES 배열)
- **레벨**: province/city/town/district/ri
- **항만 특수 코드**: `'JEJU_PORT'`, `'BUSAN_PORT'`, `'SEOGWIPO_PORT'` (`regionRepresentativeCoords.ts`)
- **사용처**: `StorageCondition.locationCode`, `TransportCondition.originCode/destinationCode`, `conditionFilters.ts`

---

## 4-4. ID 체계

| 엔티티 | 형식 | 생성 함수 | 예시 |
|--------|------|----------|------|
| CargoInfo | `cargo_{timestamp36}{random16}` | `makeCargoId()` | `cargo_lz1234abcdef...` |
| DemandSession | `demand_{timestamp36}{random16}` | `makeDemandId()` | `demand_lz5678...` |
| PlatformEvent | `evt_{timestamp36}{random16}` | `makeEventId()` | `evt_lz9012...` |
| Deal | `deal_{timestamp36}{random16}` | `makeDealId()` | `deal_lzabcd...` |

---

## 4-5. 이벤트 로그 (PlatformEventType 전수 조사)

`types/models.ts`에 정의된 22종 이벤트:

| 카테고리 | 이벤트 타입 |
|---------|-----------|
| Cargo | `CARGO_CREATED`, `CARGO_REMOVED`, `CARGO_SIGNATURE_UPDATED` |
| Rule | `RULE_CHECKED`, `RULES_PASSED` |
| Quantity | `QUANTITY_SET`, `CUBE_CALCULATED`, `RESOURCE_READY` |
| Storage | `STORAGE_CONDITION_SET`, `STORAGE_SEARCHED`, `STORAGE_SELECTED` |
| Transport | `TRANSPORT_CONDITION_SET`, `TRANSPORT_SEARCHED`, `TRANSPORT_SELECTED` |
| Search | `SEARCH_EXECUTED` |
| DemandSession | `DEMAND_SESSION_CREATED`, `RESOURCE_CHECKED` |
| Deal (PR7) | `DEAL_CREATED`, `DEAL_SUBMITTED`, `DEAL_CONFIRMED`, `DEAL_CANCELLED` |
| Settlement (PR7) | `SETTLEMENT_CALCULATED` |
| Resource (PR7) | `RESOURCE_ALLOCATED` |

**저장 방식**: `localStorage[integral_mvp_v1_events]` — 최대 1000개, 초과 시 오래된 것 삭제

---

## 4-6. localStorage 키 구조

```
integral_mvp_v1_cargos              → CargoInfo[]
integral_mvp_v1_demands             → DemandSession[]
integral_mvp_v1_active_demand_storage → demandId (string)
integral_mvp_v1_active_demand_route   → demandId (string)
integral_mvp_v1_active_demand_both    → demandId (string)
integral_mvp_v1_events              → PlatformEvent[] (max 1000)
integral_mvp_v1_deals               → Deal[]
integral_mvp_v1_settings            → 설정 (현재 미사용)
```

---

## 4-7. 핵심 흐름 (CargoInfo 생성 → DemandSession 연결)

```
1. CargoUI 입력 완료 → completeCargo() [useServiceConsoleState.ts:378]
2. checkQuickRulesWithLogging() — 즉각 규정 경고
3. addCargo(CreateCargoParams) [cargoStore.ts:69]
   ├─ makeCargoId() → cargo_xxx
   ├─ calculateSumCm(w,d,h) → sumCm
   ├─ getWeightBand(weightKg) → WBX/WBY/WBZ/WBH
   ├─ getSizeBand(sumCm) → SB1~SBX
   ├─ classifyModule(box) → 소형/중형/대형/UNCLASSIFIED
   ├─ CargoInfo 조립 (signature + fields)
   ├─ localStorage.setItem(CARGOS)
   └─ logCargoCreated() → 이벤트 기록
4. addCargoToDemand(currentDemandId, cargoInfo.id) [demandStore.ts]
5. setRegisteredCargos([...registeredCargos, registeredCargo])
```

---

## 4-8. 정합성 검사

| 문제 | 위치 | 심각도 |
|------|------|--------|
| `tempRequired` 불일치: IC13, IC41이 `isTempRequiredItem()`에서 누락 | `engine/regulation/regulationEngine.ts:278-281` | 중 |
| `StorageProduct.features[]`가 `FeatureCode` 타입이 아닌 한글 문자열 | `data/mockData.ts` | 중 |
| `price` 필드: mockData에 정의되어 있으나 실제 계산에 미사용 | `data/mockData.ts`, `types/models.ts` | 하 |
| `JEJU_LOCATIONS.id`와 `locationCode` 혼용 (getLocationName이 id 기반) | `components/Layout/ServiceConsole/ui/SearchResultModal.tsx:19-23` | 중 |
| 중복 코드: `ItemCode`가 data/bands.ts의 WeightBand/SizeBand와 함께 독립 코드셋으로 관리 | 설계상 의도적 분리 | - |

---

*근거 파일: `data/itemCodes.ts`, `data/bands.ts`, `data/featureCodes.ts`, `data/regionCodesJeju.ts`, `store/storageKeys.ts`, `store/id.ts`, `store/cargoStore.ts`, `store/eventLog.ts`, `types/models.ts`*


---


# [5] 데이터 모델 / 타입 / SoT (단일 진실 소스)

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 5/11: 데이터 모델 / 타입 / SoT

---

## 5-1. 요약

모든 타입 정의는 `src/types/models.ts` (628줄) 단일 파일에 집중되어 있다. 엔진 도메인 타입(`regulation/`, `resource/`, `matching/`)은 각 엔진 폴더에 별도 타입 파일을 둔다.

---

## 5-2. 타입 위치 정리

| 타입 종류 | 위치 |
|----------|------|
| UI / 상품 모델 | `src/types/models.ts` |
| 규정 엔진 타입 | `src/engine/regulation/regulationTypes.ts` |
| 자원 엔진 타입 | `src/engine/resource/resourceTypes.ts` |
| 매칭 파이프라인 타입 | `src/engine/matching/matchingPipelineTypes.ts` |
| WeightBand/SizeBand | `src/data/bands.ts` → re-export from `types/models.ts` |
| FeatureCode | `src/data/featureCodes.ts` → re-export from `types/models.ts` |

---

## 5-3. 핵심 타입 정의 (types/models.ts)

### StorageProduct

```typescript
interface StorageProduct {
  id: string
  location: Location & { region: string; regionCode: string }  // 법정동 코드 포함
  storageType: StorageType   // '상온' | '냉장' | '냉동'
  capacity: string           // 표시용 문자열 (예: "200평")
  price: number              // ⚠ legacy - 실제 계산에 미사용
  priceUnit: string          // ⚠ legacy
  features: FeatureCode[]   // F_xxx 코드 배열 (mockData는 한글 문자열 사용 중)
  // 규정 필드 (PR4)
  allowedItemCodes?: string[]
  maxWeightKg?: number
  maxSumCm?: number
  minCubes?: number
  tempSupported?: boolean
  hazmatSupported?: boolean
  allowedModuleClasses?: ModuleClassification[]
  // 자원 필드 (PR5)
  capacityCubes: number      // SoT: Pallet수 × 128
  remainingCubes: number     // SoT: 현재 잔여 큐브
  // 정산 필드 (PR7) ← 핵심 SoT
  unitPricePerCube: number   // SoT: ₩/Cube/일
  maxKgPerCube: number       // 1 Cube당 최대 허용 중량
  payloadCapacityKg?: number
  remainingPayloadKg?: number
  // 업체 정보 (PR7)
  provider: ProviderInfo
}
```

### RouteProduct

```typescript
interface RouteProduct {
  id: string
  origin: Location
  destination: Location
  originCode: string         // SoT: 출발지 법정동 코드
  destinationCode: string    // SoT: 도착지 법정동 코드
  schedule: string           // 표시용 (예: "매일 09:00")
  capacity: string           // 표시용 (예: "최대 2000큐브")
  vehicleType: string
  cargoTypes: CargoType[]
  price: number              // ⚠ legacy
  priceUnit: string          // ⚠ legacy
  routeScope: RouteScope     // 'INTRA_JEJU' | 'SEA'
  direction?: Direction      // 'INBOUND' | 'OUTBOUND' (SEA만)
  // 규정/자원/정산 필드 - StorageProduct와 동일 구조
  capacityCubes: number
  remainingCubes: number
  unitPricePerCube: number   // SoT: ₩/Cube
  maxKgPerCube: number
  provider: ProviderInfo
}
```

### DemandSession

```typescript
interface DemandSession {
  demandId: string
  ownerId: string
  serviceType: 'STORAGE' | 'ROUTE' | 'BOTH'
  order?: ServiceOrder
  cargoIds: string[]
  quantitiesByCargoId: Record<string, number>
  cubeResultByCargoId?: Record<string, { mode, cubes }>
  totalCubes?: number
  totalPallets?: number
  // 조건
  storageCondition?: StorageCondition
  transportCondition?: TransportCondition
  // 상태
  status: DemandStatus
  // PR5: 규정/자원 체크 결과
  regulationSummary?: { checked, passedOfferIds, failedOfferIdsCount }
  resourceSummary?: { checked, passedOfferIds, failedOfferIdsCount }
  // 메타
  createdAt: string
  updatedAt: string
}
```

### Deal (PR7)

```typescript
interface Deal {
  id: string
  demandId: string
  userId: string
  selectedStorageId?: string
  selectedRouteId?: string
  pickupRequested: boolean
  options: DealOption[]
  baseCost: number
  cubeCost: number
  weightCost: number
  optionsCost: number
  totalCost: number
  // 정산 breakdown
  volumeCubes?: number
  weightCubes?: number
  billableCubes?: number
  unitPricePerCube?: number
  weightSurchargeApplied?: boolean
  contractAgreed: boolean
  contractAgreedAt?: string
  status: DealStatus
  createdAt: string
  updatedAt: string
}
```

---

## 5-4. DTO 스냅샷 (현재 UI에서 실제 사용하는 형태)

### StorageProduct 예시 (mockData.ts 기반)

```json
{
  "id": "storage-01",
  "location": {
    "name": "한림읍 창고",
    "lat": 33.4144,
    "lng": 126.2661,
    "region": "한림읍",
    "regionCode": "5011025000"
  },
  "storageType": "상온",
  "capacity": "200평",
  "price": 50000,
  "priceUnit": "원/팔레트/일",
  "features": ["F_24H_INOUT", "F_FORKLIFT", "F_CCTV"],
  "capacityCubes": 5120,
  "remainingCubes": 5120,
  "unitPricePerCube": 450,
  "maxKgPerCube": 5,
  "maxWeightKg": 20,
  "maxSumCm": 170,
  "allowedItemCodes": [],
  "tempSupported": false,
  "hazmatSupported": false,
  "provider": {
    "id": "provider-01",
    "name": "제주 한림 물류센터",
    "serviceType": "보관",
    "verified": true,
    "contractTemplate": "표준 보관 계약서 v1.0"
  }
}
```

### RouteProduct 예시 (SPOT 타입)

```json
{
  "id": "route-01",
  "origin": { "name": "제주항", "lat": 33.5279, "lng": 126.5429 },
  "destination": { "name": "성산항", "lat": 33.4728, "lng": 126.9234 },
  "originCode": "JEJU_PORT",
  "destinationCode": "5013025900",
  "schedule": "매일 09:00",
  "capacity": "최대 500큐브",
  "vehicleType": "1톤 트럭",
  "cargoTypes": ["일반", "냉장"],
  "price": 80000,
  "priceUnit": "원/큐브",
  "routeScope": "INTRA_JEJU",
  "capacityCubes": 500,
  "remainingCubes": 500,
  "unitPricePerCube": 800,
  "maxKgPerCube": 5,
  "provider": {
    "id": "provider-02",
    "name": "제주 도내 운송",
    "serviceType": "운송",
    "verified": true
  }
}
```

### RouteProduct 예시 (SEA 타입)

```json
{
  "id": "route-sea-01",
  "origin": { "name": "제주항", "lat": 33.5279, "lng": 126.5429 },
  "destination": { "name": "부산항", "lat": 35.1019, "lng": 129.0403 },
  "originCode": "JEJU_PORT",
  "destinationCode": "BUSAN_PORT",
  "routeScope": "SEA",
  "direction": "OUTBOUND",
  "capacityCubes": 2000,
  "remainingCubes": 2000,
  "unitPricePerCube": 1200,
  "maxKgPerCube": 10,
  "schedule": "화/목/토 14:00"
}
```

### DemandSession 예시

```json
{
  "demandId": "demand_lz1234abcd...",
  "ownerId": "demo-user",
  "serviceType": "STORAGE",
  "cargoIds": ["cargo_lz5678...", "cargo_lz9012..."],
  "quantitiesByCargoId": {
    "cargo_lz5678...": 10,
    "cargo_lz9012...": 5
  },
  "totalCubes": 128,
  "totalPallets": 1,
  "storageCondition": {
    "location": "제주시",
    "locationCode": "5011000000",
    "startDate": "2026-03-01",
    "endDate": "2026-03-31"
  },
  "status": "SEARCHED",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:05:00Z"
}
```

### Deal 예시

```json
{
  "id": "deal_lzabcd...",
  "demandId": "demand_lz1234...",
  "userId": "demo-user",
  "selectedStorageId": "storage-01",
  "pickupRequested": false,
  "options": [{ "id": "OPT_INSURANCE", "name": "화물 보험", "price": 5000, "selected": true }],
  "baseCost": 57600,
  "cubeCost": 57600,
  "weightCost": 0,
  "optionsCost": 5000,
  "totalCost": 62600,
  "volumeCubes": 128,
  "weightCubes": 100,
  "billableCubes": 128,
  "unitPricePerCube": 450,
  "weightSurchargeApplied": false,
  "contractAgreed": true,
  "status": "CONFIRMED",
  "createdAt": "2026-02-19T11:00:00Z"
}
```

---

## 5-5. SoT (단일 진실 소스) 검증

| 필드 | SoT 위치 | derived 여부 | 비고 |
|------|----------|-------------|------|
| `unitPricePerCube` | `mockData.ts` (각 상품 정의) | Source | ✅ 실제 계산에 사용 |
| `capacityCubes` | `mockData.ts` (Pallet 수 × 128) | Source | ✅ |
| `remainingCubes` | `mockData.ts` (MVP: capacity와 동일) | Source | ⚠ 런타임 차감 없음 (새로고침 시 리셋) |
| `price` | `mockData.ts` | Source | ⚠ **미사용 (legacy)** |
| `totalCubes` | `computeDemand()` → `useServiceConsoleState` | Derived | ✅ |
| `billableCubes` | `calcBillableCubes()` → `DealPage.useMemo` | Derived | ✅ |
| `locationCode` | `StorageCondition.locationCode` | Source | ✅ RegionCode 일원화 |
| `originCode/destinationCode` | `TransportCondition.originCode/destinationCode` | Source | ✅ |
| `highlightedIds` | `SearchResultContext` (useMemo from previewResult) | Derived | ✅ |

### legacy `price` 필드 사용 여부 상세

- `StorageProduct.price`: mockData에 정의, 타입에도 있음
- 실제 계산에서 `unitPricePerCube`를 사용하고 `price`는 참조하지 않음
- `SearchResultModal.tsx`에서도 `unitPricePerCube` 표시
- → **`price` 필드는 dead field**: mockData와 types에서 제거 검토 필요

---

## 5-6. legacy/deprecated 타입 목록

| 타입/필드 | 위치 | 상태 |
|----------|------|------|
| `CargoUI.productCategory` | `types/models.ts:279` | deprecated (주석 있음) |
| `CargoUI.productSubCategory` | `types/models.ts:280` | deprecated |
| `CargoUI.weightRange` | `types/models.ts:282` | deprecated |
| `StorageProduct.price` | `types/models.ts:101` | legacy, 미사용 |
| `RouteProduct.price` | `types/models.ts:67` | legacy, 미사용 |
| `ModuleInput`, `ModuleInputs`, `StorageAreaSelection` | `types/models.ts:177-197` | PR3-2 레거시, 미사용 여부 확인 필요 |
| `BoxBasedAreaSelection` | `types/models.ts:243-253` | 레거시, 미사용 여부 확인 필요 |

---

*근거 파일: `src/types/models.ts`, `src/data/mockData.ts`, `src/engine/settlement/cubeSettlement.ts`*


---


# [6] 매칭 로직 분석

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 6/11: 매칭 로직

---

## 6-1. 요약

매칭 파이프라인은 `engine/matching/matchingPipeline.ts`의 `runMatchingPipeline()`이 **단일 진실 소스**다. 프리뷰(실시간)와 검색 결과(스냅샷)를 분리하여 각각 지도 하이라이트와 리스트 출력을 담당한다.

---

## 6-2. 매칭 전체 흐름

### INPUT → PROCESS → OUTPUT

```
INPUT:
  mode: 'STORAGE' | 'ROUTE'
  offers: StorageProduct[] | RouteProduct[]    ← mockData (STORAGE_PRODUCTS, ROUTE_PRODUCTS)
  session: {
    demandId?: string
    totalCubes: number
    totalPallets: number
    cargos: RegisteredCargo[]                 ← 화물 서명 + 수치
  }
  conditions: SearchConditions = {
    storageLocationCode?: string             ← RegionCode (법정동)
    storageLocation?: string                 ← 레거시 (이름 기반)
    startDate?: string
    endDate?: string
    originCode?: string
    destinationCode?: string
    origin?: string
    destination?: string
    transportDate?: string
  }
  sort: 'LATEST' | 'PRICE_ASC' | 'DISTANCE_ASC'

PIPELINE (순서 고정):
  1. 규정 체크 (화물 있을 때만)
     filterOffersByRegulation(cargos, offers, mode, demand)
     ↓
  2. 자원 체크 (totalCubes > 0일 때만)
     filterStorageByResource(passed, totalCubes)
     filterRouteByResource(passed, totalCubes)
     ↓
  3. 조건 필터
     filterStorageByConditions(passed, conditions)
     filterRouteByConditions(passed, conditions)
     ↓
  4. 정렬 (MVP: LATEST = id 역순)
     applySorting(filtered, sort)

OUTPUT:
  MatchingPipelineResult = {
    matchedOffers: T[]               ← 최종 결과 상품 목록
    matchedOfferIds: string[]        ← 지도 하이라이트용 ID 목록
    counts: {
      totalOffers: number
      afterRegulation: number
      afterResource: number
      afterConditions: number
    }
    meta: { mode, executedAt, sortApplied }
  }
```

---

## 6-3. 파이프라인 단계별 상세

### 단계 1: 규정 체크 (PR4)

- **함수**: `filterOffersByRegulation(cargos, offers, mode, demand)` → `checkRegulation()` 반복
- **체크 항목 (4대 기준)**:
  1. `cargo.sumCm > offer.maxSumCm` → SIZE_OVER_LIMIT
  2. `cargo.weightKg > offer.maxWeightKg` → WEIGHT_OVER_LIMIT
  3. `cargo.itemCode NOT IN offer.allowedItemCodes` → ITEM_NOT_ALLOWED
  4. `totalCubes < offer.minCubes` → MIN_QTY_NOT_MET
  - 추가: tempRequired, hazmatSupported, moduleClass 체크
- **스킵 조건**: `session.cargos.length === 0` → 규정/자원 체크 모두 스킵
- **결과**: `{ passed[], failed[] }`

### 단계 2: 자원 체크 (PR5)

- **함수**: `filterStorageByResource(passed, totalCubes)` → `checkResource()`
- **체크**: `offer.remainingCubes >= totalCubes`
- **스킵 조건**: `totalCubes === 0 || !totalCubes`
- **결과**: `{ passed[], failed[] }`

### 단계 3: 조건 필터 (PR6)

- **Storage**: `filterStorageByConditions(passed, conditions)`
  - locationCode 기반: `matchRegionCode(offer.location.regionCode, selectedCode)`
  - 계층 판단: `isDescendantRegion()` — 상위 선택 시 하위 포함
- **Route**: `filterRouteByConditions(passed, conditions)`
  - originCode + destinationCode 각각 체크 (AND 조건)
  - 빈 문자열 offerCode = 매칭 실패 (제주 외 지역 방어)
- **날짜 조건**: MVP에서는 실제 필터링 없음 (`hasDateConditions` 함수만 존재, 스텁)

### 단계 4: 정렬

- **LATEST** (기본): id 역순 (`b.id.localeCompare(a.id)`)
- **PRICE_ASC**: `a.price - b.price` (레거시 price 필드 사용 — **버그 가능성**)
- **DISTANCE_ASC**: 스텁 (정렬 없이 반환)

---

## 6-4. SearchResultContext 집중 분석

```
┌─────────────────────────────────────────────────────┐
│  SearchResultProvider (App.tsx 최상위)               │
│                                                     │
│  State:                                             │
│    previewResult: PreviewResultData | null          │
│    searchResult: SearchResultData | null            │
│                                                     │
│  Computed:                                          │
│    highlightedIds = useMemo(                        │
│      () => new Set(previewResult?.matchedOfferIds), │
│      [previewResult]                                │
│    )                                                │
│                                                     │
│  구독 컴포넌트:                                      │
│    - CommandLayout.tsx (highlightedIds, previewResult)│
│    - ServiceConsole.tsx (searchResult)              │
│    - useServiceConsoleState.ts (setPreviewResult,   │
│                                  setSearchResult)   │
└─────────────────────────────────────────────────────┘
```

### state 구조

| 상태 | 타입 | 업데이트 주체 | 역할 |
|------|------|-------------|------|
| `previewResult` | `PreviewResultData | null` | `useServiceConsoleState` useMemo → useEffect | 실시간 하이라이트 |
| `searchResult` | `SearchResultData | null` | `handleSearch()` (검색 버튼 클릭) | 검색 결과 리스트 |
| `highlightedIds` | `Set<string>` | `useMemo(previewResult)` | 지도 마커 하이라이트 |

### 업데이트 흐름

```
[조건/화물 변경]
  → previewMatch (useMemo) 재계산 [useServiceConsoleState.ts:218]
  → hasCargoOrCondition 체크
  → setPreviewResult() [useServiceConsoleState.ts:321]
  → SearchResultContext.previewResult 업데이트
  → highlightedIds 재계산 (useMemo)
  → CommandLayout.useEffect 실행 → DOM 마커 업데이트

[검색 버튼 클릭]
  → handleSearch() [useServiceConsoleState.ts:570]
  → previewMatch를 스냅샷으로 변환
  → setSearchResult() → SearchResultContext.searchResult 업데이트
  → ServiceConsole.tsx의 searchResult 기반으로 SearchResultModal 렌더링
```

---

## 6-5. ProductCard 클릭 흐름

```
SearchResultModal에서 상품 선택:
  onSelect() 클릭 → onSelectStorage(product.id) / onSelectRoute(product.id)
  → useServiceConsoleState.selectStorage(id) / selectRoute(id)
  → state.selectedStorageId / selectedRouteId 업데이트

SearchResultModal 하단 "거래 진행" 버튼:
  onStartDeal() 클릭
  → ServiceConsole.handleStartDeal()
  → setIsModalOpen(false) + setIsDealPageOpen(true)

DealPage:
  storageProduct = STORAGE_PRODUCTS.find(p => p.id === selectedStorageId)
  routeProduct = ROUTE_PRODUCTS.find(p => p.id === selectedRouteId)
```

---

## 6-6. Matching Trace Log (이벤트별 함수 호출 순서)

### A. 필터(조건) 변경 시

```
1. LocationDropdown.onChange()
2. actions.updateStorageCondition({ location, locationCode })
3. useServiceConsoleState.setStorageCondition(newCondition)
4. setStorageConditionInStore(currentDemandId, updates)     [store]
5. previewMatch useMemo 트리거 (storageCondition 의존)
6. runMatchingPipeline({ mode:'STORAGE', ... })
7. filterStorageByConditions() → matchedOfferIds 갱신
8. useEffect([previewMatch]) 트리거
9. setPreviewResult({ matchedOfferIds, updatedAt })
10. SearchResultContext.previewResult 업데이트
11. highlightedIds useMemo 재계산
12. CommandLayout useEffect([highlightedIds]) 트리거
13. DOM .pallet-marker 탐색 → 하이라이트 마커 추가/제거
```

**상태 변화**:
- `storageCondition.locationCode`: 없음 → '5011000000'
- `previewResult.matchedOfferIds`: 8개 → 3개 (예: 제주시 창고만)
- `highlightedIds`: Set(8) → Set(3)

### B. 검색 버튼 클릭 시

```
1. SearchButton.onClick()
2. handleSearchClick() [ServiceConsole.tsx:102]
3. actions.handleSearch()
4. logDemandSessionCreated(currentDemandId, ...)             [store]
5. searchResult = { ...previewMatch, searchedAt }
6. setSearchResultLocal(result)
7. setSearchResultContext(result)                            [context]
8. logResourceChecked(currentDemandId, ...)                 [store]
9. recordSearchExecution(currentDemandId, ...)              [store]
10. setIsModalOpen(true)
11. SearchResultModal 렌더링 (searchResult 기반)
```

**상태 변화**:
- `searchResult`: null → { storageProducts:3, routeProducts:0, ... }
- `isModalOpen`: false → true

### C. 마커 클릭 흐름 (현재 미구현)

현재 Mapbox 마커 클릭 이벤트가 ProductDetail 연동으로 구현되어 있지 않다. `useMapLayers.ts`에서 마커 렌더링만 하고, 클릭 핸들러가 없다. → **미구현 기능**

---

## 6-7. 지도 ↔ 리스트 연동 불안정 원인 분석

| 원인 | 구체적 내용 | 위치 |
|------|-----------|------|
| DOM 직접 조작 의존 | `querySelectorAll('.pallet-marker')`로 마커를 탐색해 하이라이트. React 상태 기반이 아님. | `CommandLayout.tsx:48-62` |
| 마커 생성 타이밍 | 지도 마커가 생성되기 전에 `highlightedIds`가 업데이트되면 하이라이트 누락 가능 | `useMapLayers.ts` vs `CommandLayout.tsx` |
| previewResult null 처리 | 조건 없을 때 null이지만, 마커는 여전히 기본 표시 (불일치 없음) | `CommandLayout.tsx:45` |
| PRICE_ASC 정렬 | 레거시 `price` 필드 기반 정렬 → `unitPricePerCube`로 정렬해야 함 | `matchingPipeline.ts:307` |

---

## 6-8. SearchResult 관련 타입 중복 주의

`useServiceConsoleState.ts`에 `SearchResult` 타입이 로컬로 정의되어 있고, `SearchResultContext.tsx`에는 `SearchResultData` 타입이 별도로 정의되어 있다.

```typescript
// useServiceConsoleState.ts:71
export interface SearchResult {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  counts: PipelineCounts
  searchedAt: string
}

// SearchResultContext.tsx:18
export interface SearchResultData {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  counts: PipelineCounts
  searchedAt: string
}
```

두 타입은 구조가 동일하나 이름이 다르다. → **통합 검토 필요**

---

*근거 파일: `engine/matching/matchingPipeline.ts`, `engine/matching/conditionFilters.ts`, `contexts/SearchResultContext.tsx`, `components/Layout/ServiceConsole/hooks/useServiceConsoleState.ts`, `components/Layout/ServiceConsole/ServiceConsole.tsx`, `components/Layout/CommandLayout.tsx`*


---


# [7] 레이어 구조 (규정/자원/조건/거래)

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 7/11: 레이어 구조

---

## 7-1. 시스템 레이어 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (React Components)                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ServiceConsole → useServiceConsoleState              │   │
│  │ SearchResultModal → ProductDetailModal → DealPage    │   │
│  │ MapboxContainer → CommandLayout (하이라이트)         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Context Layer                                              │
│  SearchResultProvider (previewResult, searchResult, highlights)│
├─────────────────────────────────────────────────────────────┤
│  Matching Pipeline (Single Source of Truth)                 │
│  runMatchingPipeline()                                      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │ Regulation│→│ Resource  │→│ Condition │→│  Sorting  │  │
│  │  Layer    │ │  Layer    │ │  Layer    │ │  (LATEST) │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Trade Layer (PR7)                                          │
│  DealPage → cubeSettlement → allocateResource → dealStore   │
├─────────────────────────────────────────────────────────────┤
│  Store Layer (localStorage)                                 │
│  cargoStore, demandStore, dealStore, eventLog               │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  mockData (StorageProduct×8, RouteProduct×8)                │
│  itemCodes, bands, featureCodes, regionCodes                │
└─────────────────────────────────────────────────────────────┘
```

---

## 7-2. Regulation Layer (규정 레이어)

### 데이터 구조

```typescript
// 규정 필드 (각 상품에 포함)
interface OfferRegulationFields {
  allowedItemCodes?: string[]       // 허용 품목 (없으면 전체)
  maxWeightKg?: number              // 최대 중량 (default: 20kg)
  maxSumCm?: number                 // 최대 3변합 (default: 170cm)
  minCubes?: number                 // 최소 물량 (default: 0)
  tempSupported?: boolean           // 냉장/냉동 지원
  hazmatSupported?: boolean         // 위험물 지원
  allowedModuleClasses?: ModuleClassification[]
}

// 규정 체크 결과
interface RegulationDecision {
  pass: boolean
  reasons: RegulationReason[]       // SIZE_OVER_LIMIT | WEIGHT_OVER_LIMIT | ...
  signature: {
    cargo: CargoSignature
    offer: OfferSignature
    matchedKeys: string[]
  }
}
```

### 로직

| 규정 | 체크 방법 | 기본값 |
|------|----------|--------|
| 규격 제한 | `cargo.sumCm > offer.maxSumCm` | 170cm |
| 중량 제한 | `cargo.weightKg > offer.maxWeightKg` | 20kg |
| 품목 제한 | `cargo.itemCode NOT IN offer.allowedItemCodes` | 전체 허용 (IC34 제외) |
| 최소 물량 | `totalCubes < offer.minCubes` | 0 (스킵) |
| 온도 | `cargo.requiresTemp && !offer.tempSupported` | false |
| 위험물 | `cargo.isHazmat && !offer.hazmatSupported` | false |
| 포장 모듈 | `cargo.moduleClass NOT IN offer.allowedModuleClasses` | 전체 허용 |

### UI 연결

- `CargoRegistrationCard.tsx`: 화물 입력 → `completeCargo()` → `checkQuickRulesWithLogging()`
- 현재 UI에서 규정 위반 경고는 이벤트 로그에만 기록, UI 표시 없음 (콘솔 로그만)

### DB 테이블 후보 (백엔드 전환 시)

```sql
-- 상품 규정 테이블
TABLE offer_regulations (
  offer_id VARCHAR PK FK → offers.id,
  allowed_item_codes TEXT[],
  max_weight_kg DECIMAL,
  max_sum_cm DECIMAL,
  min_cubes INTEGER,
  temp_supported BOOLEAN,
  hazmat_supported BOOLEAN
)
```

---

## 7-3. Resource Layer (자원 레이어)

### 데이터 구조

```typescript
// 자원 필드 (각 상품에 포함)
interface ResourceFields {
  capacityCubes: number       // 총 수용 가능 큐브 (정수)
  remainingCubes: number      // 현재 남은 큐브
  payloadCapacityKg?: number  // 총 하중 용량 (선택)
  remainingPayloadKg?: number // 남은 하중 재고 (선택)
  maxKgPerCube: number        // 1 Cube당 최대 허용 중량
}

// 자원 체크 결과
interface ResourceCheckResult {
  pass: boolean
  reason?: 'INSUFFICIENT_CAPACITY' | 'INSUFFICIENT_PAYLOAD'
}
```

### 로직

- **조건**: `offer.remainingCubes >= demand.totalCubes`
- **스킵**: `totalCubes === 0`
- **PR7 재고 차감**: `allocateResource({ offerId, billableCubes })` → localStorage에 기록

### UI 연결

- `DealPage.tsx:226-300`: `handleConfirmDeal()` → `allocateResource()` 호출
- **현재 상태**: mockData 배열을 직접 수정하지 않음 → 새로고침 시 재고 복원

### DB 테이블 후보

```sql
-- 상품 재고 테이블 (별도 관리)
TABLE offer_inventory (
  offer_id VARCHAR PK FK → offers.id,
  capacity_cubes INTEGER NOT NULL,
  remaining_cubes INTEGER NOT NULL,
  payload_capacity_kg DECIMAL,
  remaining_payload_kg DECIMAL,
  updated_at TIMESTAMP
)
```

---

## 7-4. Condition Layer (조건 레이어)

### 데이터 구조

```typescript
interface StorageCondition {
  location?: string         // 표시용 (레거시)
  locationCode?: RegionCode // 필터링 SoT (10자리 법정동 코드)
  startDate?: string
  endDate?: string
}

interface TransportCondition {
  origin?: string
  originCode?: RegionCode
  destination?: string
  destinationCode?: RegionCode
  transportDate?: string
}
```

### 로직

| 조건 | Storage | Route |
|------|---------|-------|
| 지역 | `matchRegionCode(offer.location.regionCode, locationCode)` | originCode AND destinationCode |
| 날짜 | 스텁 (실제 필터링 없음) | 스텁 (실제 필터링 없음) |
| 계층 | 상위 선택 시 하위 포함 (`isDescendantRegion()`) | 동일 |

**주의**: 날짜 필터는 MVP에서 `hasDateConditions()`만 체크하고 실제 오퍼의 가용 날짜와 비교하지 않는다. → DB 설계 시 `offers.available_from`, `offers.available_to` 필드 필요.

### UI 연결

- `LocationDropdown.tsx`: 지역 선택 → `locationCode` 전달
- `DatePicker.tsx`: 날짜 선택 → `startDate/endDate/transportDate` 전달
- `SearchResultModal.ConditionSummary`: 입력 조건 요약 표시

---

## 7-5. Trade Layer (거래 레이어, PR7)

### 데이터 구조

```typescript
interface Deal {
  id: string                    // deal_{ULID}
  demandId: string              // 연결된 DemandSession
  selectedStorageId?: string    // 선택한 Storage 상품 ID
  selectedRouteId?: string      // 선택한 Route 상품 ID
  // 비용
  baseCost, cubeCost, weightCost, optionsCost, totalCost: number
  // 정산 breakdown
  volumeCubes, weightCubes, billableCubes?: number
  unitPricePerCube?: number
  // 계약
  contractAgreed: boolean
  status: 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'CANCELLED'
}
```

### 로직 흐름

```
1. SearchResultModal: 상품 선택 (selectedStorageId, selectedRouteId)
2. DealPage: 거래 신청서 작성
   - calcBillableCubes() → max(volumeCubes, weightCubes)
   - calcEstimatedTotal() / calcStorageEstimate()
3. contractAgreed 체크
4. handleConfirmDeal():
   a. logDealConfirmed()
   b. allocateResource() (재고 차감)
   c. logSettlementCalculated()
   d. logResourceAllocated()
```

### UI 연결

- `DealPage.tsx`: 8개 섹션 (사용자정보/화물요약/옵션/비용/메모/동의/확정)
- `dealStore.ts`: `createDeal()`, `updateDealStatus()`, `agreeToDealContract()`
- **현재 미완**: Deal이 localStorage에 저장되지만 UI에서 조회하는 기능 없음

### DB 테이블 후보

```sql
TABLE deals (
  id VARCHAR PK,
  demand_id VARCHAR FK → demand_sessions.demand_id,
  user_id VARCHAR FK → users.id,
  selected_storage_id VARCHAR FK → offers.id,
  selected_route_id VARCHAR FK → offers.id,
  status VARCHAR CHECK IN ('DRAFT','SUBMITTED','CONFIRMED','CANCELLED'),
  total_cost DECIMAL,
  billable_cubes INTEGER,
  unit_price_per_cube DECIMAL,
  contract_agreed BOOLEAN,
  contract_agreed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## 7-6. 전체 레이어 간 데이터 흐름 요약

```
[mockData]
  STORAGE_PRODUCTS[], ROUTE_PRODUCTS[]
      ↓
[Regulation Layer]
  filterOffersByRegulation() → regulationPassed[]
      ↓
[Resource Layer]
  filterStorageByResource() → resourcePassed[]
      ↓
[Condition Layer]
  filterStorageByConditions() → conditionPassed[]
      ↓
[Matching Result]
  matchedOffers[], matchedOfferIds[]
      ↓
[SearchResultContext]
  previewResult → highlightedIds (지도)
  searchResult → SearchResultModal (리스트)
      ↓
[Trade Layer]
  selectedProductId → DealPage → Deal
      ↓
[Store Layer]
  dealStore.createDeal()
  eventLog.logDealConfirmed()
  resourceAllocation.allocateResource()
```

---

*근거 파일: `engine/regulation/regulationEngine.ts`, `engine/resource/resourceEngine.ts`, `engine/resource/resourceAllocation.ts`, `engine/matching/conditionFilters.ts`, `engine/settlement/cubeSettlement.ts`, `store/dealStore.ts`, `components/Layout/ServiceConsole/ui/DealPage.tsx`*


---


# [8] 상품 등록 페이지 연결 분석

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 8/11: 상품 등록 페이지 연결 분석

---

## 8-1. 요약

현재 MVP에는 **상품 등록 페이지가 없다**. 모든 StorageProduct/RouteProduct는 `src/data/mockData.ts`에 하드코딩되어 있다. 이 섹션은 거래 페이지(DealPage)가 실제로 요구하는 최소 데이터 스키마를 역추적하여, 향후 상품 등록 페이지 구현 시 필요한 필드와 충돌 지점을 분석한다.

---

## 8-2. 거래 페이지(DealPage)가 요구하는 최소 데이터

### DealPage props 인터페이스 (`DealPage.tsx:44-56`)

```typescript
interface DealPageProps {
  isOpen: boolean
  onClose: () => void
  activeTab: ServiceType               // 'STORAGE' | 'ROUTE' | 'BOTH'
  storageProduct?: StorageProduct      // 선택된 보관 상품
  routeProduct?: RouteProduct          // 선택된 운송 상품
  registeredCargos: RegisteredCargo[]  // 등록된 화물 목록
  totalCubes: number                   // 총 수요 큐브
  totalPallets: number                 // 총 팔레트 수
  storageCondition: StorageCondition   // 보관 조건 (기간 포함)
  transportCondition: TransportCondition // 운송 조건
  onDealComplete?: () => void
}
```

### StorageProduct 필수 필드 (비용 계산에 실제 사용되는 것만)

| 필드 | 타입 | 사용 위치 | 역할 |
|------|------|----------|------|
| `id` | string | `DealPage:allocateResource()` | 재고 차감 대상 식별 |
| `unitPricePerCube` | number | `DealPage:costCalculation(useMemo)` | 큐브 단가 계산 SoT |
| `maxKgPerCube` | number | `calcBillableCubes()` | 중량 환산 큐브 계산 |
| `remainingCubes` | number | `filterStorageByResource()` | 매칭 자원 체크 |
| `capacityCubes` | number | `ProductDetailModal:용량 게이지` | 용량 표시 |
| `location.name` | string | `DealPage:화물 정보 섹션` | UI 표시 |
| `location.lat/lng` | number | `useMapLayers.ts` | 지도 마커 |
| `location.regionCode` | string | `filterStorageByConditions()` | 조건 필터 |
| `provider.name` | string | `ProductDetailModal:업체 정보` | UI 표시 |
| `provider.verified` | boolean | `ProductDetailModal` | 인증 마크 표시 |

### RouteProduct 필수 필드

| 필드 | 타입 | 사용 위치 | 역할 |
|------|------|----------|------|
| `id` | string | `allocateResource()` | 재고 차감 식별 |
| `unitPricePerCube` | number | `calcEstimatedTotal()` | 단가 계산 |
| `maxKgPerCube` | number | `calcBillableCubes()` | 중량 환산 |
| `remainingCubes` | number | `filterRouteByResource()` | 자원 체크 |
| `capacityCubes` | number | `ProductDetailModal` | 표시용 |
| `origin.name` | string | `DealPage, SearchResultModal` | UI 표시 |
| `destination.name` | string | 동일 | UI 표시 |
| `originCode` | string | `filterRouteByConditions()` | 조건 필터 |
| `destinationCode` | string | 동일 | 조건 필터 |
| `routeScope` | 'INTRA_JEJU' \| 'SEA' | `SearchResultModal` | 탭 분류 |
| `provider.name` | string | `ProductDetailModal` | UI 표시 |

---

## 8-3. 등록 페이지가 생성해야 할 전체 데이터 구조

### StorageProduct 전체 필드 (등록 폼 관점)

```typescript
// 필수 (매칭/거래 필수)
interface StorageProductRequired {
  // 위치 정보
  location: {
    name: string          // 창고명 (UI 표시)
    lat: number           // 위도 (지도 마커)
    lng: number           // 경도 (지도 마커)
    region: string        // 지역명 (표시용)
    regionCode: string    // 법정동 코드 10자리 (필터링 SoT)
  }

  // 상품 기본
  storageType: '상온' | '냉장' | '냉동'
  capacity: string        // 표시용 (예: "200평")

  // 자원 필드 (필수)
  capacityCubes: number   // 총 큐브 = Pallet 수 × 128
  remainingCubes: number  // 초기값 = capacityCubes

  // 정산 필드 (필수)
  unitPricePerCube: number // ₩/Cube/일 — 계산 SoT
  maxKgPerCube: number     // 1 Cube당 최대 허용 중량

  // 업체 정보 (필수)
  provider: {
    id: string
    name: string
    serviceType: string
    verified: boolean
    contractTemplate?: string
  }
}

// 선택 (규정 엔진용)
interface StorageProductOptional {
  allowedItemCodes?: string[]          // 없으면 전체 허용 (IC34 제외)
  maxWeightKg?: number                 // 없으면 20kg 기본
  maxSumCm?: number                    // 없으면 170cm 기본
  minCubes?: number                    // 없으면 0 (체크 스킵)
  tempSupported?: boolean
  hazmatSupported?: boolean
  allowedModuleClasses?: ModuleClassification[]
  payloadCapacityKg?: number
  remainingPayloadKg?: number

  // UI 표시용
  features: FeatureCode[]              // F_xxx 코드 배열 (현재 mockData는 한글 문자열)
}
```

### RouteProduct 전체 필드 (등록 폼 관점)

```typescript
// 필수
interface RouteProductRequired {
  origin: { name: string; lat: number; lng: number }
  destination: { name: string; lat: number; lng: number }
  originCode: string          // 법정동 코드 (필터링 SoT)
  destinationCode: string     // 법정동 코드 (필터링 SoT)
  schedule: string            // 표시용 (예: "매일 09:00")
  capacity: string            // 표시용 (예: "최대 500큐브")
  vehicleType: string
  cargoTypes: CargoType[]
  routeScope: 'INTRA_JEJU' | 'SEA'
  direction?: 'INBOUND' | 'OUTBOUND' // SEA만 필요

  capacityCubes: number
  remainingCubes: number
  unitPricePerCube: number
  maxKgPerCube: number
  provider: ProviderInfo
}
```

---

## 8-4. Storage vs Route 필수 필드 비교

| 필드 그룹 | Storage | Route | 비고 |
|----------|---------|-------|------|
| ID 체계 | `storage-{n}` | `route-{n}`, `route-sea-{n}` | mockData 패턴 |
| 위치 | 단일 `location` (regionCode) | `origin` + `destination` (각각 코드) | Route는 2개 지점 |
| 지도 마커 좌표 | `location.lat/lng` | `origin.lat/lng` (출발지 기준) | 지도 레이어 확인 필요 |
| 지역 필터 코드 | `location.regionCode` | `originCode` + `destinationCode` | AND 조건 |
| 범위 구분 | `storageType` (온도) | `routeScope` + `direction` | 별도 분류 체계 |
| 용량 계산 | Pallet 수 × 128 | 직접 설정 (차량 기반) | 계산 방식 차이 |
| 단가 의미 | ₩/Cube/**일** | ₩/Cube | 기간 배수 유무 |
| 정산 함수 | `calcStorageEstimate(cubes, price, days)` | `calcEstimatedTotal(cubes, price)` | days 파라미터 |

---

## 8-5. 등록 → 거래 충돌 가능성 분석

### 충돌 1: legacy `price` 필드

- **현황**: `StorageProduct.price`, `RouteProduct.price` 필드가 타입에 존재하나 실제 계산에서 미사용
- **`matchingPipeline.ts:307`**: `PRICE_ASC` 정렬이 여전히 legacy `price` 필드를 사용
- **충돌**: 등록 페이지에서 `unitPricePerCube`만 입력받고 `price` 미입력 시 정렬 깨짐
- **해결책**: `price` 필드 제거 또는 `PRICE_ASC` 정렬을 `unitPricePerCube` 기준으로 수정

### 충돌 2: `features` 필드 타입 불일치

- **현황**: `StorageProduct.features: FeatureCode[]` (타입은 F_xxx 코드)
- **mockData 실제값**: `["F_24H_INOUT", "F_FORKLIFT", "F_CCTV"]` — 타입 맞게 사용 중
- **주의**: `ProductDetailModal.tsx:83`에서 `feature`를 직접 렌더링하므로 등록 페이지에서 한글 입력 시 그대로 노출
- **해결책**: 등록 폼에서 FeatureCode 드롭다운 제공 필요

### 충돌 3: `regionCode` 체계

- **현황**: `filterStorageByConditions()`는 `offer.location.regionCode`를 10자리 법정동 코드로 기대
- **mockData**: `"5011025000"` (한림읍), `"5011000000"` (제주시) 등 정확히 매핑
- **충돌**: 등록 페이지에서 자유 텍스트 지역 입력 시 매칭 실패 (빈 문자열 offerCode 방어 로직 존재)
- **해결책**: 등록 폼에 `LocationDropdown` 컴포넌트 재사용하여 법정동 코드 자동 매핑

### 충돌 4: `capacityCubes` 계산 방식

- **Storage**: `capacityCubes = Pallet 수 × 128` — 등록 시 팔레트 수 입력 → 자동 계산 필요
- **Route**: `capacityCubes` 직접 입력 (차량 적재 용량 기반)
- **충돌**: 동일 필드명이지만 계산 방식이 다름 → 등록 폼에서 분기 처리 필요

### 충돌 5: `remainingCubes` 초기값

- **현황**: mockData에서 `remainingCubes = capacityCubes` (초기 = 만재)
- **실제**: 등록 시점에 이미 일부 사용 중일 수 있음
- **현재 문제**: `allocateResource()`가 localStorage에만 차감 기록, mockData는 리셋되지 않음
- **충돌**: 등록 후 거래가 발생해도 다음 세션에서 `remainingCubes`가 원복됨 → DB 없이는 해결 불가

### 충돌 6: `provider.contractTemplate` 미사용

- **현황**: `StorageProduct.provider.contractTemplate?: string` 타입에 존재 (`"표준 보관 계약서 v1.0"`)
- **DealPage**: 계약서 내용이 하드코딩 (DealPage.tsx:658 이하)
- **충돌**: 등록 페이지에서 계약서 입력받아도 거래 시 반영 안 됨

---

## 8-6. 등록 페이지 구현 시 최소 요구사항 (우선순위 순)

| 우선순위 | 항목 | 이유 |
|---------|------|------|
| 1 | `unitPricePerCube` 입력 필수 | 거래 비용 계산 SoT |
| 2 | `regionCode` / `originCode` / `destinationCode` 선택 필수 | 매칭 조건 필터 SoT |
| 3 | `capacityCubes` / `remainingCubes` 설정 | 자원 체크 SoT |
| 4 | `maxKgPerCube` 설정 | 중량 환산 큐브 계산 |
| 5 | `provider` 정보 (name, verified) | ProductDetailModal 표시 |
| 6 | 규정 필드 (maxWeightKg, maxSumCm 등) | 규정 엔진 필터링 |
| 7 | `features` 코드셋 선택 | UI 표시 전용 |

---

## 8-7. 화물 등록(CargoRegistrationCard) vs 상품 등록의 차이

| 구분 | 화물 등록 (수요측) | 상품 등록 (공급측) |
|------|-----------------|-----------------|
| 위치 | `CargoRegistrationCard.tsx` | 미구현 |
| 입력 주체 | 화주 (물건 보내는 사람) | 창고/운송 업체 |
| 저장소 | `cargoStore.ts` (localStorage) | 미구현 (mockData) |
| 핵심 데이터 | `width/depth/height/itemCode/weightKg` | `unitPricePerCube/regionCode/capacityCubes` |
| 코드 체계 | ItemCode (ICxx), WeightBand, SizeBand | FeatureCode (F_xxx), RegionCode |
| 엔진 연결 | `classifyModule()`, `computeDemand()` | 직접 매칭 파이프라인 입력 |

---

*근거 파일: `components/Layout/ServiceConsole/ui/DealPage.tsx`, `components/Layout/ServiceConsole/ui/CargoRegistrationCard.tsx`, `data/mockData.ts`, `types/models.ts`, `engine/matching/matchingPipeline.ts`, `engine/regulation/regulationEngine.ts`*


---


# [9] 페이지 구조 및 라우팅 설계

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 9/11: 페이지 구조 및 라우팅 설계

---

## 9-1. 현재 SPA 구조 개요

### 라우터 현황

```
package.json → react-router-dom: 없음
```

**react-router-dom이 설치되어 있지 않다.** URL 기반 라우팅이 전혀 없으며, 앱 전체가 단일 `index.html` → 단일 `App.tsx` → 단일 `CommandLayout.tsx`로 구성된 완전한 SPA이다.

### 마운트 트리

```
main.tsx
└── <React.StrictMode>
    └── <App />
        └── <SearchResultProvider>       ← 전역 Context (검색 결과 공유)
            └── <CommandLayout />        ← 45%/55% 고정 그리드 레이아웃
                ├── <ServiceConsole />   ← 왼쪽 45% (화물등록, 조건입력, 검색)
                │   ├── <StorageTabSection />
                │   ├── <TransportTabSection />
                │   └── <BothTabSection />
                │       └── (공통 모달들)
                │           ├── <SearchResultModal />
                │           ├── <DealPage />
                │           └── <ProductDetailModal />
                └── <MapboxContainer />  ← 오른쪽 55% (Mapbox + 마커)
                    └── <HeaderWidget />
```

---

## 9-2. 화면 전환 메커니즘 (라우팅 대신 상태)

라우팅이 없으므로 모든 "화면 전환"은 React state와 조건부 렌더링으로 구현된다.

### 9-2-1. 탭 전환 (ServiceType)

```typescript
// useServiceConsoleState.ts:46
export type ServiceType = 'storage' | 'transport' | 'both'

// ServiceConsole.tsx에서 activeTab 상태로 탭 분기
{activeTab === 'storage' && <StorageTabSection />}
{activeTab === 'transport' && <TransportTabSection />}
{activeTab === 'both' && <BothTabSection />}
```

| 탭 | 값 | 렌더링 컴포넌트 |
|----|----|---------------|
| 보관 | `'storage'` | `StorageTabSection.tsx` |
| 운송 | `'transport'` | `TransportTabSection.tsx` |
| 보관+운송 | `'both'` | `BothTabSection.tsx` |

### 9-2-2. 플로우 단계 전환 (FlowStep)

```typescript
// useServiceConsoleState.ts:49
export type FlowStep = 'cargo-registration' | 'quantity-input' | 'condition-input'
```

한 탭 내에서 3단계를 순차 진행:

```
cargo-registration  →  quantity-input  →  condition-input
   (화물 등록)          (수량 입력)         (조건 입력 + 검색)
```

각 탭 섹션 내부에서 `currentStep`에 따라 조건부 렌더링:
```tsx
{currentStep === 'cargo-registration' && <CargoRegistrationCard />}
{currentStep === 'quantity-input' && <QuantityInputCard />}
{currentStep === 'condition-input' && <StorageConditionForm />}
```

### 9-2-3. 모달 스택 (오버레이 레이어)

```
(배경) CommandLayout
  ↓ overlay z-50
  SearchResultModal      ← 검색 결과 리스트
    ↓ overlay z-50
    ProductDetailModal   ← 상품 상세 보기
      ↓ (선택 후 닫기)
    DealPage             ← 거래 신청 폼 (전체화면 오버레이)
      ↓ overlay z-50
      ContractModal      ← 계약서 동의 (DealPage 내부 z-50)
```

**모달 트리거 상태:**
```typescript
// ServiceConsole 레벨
isSearchResultOpen: boolean
isDealPageOpen: boolean

// DealPage 내부
showContractModal: boolean
showConfirmCard: boolean
```

모달 간 전환은 URL 변경 없이 순수 boolean 플래그로 제어된다.

---

## 9-3. 실제 "페이지" 역할 컴포넌트 목록

URL은 하나지만 논리적으로 다음 화면들이 존재한다:

| 논리적 화면 | 구현 방식 | 트리거 |
|------------|---------|--------|
| 메인 (탐색) | 기본 렌더링 | 최초 진입 |
| 보관 탐색 | `activeTab='storage'` | 탭 클릭 |
| 운송 탐색 | `activeTab='transport'` | 탭 클릭 |
| 보관+운송 탐색 | `activeTab='both'` | 탭 클릭 |
| 화물 등록 | `currentStep='cargo-registration'` | 내부 상태 |
| 수량 입력 | `currentStep='quantity-input'` | 내부 상태 |
| 조건 입력 | `currentStep='condition-input'` | 내부 상태 |
| 검색 결과 | `isSearchResultOpen=true` | 검색 버튼 |
| 상품 상세 | `isDetailOpen=true` | 상품 카드 클릭 |
| 거래 신청 | `isDealPageOpen=true` | "이 상품 선택" |
| 계약서 동의 | DealPage 내 `showContractModal=true` | 거래 신청 버튼 |
| 거래 완료 | DealPage 내 `showConfirmCard=true` | 계약 동의 후 |

---

## 9-4. 현재 구조의 제약사항

### 제약 1: URL 공유 불가

어느 상태에 있든 URL은 항상 `/`이다. 검색 결과나 특정 상품을 URL로 공유할 수 없다.

```
현재: https://integral-mvp.com/ (모든 상태 동일)
이상: https://integral-mvp.com/search?type=storage&location=5011000000
```

### 제약 2: 브라우저 히스토리 없음

`뒤로 가기` 버튼이 앱 내 이전 상태로 돌아가지 않는다. 모달을 닫는 행위가 히스토리에 기록되지 않으므로, 뒤로 가기 시 사이트 자체를 이탈한다.

### 제약 3: 새로고침 시 상태 초기화

현재 탭, FlowStep, 화물 등록 상태가 모두 초기화된다. localStorage에 저장된 cargoStore/demandStore는 유지되지만 UI 상태는 리셋된다.

### 제약 4: 모달 중첩 깊이

최대 4단계(배경 → SearchResultModal → DealPage → ContractModal)의 중첩이 발생하며, z-index가 모두 `z-50`으로 동일하여 중첩 계층 충돌 위험이 있다.

---

## 9-5. 라우팅 추가 시 영향 분석

### 9-5-1. 라우팅 추가 필요 시점

| 기능 요구사항 | 라우팅 필요 여부 |
|-------------|---------------|
| 상품 등록 페이지 분리 | **필요** (별도 URL: `/register`) |
| 거래 내역 페이지 | **필요** (`/deals`, `/deals/:id`) |
| 관리자 대시보드 | **필요** (`/admin`) |
| 현재 검색/거래 플로우 | 불필요 (현재대로 모달 유지 가능) |

### 9-5-2. 라우팅 도입 시 변경 필요 지점

**1. App.tsx**
```tsx
// 변경 전
<SearchResultProvider>
  <CommandLayout />
</SearchResultProvider>

// 변경 후 (react-router-dom v6 기준)
<BrowserRouter>
  <SearchResultProvider>
    <Routes>
      <Route path="/" element={<CommandLayout />} />
      <Route path="/register" element={<ProductRegistrationPage />} />
      <Route path="/deals" element={<DealsPage />} />
    </Routes>
  </SearchResultProvider>
</BrowserRouter>
```

**2. SearchResultContext 범위**
- 현재: `CommandLayout` 하위 전체 공유
- 라우팅 추가 시: Route 전환 간 Context 상태 초기화 주의 필요
- `SearchResultProvider`는 Router 외부에 배치하여 페이지 전환 간 유지

**3. CommandLayout 의존성**
- `useMapLayers.ts` → `useSearchResult()` → Context 상태
- 지도 레이어가 URL 변경으로 마운트/언마운트되면 Mapbox 인스턴스 재초기화 발생
- 지도는 별도 persistent 레이아웃으로 유지하거나 Context 바깥으로 이동 필요

**4. useServiceConsoleState 스코프**
- 현재 훅은 `ServiceConsole` 컴포넌트 내부에서만 사용
- 라우팅 추가 시 상태가 페이지 전환에 따라 리셋됨
- 필요하다면 Context로 격상하여 페이지 간 공유 가능

### 9-5-3. 라우팅 없이 해결 가능한 것

MVP 수준에서는 라우팅 없이도 다음이 가능하다:
- `activeTab` URL 파라미터 대신 localStorage 기반 상태 복원
- `window.location.hash`를 간단한 SPA 라우팅 대안으로 활용 (비표준)
- 브라우저 History API 직접 사용 (`pushState`)으로 뒤로가기 지원

---

## 9-6. 현재 파일 구조의 라우팅 준비도

| 항목 | 현황 | 라우팅 준비도 |
|------|------|-------------|
| 라우터 라이브러리 | 미설치 | 추가 필요 (react-router-dom v6) |
| 전역 Context | SearchResultContext 1개 | 추가 라우트 간 공유 가능 |
| 지도 컴포넌트 | 항상 마운트 | 라우팅 시 unmount 위험 (Mapbox 재초기화) |
| 모달 상태 | 컴포넌트 로컬 state | 라우팅 연동 필요 없음 |
| localStorage | 이미 상태 영속화 | 페이지 전환 간 데이터 유지 가능 |
| 인증 Guard | 없음 | PrivateRoute 패턴 추가 시 용이 |

---

## 9-7. 컴포넌트 파일 위치와 논리적 화면 매핑

```
src/
├── App.tsx                                  ← 앱 루트 (라우터 추가 위치)
├── components/
│   ├── Layout/
│   │   ├── CommandLayout.tsx               ← 메인 레이아웃 (항상 존재)
│   │   └── ServiceConsole/                 ← 검색/탐색 "화면"
│   │       ├── ServiceConsole.tsx          ← 탭 + 모달 오케스트레이션
│   │       ├── sections/                   ← 탭별 콘텐츠 섹션
│   │       │   ├── StorageTabSection.tsx   ← 보관 탐색 플로우
│   │       │   ├── TransportTabSection.tsx ← 운송 탐색 플로우
│   │       │   └── BothTabSection.tsx      ← 연계 탐색 플로우
│   │       └── ui/
│   │           ├── DealPage.tsx            ← 거래 신청 "화면" (모달)
│   │           └── SearchResultModal.tsx   ← 검색 결과 "화면" (모달)
│   └── Map/
│       └── MapboxContainer/               ← 항상 렌더링 (지도)
├── contexts/
│   └── SearchResultContext.tsx            ← 전역 상태 (라우팅 간 공유 가능)
```

---

*근거 파일: `src/App.tsx`, `src/main.tsx`, `package.json`, `components/Layout/CommandLayout.tsx`, `components/Layout/ServiceConsole/hooks/useServiceConsoleState.ts`, `components/Layout/ServiceConsole/ServiceConsole.tsx`*


---


# [10] 기술 부채 및 리스크

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 10/11: 기술 부채 및 리스크

---

## 10-1. 요약

| 분류 | 건수 | 심각도 |
|------|------|--------|
| 확정 버그 | 5건 | 🔴 High 2, 🟠 Medium 3 |
| 스텁/미완성 기능 | 4건 | 🟠 Medium 2, 🟡 Low 2 |
| Dead Code | 7건 | 🟡 Low |
| 타입 일관성 이슈 | 4건 | 🟠 Medium |
| 아키텍처 부채 | 3건 | 🟠 Medium |
| 코드 사이즈 초과 | 2건 | 🟡 Low |

---

## 10-2. 확정 버그

### BUG-1: `days = 1` 하드코딩 (🔴 High)

**위치**: `DealPage.tsx:costCalculation(useMemo)` 내부

```typescript
// DealPage.tsx
const days = 1  // TODO: 실제 날짜 차이 계산 필요
const storageEstimate = calcStorageEstimate(billableCubes, unitPrice, days)
```

**영향**: 보관 서비스의 비용 견적이 항상 1일 기준으로 계산된다. `storageCondition.startDate` / `endDate`가 설정되어 있어도 무시된다. 사용자에게 잘못된 금액을 표시한다.

**해결책**: `dayjs(endDate).diff(dayjs(startDate), 'day')` 또는 유사 계산 추가.

---

### BUG-2: `PRICE_ASC` 정렬이 legacy `price` 필드 사용 (🔴 High)

**위치**: `engine/matching/matchingPipeline.ts:307`

```typescript
case 'PRICE_ASC':
  return [...offers].sort((a, b) => a.price - b.price)
```

**영향**: `unitPricePerCube`가 실제 단가 SoT인데, 정렬은 legacy `price` 필드를 사용한다. `price` 필드는 mockData에서 여전히 설정되어 있으나 실제 계산에서는 미사용 필드이므로, 정렬 결과가 실제 가격순과 다를 수 있다.

**해결책**: `a.unitPricePerCube - b.unitPricePerCube`로 변경.

---

### BUG-3: `QuantityInputCard`가 항상 `ROUTE` 모드로 큐브 계산 (🟠 Medium)

**위치**: `QuantityInputCard.tsx:34`

```typescript
const result = computeDemand([boxInput], 'ROUTE')
// 보관 탭에서도 ROUTE packingFactor(1.10)를 사용
```

**영향**: 보관 탭에서 화물 수량 확정 시 `STORAGE` packingFactor(1.15) 대신 `ROUTE`(1.10)가 적용된다. 큐브 수요량이 ~4.5% 과소 계산된다.

**해결책**: `QuantityInputCard`에 `mode: 'STORAGE' | 'ROUTE'` prop 추가하여 분기.

---

### BUG-4: `allocateResource()` 차감이 mockData에 반영되지 않음 (🟠 Medium)

**위치**: `engine/resource/resourceEngine.ts` + `DealPage.tsx`

```typescript
// allocateResource(): localStorage에만 차감 기록
// STORAGE_PRODUCTS: const로 선언된 mockData → 불변
```

**영향**: 거래 확정 후 `remainingCubes`가 localStorage에 차감 기록되지만, 다음 검색 시 `runMatchingPipeline()`은 `mockData.ts`의 원본 `STORAGE_PRODUCTS`를 사용하므로 차감이 반영되지 않는다. 같은 상품을 무한 거래할 수 있다.

**근본 원인**: DB 없이 mockData를 SoT로 사용하는 구조적 한계. PR7 이전에는 해결 불가.

---

### BUG-5: `z-index` 모달 충돌 위험 (🟠 Medium)

**위치**: 여러 모달 파일

```tsx
// SearchResultModal.tsx: className="fixed inset-0 bg-black/50 z-50"
// DealPage.tsx:          className="fixed inset-0 bg-black/60 z-50"
// ProductDetailModal.tsx: className="fixed inset-0 bg-black/50 z-50"
// DealPage 내 ContractModal: className="fixed inset-0 z-50"
```

**영향**: 4개 모달이 모두 `z-50`으로 동일하다. React 렌더링 트리 순서에 의존하여 현재는 작동하지만, 동시에 복수 모달이 열리는 시나리오에서 층서 충돌 가능. `DealPage` 위에 `ProductDetailModal`이 열리면 어느 쪽이 앞에 표시될지 보장되지 않는다.

---

## 10-3. 스텁/미완성 기능

### STUB-1: 날짜 필터링 미구현 (🟠 Medium)

**위치**: `engine/matching/conditionFilters.ts:hasDateConditions()`

```typescript
function hasDateConditions(conditions: SearchConditions): boolean {
  return false  // TODO: 날짜 조건이 있으면 true 반환
}
```

**영향**: `storageCondition.startDate/endDate`, `transportCondition.transportDate`가 UI에서 입력되어 DemandSession에 저장되지만, 실제 매칭 필터에는 전혀 사용되지 않는다. 날짜를 변경해도 결과가 동일하다.

---

### STUB-2: SearchResultModal "연계" 서브탭 항상 빈 결과 (🟠 Medium)

**위치**: `SearchResultModal.tsx`

```typescript
// TODO 주석 존재
// 보관+운송 '연계' 탭: 항상 [] 반환
const linkedResults = []
```

**영향**: `BothTab`에서 "연계" 검색 결과를 보면 항상 0건이 표시된다. 기능이 존재하는 것처럼 UI는 있지만 데이터가 없다.

---

### STUB-3: `DISTANCE_ASC` 정렬 미구현 (🟡 Low)

**위치**: `matchingPipeline.ts:309`

```typescript
case 'DISTANCE_ASC':
  return [...offers]  // 스텁: 정렬 없이 반환
```

거리 계산 로직 없이 원래 순서 그대로 반환한다.

---

### STUB-4: `provider.contractTemplate` 사용 안 됨 (🟡 Low)

**위치**: `DealPage.tsx` 계약서 섹션

계약서 내용이 DealPage 내부에 하드코딩되어 있으며, `StorageProduct.provider.contractTemplate` 필드는 읽히지 않는다.

---

## 10-4. Dead Code

### DC-1: `StorageProduct.price` / `RouteProduct.price` (legacy 단가)

**위치**: `types/models.ts`, `mockData.ts`

```typescript
// types/models.ts
price: number  // 레거시 단가 필드 (unitPricePerCube로 대체됨)
```

`unitPricePerCube`가 SoT인데 `price`가 타입/mockData에 공존. `PRICE_ASC` 정렬만이 이 필드를 사용한다(BUG-2). 삭제 대상.

---

### DC-2: `CargoUI` deprecated 필드 (구 카테고리 체계)

**위치**: `types/models.ts:CargoUI`

```typescript
productCategory?: string        // deprecated
productSubCategory?: string     // deprecated
weightRange?: string            // deprecated
```

Code Data System(PR3-4) 도입으로 `itemCode`, `weightBand`로 대체되었으나 타입에 잔존. `QuantityInputCard.tsx`에서 여전히 읽힘.

---

### DC-3: `PRODUCT_CATEGORIES` / `WEIGHT_RANGES` (mockData)

**위치**: `data/mockData.ts`

```typescript
export const PRODUCT_CATEGORIES: ProductCategory[] = [...]  // 구 카테고리 코드셋
export const WEIGHT_RANGES: WeightRange[] = [...]           // 구 중량 범위
```

`QuantityInputCard.tsx`에서 표시 목적으로만 사용. Code Data System의 `ItemCode`/`WeightBand`로 완전 전환 시 삭제 가능.

---

### DC-4: `matchLocationName()` (이름 기반 레거시 필터)

**위치**: `engine/matching/conditionFilters.ts`

```typescript
function matchLocationName(searchTerm: string, name: string, region: string): boolean {
  // regionCode 기반 매칭(PR7-pre) 도입으로 사용 빈도 급감
  // "우선순위 2" 폴백으로만 작동
}
```

`locationCode` 체계 전환 완료 시 삭제 대상.

---

### DC-5: `computeDemandFromArea()` (면적 기반 큐브 계산 폴백)

**위치**: `engine/index.ts`

```typescript
export function computeDemandFromArea(areaM2: number, heightM: number, mode: 'STORAGE' | 'ROUTE'): DemandResult
```

현재 어떤 UI/컴포넌트에서도 호출되지 않는다.

---

### DC-6: `featureCodes.ts` 일부

**위치**: `data/featureCodes.ts`

`FeatureCode` 타입 + `FEATURE_CODE_LABELS` 정의가 있으나, `ProductDetailModal.tsx`에서 features 배열을 직접 렌더링하므로 `FEATURE_CODE_LABELS` 변환 함수가 사용되지 않는다.

---

### DC-7: `components/Layout/ServiceConsole.tsx` (껍데기 파일)

**위치**: `src/components/Layout/ServiceConsole.tsx`

```typescript
// ServiceConsole 리다이렉트 - 폴더 구조로 이전됨
export { default } from './ServiceConsole/index'
```

리다이렉트 export만 존재하는 shell 파일. import 경로가 폴더 구조로 전환 완료되면 삭제 가능.

---

## 10-5. 타입 일관성 이슈

### TYPE-1: `StorageProduct.features` 타입 vs 실제값

```typescript
// types/models.ts
features: FeatureCode[]  // FeatureCode = 'F_24H_INOUT' | 'F_FORKLIFT' | ...

// mockData.ts 실제값: 정상적으로 FeatureCode 사용
features: ['F_24H_INOUT', 'F_FORKLIFT', 'F_CCTV']
```

현재 mockData는 올바르게 FeatureCode를 사용 중이다. **그러나** `ProductDetailModal.tsx:83`에서 `feature`를 직접 렌더링하므로 `'F_24H_INOUT'` 같은 코드 문자열이 그대로 노출된다. `FEATURE_CODE_LABELS`를 통한 한글 변환이 누락되었다.

---

### TYPE-2: `DemandSession.regulationSummary` / `resourceSummary` 미사용

```typescript
// types/models.ts (CLAUDE.md 정의 기반)
regulationSummary?: { checked: boolean; passedOfferIds: string[]; ... }
resourceSummary?: { checked: boolean; passedOfferIds: string[]; ... }
```

타입 정의는 있으나 실제로 DemandSession을 생성/업데이트하는 `demandStore.ts`에서 이 필드들이 채워지지 않는다. 항상 `undefined`.

---

### TYPE-3: `CargoInfo.signature` 미사용

```typescript
// CLAUDE.md에서 정의된 CargoInfo 필드
signature: string  // 'CargoInfo 생성 → signature 부여 → ...'
```

`cargoStore.ts`에서 `CargoInfo`를 생성하지만 `signature` 필드 부여 로직이 없다.

---

### TYPE-4: `ServiceType` 이중 정의

```typescript
// types/models.ts
export type ServiceType = 'STORAGE' | 'ROUTE' | 'BOTH'  // 모델 레벨

// useServiceConsoleState.ts:46
export type ServiceType = 'storage' | 'transport' | 'both'  // UI 레벨
```

동일한 이름의 타입이 두 곳에 존재하며 값도 다르다. `toModelServiceType()` 변환 함수로 브리징하지만, import 시 혼동 가능성이 있다.

---

## 10-6. 아키텍처 부채

### ARCH-1: CommandLayout의 DOM 직접 조작 (마커 하이라이트)

**위치**: `components/Layout/CommandLayout.tsx`

```typescript
useEffect(() => {
  document.querySelectorAll('.pallet-marker').forEach(el => {
    // el.classList.add/remove('highlighted') — React 외부 DOM 조작
  })
}, [highlightedIds])
```

Mapbox 마커에 대해 React state가 아닌 DOM 직접 조작으로 하이라이트를 적용한다. 이는 React의 선언형 패러다임에 반하며, Mapbox 마커가 리셋되거나 재렌더링될 때 하이라이트 상태가 불일치할 수 있다.

---

### ARCH-2: `useServiceConsoleState.ts` 크기 초과 (672줄)

컨벤션 가드레일: 단일 훅 최대 300줄. 현재 672줄로 **2배 이상 초과**. 상태, useMemo(previewMatch), 이벤트 핸들러, deal 흐름이 모두 한 파일에 있다.

분리 가능 범위:
- `useCargoRegistration()` — 화물 등록/수량 관련 상태
- `useMatchingPreview()` — previewMatch useMemo
- `useDealFlow()` — handleConfirmDeal, 거래 흐름

---

### ARCH-3: `types/models.ts` 단일 파일 집중 (628줄)

컨벤션에서 엔진/매칭 도메인 타입은 `engine/matchingTypes.ts`에 분리하도록 규정했으나, `DealPageProps`에 필요한 타입들이 `types/models.ts`에 계속 추가되고 있다. `types/models.ts`가 UI/모델/거래/세션 타입 모두를 담는 단일 파일로 비대화 중이다.

---

## 10-7. 코드 사이즈 초과

| 파일 | 실제 줄수 | 컨벤션 한도 | 초과율 |
|------|---------|------------|--------|
| `useServiceConsoleState.ts` | 672줄 | 300줄 | +124% |
| `types/models.ts` | 628줄 | — | 단일 파일 집중 |
| `DealPage.tsx` | 700줄 이상 추정 | 300줄 | 과대 |

---

## 10-8. 개선 우선순위

| 우선순위 | 항목 | 영향 | 난이도 |
|---------|------|------|--------|
| P1 | BUG-1: `days=1` 하드코딩 수정 | 비용 계산 오류 | 쉬움 |
| P1 | BUG-2: `PRICE_ASC`를 `unitPricePerCube` 기준으로 수정 | 정렬 오류 | 쉬움 |
| P2 | BUG-3: `QuantityInputCard` 모드 파라미터화 | 큐브 과소계산 | 보통 |
| P2 | STUB-1: 날짜 필터 구현 | 검색 정확도 | 보통 |
| P2 | TYPE-1: `features` 렌더링에 `FEATURE_CODE_LABELS` 변환 추가 | UI 오류 | 쉬움 |
| P3 | DC-1: legacy `price` 필드 제거 | 코드 정리 | 보통 |
| P3 | DC-2/3: deprecated CargoUI 필드 및 mockData 구 코드셋 제거 | 코드 정리 | 보통 |
| P3 | ARCH-2: `useServiceConsoleState` 분리 | 유지보수성 | 어려움 |
| P4 | BUG-5: z-index 계층화 (`z-40/50/60/70`) | UX 안정성 | 쉬움 |
| P4 | STUB-2: 연계 탭 검색 결과 구현 또는 숨김 | UX | 보통 |
| P5 | ARCH-1: Mapbox 마커 하이라이트를 React 상태 기반으로 전환 | 아키텍처 | 어려움 |
| P5 | BUG-4: `allocateResource` + mockData 연동 | PR7 이후 | 매우 어려움 (DB 필요) |

---

*근거 파일: `engine/matching/matchingPipeline.ts`, `engine/matching/conditionFilters.ts`, `components/Layout/ServiceConsole/ui/DealPage.tsx`, `components/Layout/ServiceConsole/ui/QuantityInputCard.tsx`, `types/models.ts`, `data/mockData.ts`, `components/Layout/CommandLayout.tsx`, `components/Layout/ServiceConsole/hooks/useServiceConsoleState.ts`*


---


# [11] 최종 결론

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 11/11: 최종 결론

---

## 11-1. 분석 요약

본 보고서는 11개 섹션에 걸쳐 `integral-mvp` 전체 코드베이스를 분석하였다. 각 섹션의 핵심 발견을 아래에 요약한다.

| 섹션 | 주제 | 핵심 발견 |
|------|------|----------|
| [01] | 프로젝트 구조 | Vite+React18+TS, 라우터 없음, 55개 소스 파일 |
| [02] | UI/UX 플로우 | 45%/55% 그리드, 모달 4단계 중첩, 3-단계 플로우 |
| [03] | 큐브 엔진 | Cube=250mm³, STORAGE 1.15/ROUTE 1.10 packingFactor |
| [04] | Code Data System | 6개 코드셋, localStorage 7키, 22가지 이벤트 |
| [05] | 데이터 모델 | 628줄 단일 types/models.ts, legacy `price` 필드 공존 |
| [06] | 매칭 로직 | 4단계 파이프라인, Preview/Search 분리, Context SoT |
| [07] | 레이어 구조 | Regulation→Resource→Condition→Trade 4레이어 |
| [08] | 상품 등록 연결 | 등록 페이지 없음, 6가지 등록→거래 충돌 지점 |
| [09] | 라우팅 설계 | 완전 SPA, react-router-dom 미설치, 모달 기반 전환 |
| [10] | 기술 부채 | 5개 버그, 4개 스텁, 7개 Dead Code, 4개 타입 이슈 |
| [11] | 최종 결론 | 본 섹션 |

---

## 11-2. 아키텍처 평가

### 강점

**1. 단일 진실 소스 원칙 일관성**

`runMatchingPipeline`이 검색 결과의 SoT로 명확히 정의되어 있고, `SearchResultContext`가 프리뷰/검색결과/지도 하이라이트를 일관되게 공유한다. PR6 이후 데이터 흐름의 방향이 명확하다:

```
mockData → runMatchingPipeline → SearchResultContext → UI / Map
```

**2. 엔진 분리 원칙**

`engine/` 하위에 순수 함수만 위치하며 React import가 없다. Regulation, Resource, Matching, Settlement, Unit Convert 각 레이어가 파일 단위로 분리되어 있어 단위 테스트가 가능한 구조다.

**3. Code Data System의 append-only 이벤트 로그**

22가지 이벤트 타입, 최대 1000건 유지, localStorage 기반 영속화로 MVP 범위 내 "선 규정, 후 거래" 원칙을 데이터 구조로 구현했다. 실제 데이터베이스 전환 시 이벤트 구조를 그대로 활용할 수 있다.

**4. RegionCode 단일 진실 소스 (PR7-pre)**

법정동 코드 10자리를 모든 필터링의 SoT로 확정하고, `regionRepresentativeCoords.ts`를 통해 좌표 매핑도 일원화되었다.

---

### 약점

**1. mockData가 상품 SoT이자 영속화 경계**

`STORAGE_PRODUCTS`, `ROUTE_PRODUCTS`가 `const`로 선언된 불변 배열이라 `allocateResource()` 후 `remainingCubes`가 세션 간 유지되지 않는다. localStorage에 차감을 기록해도 다음 검색에서 원본 mockData를 읽어 결과가 리셋된다.

**2. CommandLayout의 선언형 원칙 위반**

지도 마커 하이라이트를 `document.querySelectorAll('.pallet-marker')`로 DOM 직접 조작한다. React의 상태 기반 렌더링을 우회하며 Mapbox 레이어 재렌더링 시 불일치가 발생할 수 있다.

**3. useServiceConsoleState 비대화**

672줄로 컨벤션 한도(300줄)의 2배를 초과한다. 화물 등록, 수량 계산, 프리뷰 매칭, 거래 흐름이 단일 훅에 집중되어 있어 유지보수 부담이 높다.

---

## 11-3. MVP 완성도 평가

### 기능별 완성도

| 기능 영역 | 완성도 | 비고 |
|----------|--------|------|
| 화물 등록 (화주) | ✅ 90% | `CargoRegistrationCard` 완성, 수량 모드 버그(BUG-3) |
| 보관 검색/매칭 | ✅ 85% | 날짜 필터 미구현(STUB-1) |
| 운송 검색/매칭 | ✅ 85% | 날짜 필터 미구현, 연계 탭 빈 결과(STUB-2) |
| 지도 시각화 | ✅ 90% | 하이라이트 작동, DOM 조작 방식(ARCH-1) |
| 거래 신청 (DealPage) | ✅ 80% | `days=1` 하드코딩(BUG-1), 비용 계산 부정확 |
| 재고 차감 | ⚠️ 40% | localStorage 기록은 되나 검색 반영 안 됨(BUG-4) |
| 상품 등록 (공급측) | ❌ 0% | 미구현, mockData 의존 |
| 라우팅/URL 공유 | ❌ 0% | react-router-dom 미설치 |
| 인증/회원 | ❌ 0% | 의도적 미구현 (MVP 범위 제외) |

### 투자자 시연 목적 달성도

**목적**: 3~5분 내 서비스 가치 전달

| 시나리오 | 달성 여부 |
|---------|----------|
| 화물 정보 입력 → 큐브 환산 시각화 | ✅ |
| 지역 선택 → 지도 상 매칭 결과 하이라이트 | ✅ |
| 상품 상세 → 규정/용량/단가 확인 | ✅ |
| 거래 신청 → 계약 동의 → 완료 확인 | ✅ |
| 금액 견적 정확성 | ⚠️ (days=1 오류) |
| 재고 실시간 반영 | ❌ |

**결론**: 투자자 시연 목적인 "3~5분 내 핵심 플로우 체험"은 충분히 달성 가능하다. 비용 견적 오류(BUG-1)만 수정하면 시연 품질이 크게 향상된다.

---

## 11-4. PR 로드맵 대비 현황

| PR | 내용 | 상태 | 비고 |
|----|------|------|------|
| PR1~PR3-2.5 | 초기 설정, UI 개편, 통합 엔진 | ✅ | |
| PR3-3 | ServiceConsole 3행 그리드 UI | ✅ | |
| PR3-4 | Code Data System MVP | ✅ | |
| PR4 | Regulation Engine | ✅ | |
| PR5 | Resource Layer Wiring | ✅ | BUG-4: 차감 반영 이슈 |
| PR6 | Matching Pipeline + UX 동기화 | ✅ | STUB-2: 연계 탭 미완 |
| PR7-pre | 내부 데이터 체계화 | ✅ | |
| PR7 | 재고 차감 + 거래 확정 | 📋 예정 | BUG-4 해결 필요 |
| PR8+ | 상품 등록, 라우팅, 인증 | 미계획 | |

---

## 11-5. 다음 단계 권고사항

### 즉시 수정 가능 (1~2일)

1. **BUG-1**: `DealPage.days = 1` → `dayjs(endDate).diff(startDate, 'day')` 계산 추가
2. **BUG-2**: `PRICE_ASC`를 `unitPricePerCube` 기준으로 변경
3. **TYPE-1**: `ProductDetailModal`에서 `features` 코드 → `FEATURE_CODE_LABELS` 변환 추가
4. **BUG-5**: 모달 z-index를 `z-40/50/60/70`으로 계층화

### 단기 개선 (1~2주)

5. **BUG-3**: `QuantityInputCard`에 `mode` prop 추가하여 STORAGE/ROUTE 분기
6. **STUB-1**: 날짜 범위 필터 구현 (`startDate <= offerDate <= endDate`)
7. **DC-1/2/3**: legacy `price`, deprecated `CargoUI` 필드, 구 카테고리 코드 제거
8. **ARCH-2**: `useServiceConsoleState` → `useCargoRegistration` + `useMatchingPreview` + `useDealFlow` 분리

### PR7 준비 (2~4주)

9. **BUG-4**: mockData를 localStorage 기반으로 교체하거나 Context 레벨로 관리하여 `allocateResource()` 차감이 검색에 즉시 반영되도록
10. **상품 등록 페이지**: `StorageProduct` / `RouteProduct` 등록 폼 구현 (섹션 8 필드 정의 기반)

### 장기 (PR8+)

11. react-router-dom 도입 및 URL 기반 라우팅 전환
12. 백엔드/DB 연동 (현재 localStorage 기반 store를 API 호출로 교체)
13. `useServiceConsoleState` 분리 완료 및 `types/models.ts` 도메인별 파일 분리

---

## 11-6. 코드베이스 건강도 총평

```
┌─────────────────────────────────────────────────────────┐
│  INTEGRAL MVP 코드베이스 건강도                          │
│                                                         │
│  아키텍처 설계:     ████████░░  80%  (PR6 이후 명확)    │
│  엔진 구현 완성도:  ████████░░  80%  (날짜필터 미완)    │
│  UI/UX 완성도:     ████████░░  80%  (시연 충분)        │
│  타입 일관성:       ██████░░░░  60%  (legacy 잔존)     │
│  코드 컨벤션 준수:  ██████░░░░  60%  (훅 비대화)       │
│  테스트 커버리지:   ████░░░░░░  40%  (2개 테스트 파일) │
│                                                         │
│  종합:             ███████░░░  70%  MVP 수준 적합       │
└─────────────────────────────────────────────────────────┘
```

**투자자 시연용 프로토타입으로서 현재 코드베이스는 목적에 부합한다.** 핵심 플로우(화물 등록 → 큐브 계산 → 지도 매칭 → 거래 신청)가 동작하며, PR7-pre까지의 설계 원칙(단일 진실 소스, 엔진 분리, 코드 체계)이 코드에 실제로 반영되어 있다.

단, BUG-1(비용 계산 오류)과 STUB-1(날짜 필터 미동작)은 시연 중 발견될 경우 신뢰도에 영향을 줄 수 있으므로 조기 수정을 권고한다.

---

*본 보고서는 2026-02-19 기준 `integral-mvp` 레포지토리의 실제 소스 코드를 직접 읽어 작성된 사실 기반 분석이다. 추정이나 가정에 의한 내용은 포함되지 않았다.*

---

## 분석 보고서 목차

| 파일 | 내용 |
|------|------|
| `docs/01-project-structure.md` | 프로젝트 구조 개요 |
| `docs/02-ui-ux-flow.md` | UI/UX 플로우 분석 |
| `docs/03-cube-engine.md` | 큐브 엔진 분석 |
| `docs/04-code-data-system.md` | Code Data System 분석 |
| `docs/05-data-models-sot.md` | 데이터 모델 및 단일 진실 소스 |
| `docs/06-matching-logic.md` | 매칭 파이프라인 로직 |
| `docs/07-layer-structure.md` | 레이어 구조 분석 |
| `docs/08-product-registration.md` | 상품 등록 페이지 연결 분석 |
| `docs/09-routing-design.md` | 페이지 구조 및 라우팅 설계 |
| `docs/10-tech-debt.md` | 기술 부채 및 리스크 |
| `docs/11-final-conclusion.md` | 최종 결론 (본 문서) |
