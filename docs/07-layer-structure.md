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
