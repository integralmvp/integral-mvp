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
