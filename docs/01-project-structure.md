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
