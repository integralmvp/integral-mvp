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
