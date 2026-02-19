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
