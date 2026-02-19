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
