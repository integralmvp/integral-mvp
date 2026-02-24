# INTEGRAL MVP — 최종 아키텍처 검증 보고서

> **작성일**: 2026-02-24
> **기준 커밋**: `04a7ddd` (Final Stabilization Patch — CDS 기반 완결)
> **목적**: 현재 구조의 완결성 검증 + 다음 단계(PR7 이후) 청사진 수립

---

## 목차

1. [프로젝트 전체 구조 개요](#1-프로젝트-전체-구조-개요)
2. [Cube 거래 엔진 검증](#2-cube-거래-엔진-검증-핵심)
3. [Code Data System(CDS) 검증](#3-code-data-systemcds-검증)
4. [데이터 흐름 무결성 검증](#4-데이터-흐름-무결성-검증)
5. [서비스 로직 구조 검증 (4 레이어)](#5-서비스-로직-구조-검증-4-레이어)
6. [지도 ↔ 리스트 ↔ 데이터 동기화 검증](#6-지도--리스트--데이터-동기화-검증)
7. [타입 / 코드 일관성 검증](#7-타입--코드-일관성-검증)
8. [Legacy / Stub / Dead Code 분석](#8-legacy--stub--dead-code-분석)
9. [리스크 및 구조적 한계](#9-리스크-및-구조적-한계)
10. [최종 아키텍처 평가](#10-최종-아키텍처-평가)
11. [최종 개발 청사진](#11-최종-개발-청사진-가장-중요)

---

# 1. 프로젝트 전체 구조 개요

## 1-1. 레이어 구조 정의

```
┌─────────────────────────────────────────────────────────────────────┐
│  engine/                          # 순수 계산 함수 (React/IO 금지)  │
│  ├── cube/          cubeEngine.ts cubeConfig.ts shapeClassifier.ts  │
│  │                  unitConvert.ts index.ts                          │
│  └── pricing/       cubeSettlement.ts index.ts                      │
├─────────────────────────────────────────────────────────────────────┤
│  infra/dataspec/                  # CDS 정의 계층                   │
│  ├── codedata/      items/ bands/ features/ regions/                │
│  ├── fields/        info/  event/  common.fields.ts                 │
│  ├── id/            makeId.ts (ULID-style)                          │
│  └── signature/     info.ts (INFO_*) event.ts (EVT_*)               │
├─────────────────────────────────────────────────────────────────────┤
│  infra/storage/                   # 영속성 계층 (localStorage)      │
│  ├── info/          offer.repo  cargo.repo  provider.repo           │
│  │                  demandSession.repo  deal.repo                    │
│  └── event/         eventLog.ts  deal.events.ts  matching.events.ts │
├─────────────────────────────────────────────────────────────────────┤
│  data/mock/                       # Mock 픽스처 (DB 대체용)         │
│  ├── records/       offers.ts providers.ts                          │
│  ├── builders/      offer.builders.ts provider.builders.ts          │
│  ├── adapters.ts    표시용 어댑터 (JEJU_LOCATIONS, PRODUCT_CATEGORIES)│
│  └── mockData.ts    Facade (repo 경유 re-export)                    │
├─────────────────────────────────────────────────────────────────────┤
│  layers/                          # 서비스 로직 계층               │
│  ├── matching/                                                       │
│  │   ├── regulation/  regulationEngine.ts rules/ruleCheck.ts       │
│  │   ├── resource/    resourceEngine.ts resourceAllocation.ts       │
│  │   ├── condition/   conditionFilters.ts                            │
│  │   ├── session/     demandSession.ts                               │
│  │   └── pipeline.ts  runMatchingPipeline (단일 SoT 파이프라인)     │
│  └── types/           matchingTypes.ts  index.ts                    │
├─────────────────────────────────────────────────────────────────────┤
│  types/                           # 타입 시스템                     │
│  ├── domain/        offer cargo provider deal codes demandSession   │
│  ├── ui/            serviceConsole productCard                       │
│  └── models.ts      Compat Bridge (@deprecated)                     │
├─────────────────────────────────────────────────────────────────────┤
│  contexts/                        # React Context                   │
│  └── SearchResultContext.tsx       previewResult + searchResult 공유│
├─────────────────────────────────────────────────────────────────────┤
│  components/                      # UI 계층                         │
│  ├── Layout/        CommandLayout.tsx                                │
│  ├── Features/Map/  MapboxContainer (hooks/ utils/ ui/)             │
│  ├── Features/ServiceConsole/  hooks/ sections/ ui/ modals/         │
│  └── Visualizations/  CubeIcon3D PalletIcon3D etc.                 │
└─────────────────────────────────────────────────────────────────────┘
```

## 1-2. 데이터 흐름 다이어그램

```
[data/mock/records/]    ← 시드 레코드 (InfoOfferRecord[])
        ↓
[data/mock/builders/]   ← buildSeedOffers() — 빌드 + validateOfferSeed()
        ↓
[infra/storage/info/offer.repo.ts]
  → 최초: seed → localStorage (G4/G5)
  → 이후: localStorage → in-memory cache (_storageCache / _routeCache)
  → 재고 차감: updateStorageOfferResource() → in-place 수정 + persist (G6)
        ↓
[data/mock/mockData.ts]  ← Facade: getAllStorageOffers() 참조 (동일 캐시)
        ↓
[components/hooks/useMatchingPreview.ts]
  → STORAGE_PRODUCTS / ROUTE_PRODUCTS 읽기
  → runMatchingPipeline() 호출 → previewResult (useMemo)
        ↓
[layers/matching/pipeline.ts]  ← 단일 파이프라인 SoT
  Step 1: filterOffersByRegulation(cargos, offers, mode, demand)
  Step 2: filterStorageByResource(passed, totalCubes) [or skip if no qty]
  Step 3: filterStorageByConditions(passed, conditions)  ← RegionCode 기반
  Step 4: applySorting(filtered, sortCriteria)
        ↓
[contexts/SearchResultContext.tsx]
  → previewResult (실시간 하이라이트)
  → searchResult (검색 버튼 클릭 시 스냅샷)
        ↓        ↓
[Map 하이라이트]   [SearchResultModal 리스트]
  ↓ useMapbox       ↓ ProductDetailModal
  updateMarkerHighlights()
        ↓
[거래 확정: DealPage.tsx]
  → calcBillableCubes() + calcStorageEstimate() / calcEstimatedTotal()
  → allocateResource() → updateStorageOfferResource() → localStorage
  → logDealConfirmed() + logSettlementCalculated() + logResourceAllocated()
```

## 1-3. 현재 구조 평가

| 설계 의도 | 실제 구현 | 일치 여부 |
|-----------|----------|----------|
| 큐브 단일 계산 단위 | `CUBE_SPEC(250mm³)` + `calcCubeDemand()` | ✅ 완전 일치 |
| Repo-only data flow | mockData.ts = Facade → repo 참조 | ✅ 완전 일치 |
| 단일 파이프라인 SoT | `runMatchingPipeline()` in pipeline.ts | ✅ 완전 일치 |
| CDS 바코드 규율 | INFO_SIGNATURES + EVT_SIGNATURES 분리 | ✅ 완전 일치 |
| 재고 차감 영속 | localStorage + in-place 수정 → persist | ✅ 완전 일치 |
| 지도/리스트 동기화 | Context 기반 + marker Map CSS 토글 | ✅ 완전 일치 |
| 타입 통일 | types/domain/ + compat bridge | ⚠️ bridge 잔존 |
| BothTab 정책 잠금 | POLICY_LOCKED = true | ✅ 완전 일치 |

**종합**: 설계 의도와 실제 구현의 일치도는 **높음(8/8 항목 중 7 완전 일치, 1 부분)**.

---

# 2. Cube 거래 엔진 검증 (핵심)

## 2-1. 큐브 계산 흐름

### 엔진 진입점 (`engine/cube/index.ts`)

```typescript
// computeDemand(cargos: RegisteredCargo[], mode: DemandMode) → DemandResult
// → boxInputs 변환 → calcCubeDemand() 호출
// → { totalCubes, totalPallets(= ceil(cubes/128)), ... }
```

### 핵심 계산 (`engine/cube/cubeEngine.ts:calcCubeDemand`)

```
단계 1: 각 박스의 체적 계산 (mm³ → m³)
         volumeM3 = widthMm × depthMm × heightMm / 1_000_000_000

단계 2: packingFactor 적용
         effectiveVolumeM3 = totalVolumeM3 × PACKING_FACTOR[mode]
         → STORAGE: × 1.15 (보관 여유 공간)
         → ROUTE:   × 1.10 (적재 효율)

단계 3: 큐브 수 계산 (ceil)
         totalCubes = ⌈effectiveVolumeM3 / 0.015625⌉

단계 4: byModule 집계 (설명용 — 과금에 영향 없음)
```

### 상수 정의 (`engine/cube/cubeConfig.ts`)

| 상수 | 값 | 출처 |
|------|----|------|
| `CUBE_SPEC.volumeM3` | 0.015625 m³ (250³ mm³) | 불변 상수 |
| `CUBES_PER_PALLET` | 128 | 플랫폼 표준 |
| `PACKING_FACTOR.STORAGE` | 1.15 | cubeConfig |
| `PACKING_FACTOR.ROUTE` | 1.10 | cubeConfig |

**판단**: ✅ 큐브 계산 엔진은 **완전히 구현**됨. 모든 UI 물량 입력은 `computeDemand()`를 통해 큐브로 변환됨.

## 2-2. 가격 SoT 검증

### unitPricePerCube 사용 현황

| 파일 | 용도 | 준수 여부 |
|------|------|----------|
| `types/domain/offer.ts:StorageProduct` | 필드 정의 (`unitPricePerCube: number`) | ✅ SoT 필드 |
| `types/domain/offer.ts:RouteProduct` | 필드 정의 (`unitPricePerCube: number`) | ✅ SoT 필드 |
| `engine/pricing/cubeSettlement.ts:calcBaseAmount` | `billableCubes × unitPricePerCube` | ✅ 올바른 사용 |
| `layers/matching/pipeline.ts:applySorting` | `PRICE_ASC: a.unitPricePerCube - b.unitPricePerCube` | ✅ SoT 기반 정렬 |
| `components/.../DealPage.tsx` | `storageProduct.unitPricePerCube`, `routeProduct.unitPricePerCube` | ✅ SoT 직접 참조 |
| `data/mock/records/offers.ts` | `unitPricePerCube: 650` (seed 값) | ✅ 시드에 실제 필드 |

### Legacy price 필드 존재 여부

- `StorageProduct` 타입에 `price`, `totalPrice`, `dailyPrice` 등의 별도 가격 필드: **없음** ✅
- `RouteProduct` 타입에 동일: **없음** ✅
- `calcBaseAmount` 함수가 유일한 기본 금액 계산 함수: ✅

**판단**: ✅ `unitPricePerCube`가 **유일한 가격 SoT**. legacy price 필드 완전 제거 확인.

## 2-3. billableCubes / payload 계산 흐름

```
DealPage.tsx (costCalculation useMemo)
  ↓
  totalWeightKg = Σ(cargo.weightKg × quantity)
  ↓
  calcBillableCubes(totalCubes, totalWeightKg, offer.maxKgPerCube)
  →  weightCubes = ⌈totalWeightKg / maxKgPerCube⌉
  →  billableCubes = max(volumeCubes, weightCubes)   ← "큰 쪽 과금"
  →  weightSurchargeApplied = weightCubes > volumeCubes
  ↓
  [Storage] calcStorageEstimate(billableCubes, unitPricePerCube, storageDays, options)
            → base = billableCubes × unitPricePerCube × days
  [Route]   calcEstimatedTotal(billableCubes, unitPricePerCube, options)
            → base = billableCubes × unitPricePerCube
  ↓
  totalCost = storageResult.total + routeResult.total
```

**중요 관찰**: DealPage의 `costCalculation.baseCost`는 `storageResult.base + routeResult.base`의 합산이며, 이 값이 UI 표시에 사용됨. `cubeCost = baseCost` (중량은 billableCubes에 이미 포함)로 설정되어 있어 표시용 중복이 있으나 실제 금액 계산에는 영향 없음.

## 2-4. 결론

> **"큐브 기반 거래 엔진이 실제로 작동하는가?"**

**YES — 완전히 구동됨.**

- 물량 입력 → `computeDemand()` → `totalCubes`
- 매칭 → `runMatchingPipeline(session.totalCubes)` → `remainingCubes >= demand`
- 거래 → `calcBillableCubes()` → `calcStorageEstimate()` → 금액 확정
- 재고 → `allocateResource()` → `remainingCubes -= billableCubes` → localStorage 영속

큐브는 단순한 표시 단위가 아니라 필터링(자원 체크), 정렬(PRICE_ASC), 정산(billableCubes), 재고 차감 모두에서 **실제 계산 기준**으로 작동한다.

---

# 3. Code Data System(CDS) 검증

## 3-1. 코드셋 점검

### RegionCode (`infra/dataspec/codedata/regions/`)

| 항목 | 내용 |
|------|------|
| 타입 | `RegionCode = string` (10자리 법정동 코드) |
| 정의 파일 | `regionCodesJeju.ts` — 제주 법정동 코드 전체 정의 |
| 좌표 파일 | `regionRepresentativeCoords.ts` — 법정동 코드 → 위경도 좌표 |
| 특수 코드 | `'5000000000'` (제주특별자치도), `'JEJU_PORT'`, `'BUSAN_PORT'` |
| 계층 처리 | `getEffectivePrefix()` — 시도(2) / 시군구(5) / 읍면동(8) / 리(10) |

### ItemCode (`infra/dataspec/codedata/items/itemCodes.ts`)

```typescript
export type ItemCode = 'IC01' | 'IC02' | ... | 'IC99'
// IC01: 일반잡화, IC02: 농산물, IC03: 수산물, IC04: 냉장식품, ...
```

### WeightBand / SizeBand (`infra/dataspec/codedata/bands/bands.ts`)

```typescript
export type WeightBand = 'WBX' | 'WBY' | 'WBZ' | 'WBH'
// WBX: ~5kg, WBY: ~10kg, WBZ: ~20kg, WBH: 20kg 초과

export type SizeBand = 'SB1' | 'SB2' | 'SB3' | 'SB4' | 'SBX'
// 3변합 기준 분류
```

### FeatureCode (`infra/dataspec/codedata/features/featureCodes.ts`)

```typescript
export type FeatureCode =
  'F_24H_INOUT' | 'F_FORKLIFT' | 'F_CCTV' |
  'F_TEMP_MONITORING' | 'F_FAST_FREEZE' |
  'F_PARKING' | 'F_FOOD_SPECIALIZED' | 'F_AGRI_SPECIALIZED'

export const FEATURE_CODE_LABELS: Record<FeatureCode, string> = {
  'F_24H_INOUT': '24시간 입출고', 'F_FORKLIFT': '지게차 보유', ...
}
export function formatFeatureLabel(code: string): string  // UI 변환 함수
```

## 3-2. 실제 데이터 적용 여부

### Seed 레코드 (`data/mock/records/offers.ts`) 코드 사용 현황

| 필드 | Seed 값 예시 | 실제 코드 사용 여부 |
|------|------------|-------------------|
| `signature` | `'INFO_OFFER'` | ✅ INFO_SIGNATURES.OFFER와 일치 |
| `fields.originCode` | `'5011000000'` | ✅ RegionCode 10자리 |
| `fields.destinationCode` | `'5013000000'` | ✅ RegionCode 10자리 |
| `fields.unitPricePerCube` | `650` | ✅ 가격 SoT |
| `fields.capacityCubes` | `400` | ✅ 자원 SoT |
| `fields.remainingCubes` | `350` | ✅ 가변 자원 SoT |

**Storage 상품 Seed 코드 사용 현황** (`offer_s001` 예시 확인 필요 — builders를 통해 FeatureCode[]로 변환됨):
- `builders/offer.builders.ts`에서 `fields.features: FeatureCode[]`로 변환 (offer.fields.ts 타입 준수)

### UI 표시용으로만 쓰이는 코드

| 코드/상수 | 위치 | 실제 필터링 사용 여부 |
|-----------|------|---------------------|
| `JEJU_LOCATIONS` | `data/mock/adapters.ts` | ❌ 표시용만 (mockData.ts 주석 명시) |
| `PRODUCT_CATEGORIES` | `data/mock/adapters.ts` | ❌ 표시용만 |
| `WEIGHT_RANGES` | `data/mock/adapters.ts` | ❌ 표시용만 |

## 3-3. 코드 → 라벨 변환 체계 검증

**현재 구현된 변환 경로:**

| 코드 타입 | 변환 함수 | 위치 | UI 적용 여부 |
|----------|----------|------|------------|
| FeatureCode | `formatFeatureLabel(code)` | `featureCodes.ts` | ✅ ProductDetailModal |
| RegionCode | `getRegionByCode(code)?.name` | `regionCodesJeju.ts` | ✅ 조건 확정 시 사용 |
| ItemCode | 미구현 (직접 문자열) | — | ⚠️ CargoRegistrationCard에서 raw code 표시 가능성 |
| WeightBand | 미구현 (직접 문자열) | — | ⚠️ 동일 |

## 3-4. CDS 위반 사례

### 발견된 위반

1. **`CargoRegistrationCard.tsx`에서 ItemCode raw 코드 표시 가능성**
   — `formatItemLabel()` 함수 미존재. ITEM_CODE_LABELS 미정의.
   — 영향 범위: UI 표시에서만 raw code(`IC01`)가 노출될 수 있음

2. **`DealPage.tsx: options` 하드코딩**
   ```typescript
   { id: 'OPT_INSURANCE', name: '화물 보험', price: 5000 }
   ```
   — 옵션 코드가 CDS 코드셋에 정의되어 있지 않음
   — MVP 허용 범위이나 CDS 확장 시 정리 필요

3. **`BothTabSection.tsx`의 `JEJU_LOCATIONS.find(l => l.id === locationId)` 사용**
   — POLICY_LOCKED으로 렌더링 비활성화됨 → 현재 영향 없음
   — 향후 POLICY_LOCKED 해제 시 RegionCode 기반으로 전환 필요

### 위반 없음 확인

- Offer seed의 `signature: 'INFO_OFFER'` → INFO_SIGNATURES.OFFER와 완전 일치
- `features: FeatureCode[]` 타입 적용 (offer.fields.ts + types/domain/offer.ts)
- `originCode/destinationCode: RegionCode` 기반 (10자리 법정동)

## 3-5. 결론

> **"CDS가 형식인지 실제 시스템인지"**

**실제 시스템 — 단, 완성도는 80%.**

- ✅ signature 분류 체계 (INFO_* / EVT_*)
- ✅ RegionCode 기반 지역 필터링
- ✅ FeatureCode 타입 적용 + 라벨 변환
- ✅ 이벤트 로그(DEAL_CONFIRMED, SETTLEMENT_CALCULATED 등) 실제 기록
- ⚠️ ItemCode / WeightBand / SizeBand는 타입 정의는 있으나 UI 라벨 변환 미완
- ⚠️ DealOption 코드셋 CDS 미편입

---

---

# 4. 데이터 흐름 무결성 검증

## 4-1. Seed → Repo → Engine 흐름

### 전체 흐름 검증

```
data/mock/records/offers.ts
  OFFER_RECORDS: InfoOfferRecord[]
  → signature: 'INFO_OFFER'
  → fields.originCode: '5011000000' (RegionCode)
  → fields.unitPricePerCube: 650
  → fields.capacityCubes: 400
        ↓
data/mock/builders/offer.builders.ts
  buildSeedOffers()
  → InfoOfferRecord[] → StorageProduct[] / RouteProduct[]
  → validateOfferSeed() 내부 검증 (G5)
        ↓
infra/storage/info/offer.repo.ts
  initIfNeeded()
  → localStorage 없으면: buildSeedOffers() → persist
  → localStorage 있으면: JSON.parse → in-memory cache
  → _storageCache / _routeCache (module-level singleton)
        ↓
useMatchingPreview.ts
  getAllStorageOffers() / getAllRouteOffers()   ← repo 직접 호출 ✅
  → runMatchingPipeline({ offers: getAllStorageOffers(), ... })
```

### Direct Mock Import 전수 조사

| 파일 | import 항목 | 사용 목적 | 위반 여부 |
|------|-----------|---------|----------|
| `ui/DealPage.tsx` | `DEMO_USER` | 정적 데모 사용자 표시 | ✅ 표시 전용 |
| `ui/CargoSummaryCard.tsx` | `PRODUCT_CATEGORIES, WEIGHT_RANGES` | 표시용 레이블 | ✅ 표시 전용 |
| `ui/QuantityInputCard.tsx` | `PRODUCT_CATEGORIES, WEIGHT_RANGES` | 표시용 레이블 | ✅ 표시 전용 |
| `ui/SearchResultModal.tsx` | `JEJU_LOCATIONS` | 지역명 표시 | ✅ 표시 전용 |
| `modals/SearchResultModal.tsx` | `JEJU_LOCATIONS` | 지역명 표시 | ✅ 표시 전용 |
| `sections/BothTabSection.tsx` | `JEJU_LOCATIONS` | 지역명 표시 (POLICY_LOCKED 비활성) | ✅ 표시 전용 |
| `__tests__/conditionFilters.test.ts` | mock data | 테스트용 | ✅ 허용 |

**중요 관찰**: `mockData.ts`는 Facade 패턴으로 구현됨.
- `STORAGE_PRODUCTS = getAllStorageOffers()` → repo의 in-memory 캐시 참조
- `JEJU_LOCATIONS`, `PRODUCT_CATEGORIES`, `WEIGHT_RANGES` → `adapters.ts` (표시용 어댑터, 필터링 금지 명시)
- `DEMO_USER` → 정적 더미 사용자 (인증 없는 MVP 한정)

**결론**: 직접 mock import 중 `STORAGE_PRODUCTS`나 `ROUTE_PRODUCTS`를 필터링/거래 로직에 사용하는 위반 사례 **없음** ✅

## 4-2. Storage 반영 검증

### remainingCubes 차감 흐름

```
DealPage.tsx → handleConfirmDeal()
  → allocateResource({ offerId, billableCubes })   [layers/matching/resource]
  → getStorageOfferById(offerId)                    [infra/storage/info/offer.repo]
  → offer.remainingCubes -= billableCubes           (in-place 수정)
  → _persistStorage() → localStorage.setItem(...)  (즉시 동기 영속)
  → 반환: 동일 객체 참조 (캐시 공유)
```

### G6 검증: 새로고침 후 remaining 유지

```typescript
// offer.repo.ts initIfNeeded()
const storedStorage = localStorage.getItem(STORAGE_KEYS.STORAGE_OFFERS)
if (storedStorage) {
  _storageCache = JSON.parse(storedStorage)  // 새로고침 후 복원
}
```

**판단**: ✅ 재고 차감 후 새로고침 시 `remainingCubes` 유지 확인됨 (localStorage 동기 영속).

## 4-3. Cargo 흐름

```
useCargoRegistration.ts
  addCargo() → 빈 CargoUI 생성
  onUpdateCargo() → 품목코드(itemCode), 중량, 박스 규격 입력
  onCompleteCargo() → RegisteredCargo로 전환
  → sumCm 계산 (widthCm + depthCm + heightCm)
  → weightBand 분류 (WBX/WBY/WBZ/WBH)
  → sizeBand 분류 (SB1~SBX)
        ↓
useMatchingPreview.ts
  session.cargos = registeredCargos.map(cargo → { id, sumCm, weightKg, itemCode, weightBand, sizeBand })
        ↓
runMatchingPipeline → adaptCargoForRegulation()
  → CargoForRegulation { sumCm, weightKg, moduleType, itemCode, ... }
  → filterOffersByRegulation(cargos, offers, mode, demand)
```

**관찰**: cargo 흐름에서 `signature` 부여 로직 확인 필요. CLAUDE.md에 명시된 `CargoInfo 생성 → signature 부여 → 규정 체크` 흐름 대비, 현재 구현은 `useCargoRegistration`에서 signature 없이 UI 상태(`CargoUI → RegisteredCargo`)만 관리하고, infra/storage/info/cargo.repo.ts를 통한 CDS 레코드 생성은 부분적으로만 연결됨.

## 4-4. 결론

> **"데이터 흐름이 단일 체계로 작동하는가?"**

**YES — Repo-only 원칙 준수됨.**

- ✅ 모든 Offer 데이터: repo → in-memory cache → matching pipeline
- ✅ 재고 차감: in-place + localStorage 즉시 영속
- ✅ 이벤트 로그: DEAL_CONFIRMED, SETTLEMENT_CALCULATED, RESOURCE_ALLOCATED 기록
- ⚠️ Cargo CDS 흐름: UI 상태(CargoUI)와 CDS 레코드(cargo.repo.ts) 연결이 느슨함
- ⚠️ JEJU_LOCATIONS 직접 import: adapters.ts를 통해 표시 전용이므로 위반 없으나 RegionCode 기반으로 전환 시 제거 가능

---

# 5. 서비스 로직 구조 검증 (4 레이어)

## 5-1. 각 레이어 역할 정의

| 레이어 | 정의 | 파일 |
|--------|------|------|
| **규정 (Regulation)** | 크기/중량/품목/최소물량 제약 — "허용 가능한가?" | `layers/matching/regulation/` |
| **자원 (Resource)** | 용량(remainingCubes) 체크 — "공급 가능한가?" | `layers/matching/resource/` |
| **조건 (Condition)** | 지역/날짜 문맥 필터 — "검색 조건에 맞는가?" | `layers/matching/condition/` |
| **거래 (Trade)** | 선택 → 정산 → 재고 차감 → 이벤트 로그 | `DealPage.tsx` + `infra/storage/` |

## 5-2. 실제 코드 연결 흐름

```
layers/matching/pipeline.ts (runMatchingPipeline)
  │
  ├─ [1] filterOffersByRegulation(cargos, offers, mode, demand)
  │    ├── maxSumCm 체크: cargo.sumCm <= offer.maxSumCm
  │    ├── maxWeightKg 체크: cargo.weightKg <= offer.maxWeightKg
  │    ├── allowedItemCodes 체크: cargo.itemCode in offer.allowedItemCodes
  │    └── minCubes 체크: demand.totalCubes >= offer.minCubes (물량 미입력 시 스킵)
  │
  ├─ [2] filterStorageByResource(passed, totalCubes)
  │    └── offer.remainingCubes >= demand.totalCubes (물량 미입력 시 스킵)
  │
  ├─ [3] filterStorageByConditions(passed, conditions)
  │    └── matchRegionCode(offer.location.regionCode, conditions.storageLocationCode)
  │        → getEffectivePrefix 계층 매칭 (시도/시군구/읍면동/리)
  │
  └─ [4] applySorting(filtered, 'LATEST')
       → id 역순 (MVP), PRICE_ASC (unitPricePerCube 기준 구현됨), DISTANCE_ASC (스텁)
```

## 5-3. 레이어 간 침범 여부

| 검사 항목 | 결과 |
|----------|------|
| 규정이 UI에서 처리되는가? | ✅ 없음 — 규정 체크는 pipeline.ts 내부에서만 실행 |
| 조건이 엔진(engine/) 외부에서 처리되는가? | ✅ 올바름 — engine/은 순수 계산만, 조건 필터는 layers/ |
| 자원 체크가 UI에서 직접 실행되는가? | ✅ 없음 — filterStorageByResource()만 호출됨 |
| 거래 로직이 규정 레이어로 누출되는가? | ✅ 없음 — allocateResource()는 DealPage에서만 호출 |
| engine/에 React import가 있는가? | ✅ 없음 — engine/은 순수 함수만 |

## 5-4. 결론

> **"레이어 구조가 유지되고 있는가?"**

**YES — 4레이어 구조 완전히 유지됨.**

- 각 레이어의 역할이 명확하게 분리됨
- 레이어 순서(Reg → Res → Cond → Trade) 파이프라인에서 강제됨
- engine/는 React-free 순수 함수만 포함
- 거래 로직(재고 차감, 이벤트 로그)이 UI 컴포넌트(DealPage)에만 위치하는 것은 허용 범위이나, 향후 backend 연결 시 `layers/trade/` 레이어로 이동 필요

---

# 6. 지도 ↔ 리스트 ↔ 데이터 동기화 검증

## 6-1. Mapbox 마커 구조

### Marker Map 구현 (`useMapLayers.ts:addPalletMarkers`)

```typescript
// 반환: Map<offerId, HTMLElement>
const markerElementMap = new Map<string, HTMLElement>()

getAllStorageOffers().forEach((storage) => {
  const el = document.createElement('div')
  el.className = 'offer-marker'
  el.dataset.offerId = storage.id    // ← offerId 기반 식별
  el.innerHTML = `<div class="offer-marker-inner">...</div>`

  markerElementMap.set(storage.id, el)   // ← Map에 저장
})

return markerElementMap   // ← useMapbox로 전달
```

### Highlight 업데이트 (`updateMarkerHighlights`)

```typescript
function updateMarkerHighlights(
  highlightedIds: Set<string> | null,
  markerElementMap: Map<string, HTMLElement>
): void {
  markerElementMap.forEach((el, offerId) => {
    if (highlightedIds && highlightedIds.has(offerId)) {
      el.classList.add('offer-marker--highlighted')
    } else {
      el.classList.remove('offer-marker--highlighted')
    }
  })
}
```

### useMapbox → Context 연결

```typescript
// useMapbox.ts
const { highlightedIds, previewResult } = useSearchResult()

useEffect(() => {
  updateMarkerHighlights(
    previewResult ? highlightedIds : null,   // previewResult=null → 전체 해제
    markerElementMap.current
  )
}, [highlightedIds, previewResult])
```

## 6-2. 타이밍 이슈 여부

| 타이밍 시나리오 | 처리 방식 |
|----------------|----------|
| 지도 로드 전 highlightedIds 변경 | `markerElementMap.current`가 비어있어 updateMarkerHighlights 호출 무해 |
| 마커 추가 이전 highlight 업데이트 | `addPalletMarkers()` 완료 후 `markerElementMap.current` 채워짐, 이후 effect 재실행 |
| Context 업데이트 지연 | `useMemo` 기반이므로 dependency 변경 즉시 재계산 |
| 정렬 변경 시 IDs 갱신 | `previewMatch.matchedOfferIds` → Context → `highlightedIds` → effect |

**결론**: ✅ 타이밍 이슈 없음. `previewResult null` 체크로 초기 상태에서의 false-highlight 방지됨.

## 6-3. DOM 직접 조작 제거 여부

| 파일 | 이전 | 현재 |
|------|------|------|
| `CommandLayout.tsx` | `document.querySelectorAll('.pallet-marker')` 존재 | ✅ 제거됨 — 단순 레이아웃 컴포넌트 |
| `useMapbox.ts` | highlight useEffect 없음 | ✅ updateMarkerHighlights useEffect 추가 |
| `useMapLayers.ts` | `.pallet-marker` 클래스명 | ✅ `.offer-marker`로 정리, Map 반환 |

**DOM `querySelectorAll` 검색 결과**: `src/` 전체 검색에서 **0건** ✅

**innerHTML 사용**: `useMapLayers.ts:58` — 새로 생성된 marker 요소의 초기 HTML 설정 (기존 DOM 조작 아님) ✅

## 6-4. 결론

> **"지도 ↔ 리스트 ↔ 데이터가 단일 체계로 동기화되는가?"**

**YES — 완전히 동기화됨.**

```
[조건/물량 변경]
  → useMatchingPreview (useMemo 재계산)
  → previewMatch.matchedOfferIds
  → SearchResultContext (setPreviewResult)
  → useMapbox.ts (highlightedIds useEffect)
  → updateMarkerHighlights (CSS 클래스 토글)

[검색 버튼 클릭]
  → handleSearch() → searchResult (스냅샷)
  → SearchResultContext (setSearchResult)
  → SearchResultModal (리스트)
  → ProductDetailModal (상세) → DealPage (거래)
```

---

# 7. 타입 / 코드 일관성 검증

## 7-1. 타입 중복 현황

### SearchResult — 단일화 완료 ✅

| 위치 | 역할 |
|------|------|
| `layers/types/matchingTypes.ts:149` | **정의 (SoT)** |
| `layers/types/index.ts` | re-export |
| `contexts/SearchResultContext.tsx` | import + re-export |
| `hooks/useServiceConsoleState.ts` | import + re-export |
| `hooks/useMatchingPreview.ts` | import |

이전에 존재했던 `SearchResultData` 인터페이스: **제거됨** ✅

### ServiceType / UIServiceType — 명확화 완료 ✅

```typescript
// hooks/useServiceConsoleState.ts
/**
 * UI 탭 타입 (소문자 3가지)
 * → ServiceConsole, 탭 전환, 상태 관리에 사용
 */
export type UIServiceType = 'storage' | 'transport' | 'both'

/**
 * @deprecated UIServiceType으로 대체됨
 * 하위 호환을 위해 alias로 유지
 */
export type ServiceType = UIServiceType
```

**외부 사용**: `DealPage.tsx`가 `ServiceType`을 import해 사용 중 (UIServiceType 직접 전환 권장)

## 7-2. 타입 vs 실제 데이터 불일치

### `StorageProduct.features: FeatureCode[]` 검증

- 타입 정의: `types/domain/offer.ts:32` — `features: FeatureCode[]` ✅
- 필드 정의: `infra/dataspec/fields/info/offer.fields.ts` — `features?: FeatureCode[]` ✅
- Seed 레코드: builders에서 FeatureCode[]로 변환됨
- UI 렌더링: `ProductDetailModal.tsx` → `formatFeatureLabel(feature)` 사용 ✅

### `signature` 필드 타입 약점

```typescript
// types/domain/offer.ts
interface StorageProduct {
  signature: string   // ← 'INFO_OFFER'을 string으로 받음
  // 더 강한 타입: signature: InfoSignatureValue ('INFO_OFFER' | 'INFO_CARGO' | ...)
}
```

- 현재: `string` 타입으로 검증 없음
- 권장: `signature: InfoSignatureValue` (literal type)
- 위험도: 낮음 (seed에서 올바른 값이 항상 설정됨)

### types/models.ts Compat Bridge 사용 현황

- `@deprecated` 표시됨
- **35개 파일**에서 여전히 `from '../../../../types/models'` import 사용 중
- 이 파일은 `types/domain/*`과 `types/ui/*`로의 re-export만 담당하므로 기능 영향 없음
- 점진적 마이그레이션 대상 (PR 이후 단계에서 처리)

## 7-3. signature 사용 여부

| 사용처 | 내용 | 평가 |
|--------|------|------|
| `data/mock/records/offers.ts` | `signature: 'INFO_OFFER'` (string literal) | ✅ CDS 규율 준수 |
| `infra/dataspec/signature/info.ts` | `INFO_SIGNATURES.OFFER = 'INFO_OFFER'` | ✅ 상수 정의 |
| `infra/dataspec/signature/event.ts` | `EVT_SIGNATURES.DEAL_CONFIRMED` 등 25개 | ✅ 상수 정의 |
| `infra/storage/event/` | `logDealConfirmed()` → `EVT_SIGNATURES.DEAL_CONFIRMED` | ✅ 상수 사용 |
| `layers/matching/regulation/` | signature 미사용 (cargo는 UI 상태 기반) | ⚠️ 규정 체크에 CDS signature 미연동 |

**핵심 관찰**: PREFIX LOCK의 "signature는 Code Data System 전용 taxonomy" 원칙에서,
레이어 로직의 cargo profile은 `RegisteredCargo` (UI 상태 타입) 기반이며 `signature` 필드가 없음.
이는 설계 의도와 일치 — cargo UI 상태는 CDS 레코드가 아닌 파생 뷰로 처리됨.

## 7-4. 결론

- ✅ SearchResult 타입 단일화 완료
- ✅ UIServiceType / ServiceType 명확화 완료
- ✅ FeatureCode 타입 적용 + 라벨 변환 완료
- ⚠️ `signature: string` → `InfoSignatureValue` literal type 강화 권장
- ⚠️ 35개 파일의 `types/models.ts` import → 점진적 `types/domain/*` 직접 import 전환 필요
- ⚠️ `DealPage.tsx`가 deprecated `ServiceType`을 사용 → `UIServiceType` 직접 사용 권장

---

---

# 8. Legacy / Stub / Dead Code 분석

## 8-1. Stub (기능 선언되었으나 실제 미작동)

### 날짜 필터 (조건 레이어)

```typescript
// layers/matching/condition/conditionFilters.ts
export function hasDateConditions(conditions: SearchConditions): {
  hasStorageDate: boolean
  hasTransportDate: boolean
}
```

- **현황**: 날짜 조건 입력 여부만 체크, 실제 offer 날짜 범위 필터링 없음
- **이유**: offer 타입에 `availableFrom/To` 필드가 없음 (PR7 이후 설계 예정)
- **위험도**: 중간 — 사용자가 날짜 입력해도 필터링 적용 안됨 (UI에서 날짜 설정 후 검색 시 전체 결과 반환)
- **제거/완성 계획**: Offer에 날짜 가용 필드 추가 후 실제 필터 구현 필요

### DISTANCE_ASC 정렬

```typescript
// layers/matching/pipeline.ts:applySorting
case 'DISTANCE_ASC':
  return [...offers]   // 스텁: 거리 계산 없이 원본 반환
```

- **현황**: 정렬 없이 원본 배열 반환
- **이유**: 좌표 기반 거리 계산 + 사용자 기준점 미구현
- **위험도**: 낮음 — UI에서 DISTANCE_ASC 정렬 선택지 미노출
- **완성 계획**: 사용자 위치 또는 선택 조건 좌표 기반 haversine 거리 계산 필요

### BothTabSection 통합 파이프라인

```typescript
// sections/BothTabSection.tsx
const POLICY_LOCKED = true  // 서비스 미제공 정책
```

- **현황**: 보관+운송 연계 서비스 전체 정책 잠금
- **이유**: 연계 상품 매칭(STORAGE+ROUTE 동시), 날짜 자동 연동, 복합 정산이 미완성
- **위험도**: 없음 — POLICY_LOCKED으로 UI 완전 비활성화
- **완성 계획**: `runCombinedPipeline()` 완성 + 연계 조건 UX + 복합 DealPage 구현 후 해제

### ItemCode / WeightBand / SizeBand 라벨 변환

- **현황**: 타입 정의는 있으나 `ITEM_CODE_LABELS`, `WEIGHT_BAND_LABELS` 미정의
- **이유**: UI에서 현재 raw code 또는 한글 문자열이 직접 사용됨
- **위험도**: 낮음 — MVP 더미 데이터 범위에서는 표시 일관성 유지 중
- **완성 계획**: featureCodes.ts와 동일 패턴으로 LABELS + formatLabel 함수 추가 필요

## 8-2. Dead Code

### `computeDemandFromArea` (`engine/cube/index.ts:70`)

```typescript
/** @deprecated 현재 사용처 없음. 제거 예정. */
export function computeDemandFromArea(areaM2: number, mode: DemandMode)
```

- **사용처**: src/ 전체 검색 결과 정의 파일 외 **0건**
- **위험도**: 없음
- **조치**: 안전하게 제거 가능

### `createAvailableMarkerSvg` + `createHighlightMarkerHtml` (`MapboxContainer/utils/style.ts`)

```typescript
/** @deprecated 외부 import 사용처 없음. 제거 예정. */
export function createAvailableMarkerSvg(): string { ... }

// 위 함수만 호출하는 또 다른 dead function
export function createHighlightMarkerHtml(): string {
  return `...${ createAvailableMarkerSvg() }...`
}
```

- **사용처**: style.ts 내부에서만 순환 참조 — 외부 import **0건**
- **이유**: CommandLayout의 DOM 조작 제거 시 함께 orphan됨
- **위험도**: 없음
- **조치**: 두 함수 모두 안전하게 제거 가능

### `types/models.ts` Compat Bridge

```typescript
/** @deprecated 직접 import 금지. types/domain/* 로 이동 중. */
```

- **사용처**: 35개 파일에서 import 중 — 즉시 제거 불가
- **역할**: 하위 호환 re-export만 담당 (runtime 영향 없음)
- **조치**: 점진적 마이그레이션 후 최종 제거

## 8-3. 위험도 분류

| 항목 | 분류 | 즉시 제거 가능 여부 |
|------|------|-------------------|
| `computeDemandFromArea` | Dead Code | ✅ 즉시 제거 가능 |
| `createAvailableMarkerSvg` | Dead Code | ✅ 즉시 제거 가능 |
| `createHighlightMarkerHtml` | Dead Code | ✅ 즉시 제거 가능 |
| 날짜 필터 stub | Stub | ❌ Offer 스키마 확장 후 완성 |
| DISTANCE_ASC 정렬 stub | Stub | ❌ 거리 계산 구현 후 완성 |
| BothTabSection POLICY_LOCKED | 정책 잠금 | ❌ 연계 UX 완성 후 해제 |
| `types/models.ts` compat | Legacy | ⚠️ 점진적 마이그레이션 |
| `ServiceType` @deprecated alias | Legacy | ⚠️ DealPage 전환 후 제거 |

---

# 9. 리스크 및 구조적 한계

## 9-1. 현재 구조의 한계

### L1. localStorage 단일 영속성

- **현황**: 모든 데이터(Offer 재고, 이벤트 로그, Cargo, DemandSession)가 localStorage에만 저장됨
- **한계**: 브라우저 탭 간 공유 불가, 시크릿 모드 무효, 용량 제한(~5MB)
- **위험**: 이벤트 로그 MAX_EVENTS=1000 초과 시 자동 trim (오래된 이벤트 손실)
- **준비**: Repo 패턴으로 추상화 완료 → backend 연결 시 repo 구현체만 교체하면 됨

### L2. In-memory 캐시 동기화

- **현황**: `_storageCache`, `_routeCache`는 module-level 변수 (싱글턴)
- **한계**: React 상태 외부에 있어 캐시 변경이 React 렌더링 트리거를 보장하지 않음
- **현재 해결**: `useMemo`의 dependency가 `getAllStorageOffers()` 결과가 아닌 UI 상태 변수 기반 → 재고 차감 후 `handleSearch()` 재실행으로 최신값 반영됨
- **위험**: 재고 차감 후 즉시 previewMatch가 갱신되지 않을 수 있음 (단, 검색 버튼 재클릭으로 해소)

### L3. Cargo CDS 연결 미완

- **현황**: `CargoUI → RegisteredCargo` (UI 상태) ↔ `InfoCargoRecord` (CDS) 간 연결이 느슨
- **한계**: cargo 상태가 CDS 레코드로 완전히 매핑되지 않아 이벤트 로그에서 cargo 추적이 불완전
- **현재 해결**: DemandSession 수준의 이벤트 로그(CUBE_CALCULATED 등)로 부분 추적
- **준비**: `cargo.repo.ts`와 `infra/dataspec/fields/info/cargo.fields.ts`는 확장 구조 이미 존재

### L4. 두 개의 SearchResultModal

```
src/components/Features/ServiceConsole/
  ├── ui/SearchResultModal.tsx       (구버전?)
  └── modals/SearchResultModal.tsx   (신버전?)
```

- **현황**: `ui/`와 `modals/` 폴더에 동일 이름 파일 존재 — 어느 것이 실제 사용되는지 확인 필요
- **위험**: 코드 중복 또는 버전 혼용 가능성
- **조치**: 사용처 확인 후 미사용 파일 제거 필요

## 9-2. 확장 시 위험

### R1. Backend 연결 시 repo 교체

- **준비도**: 높음 — 모든 데이터 접근이 `infra/storage/info/*.repo.ts`를 통해 추상화됨
- **위험**: `_storageCache` in-place 수정 패턴(`offer.remainingCubes =`) → backend에서는 불변성 전략 필요
- **조치**: `updateStorageOfferResource()` 시그니처는 그대로 두고 내부 구현만 API 호출로 교체

### R2. 상품 등록 페이지 확장

- **준비도**: 중간 — `InfoOfferRecord` 스키마는 완성됨
- **위험**: 현재 seed 레코드(8 storage + 8 route)가 하드코딩되어 있어 동적 등록 시 seed 충돌 방지 로직 필요
- **조치**: `offer.repo.ts`에 `addOffer()` 함수 추가 + localStorage 즉시 persist

### R3. 다중 사용자 / 실시간

- **준비도**: 낮음 — 현재 전체가 단일 사용자 localStorage 기반
- **위험**: 여러 사용자가 동일 재고에 접근하는 경합 조건(race condition) 처리 미구현
- **조치**: backend + 낙관적 잠금(optimistic locking) 또는 큐 기반 재고 처리 필요

---

# 10. 최종 아키텍처 평가

## 10-1. 현재 상태 한 줄 정의

> **"단일 파이프라인 + CDS 기반 구조가 완결되었으며, 큐브 거래 엔진이 실제로 구동된다. 단, localStorage 영속성 한계와 일부 stub/legacy가 남아있으며, backend 연결 준비는 완료된 상태다."**

## 10-2. 완성도 점수

| 영역 | 점수 | 세부 내용 |
|------|------|----------|
| **구조 (Architecture)** | 92/100 | 레이어 분리, SoT 원칙, 단일 파이프라인 완성. legacy compat bridge 잔존 |
| **데이터 (Data)** | 88/100 | Repo-only 흐름, RegionCode 체계, seed 검증. Cargo CDS 연결 느슨 |
| **엔진 (Engine)** | 95/100 | 큐브 계산, 정산, 재고 차감 모두 실제 구동. DISTANCE_ASC stub |
| **UI (UI/UX)** | 85/100 | 지도 동기화, 마커 하이라이트, DealPage 정산 시각화 완성. 날짜 필터 미작동 |
| **CDS** | 80/100 | signature 체계, FeatureCode 완성. ItemCode 라벨 변환 미완 |
| **테스트** | 70/100 | conditionFilters.test.ts, codeDataSystem.test.ts 존재. 커버리지 확인 필요 |

---

# 11. 최종 개발 청사진 (가장 중요)

## 11-1. 다음 단계

### Phase A: 즉시 처리 가능 (Dead Code 제거)

```
1. engine/cube/index.ts:70  → computeDemandFromArea 제거
2. MapboxContainer/utils/style.ts → createAvailableMarkerSvg + createHighlightMarkerHtml 제거
3. ui/SearchResultModal.tsx vs modals/SearchResultModal.tsx → 중복 확인 후 미사용 제거
4. DealPage.tsx → ServiceType → UIServiceType 직접 import 전환
```

### Phase B: PR7 완성 (재고 차감 + 거래 확정)

```
1. PR7: remainingCubes 차감 → localStorage 영속 (이미 구현됨 ✅)
2. 거래 확정 이벤트 로그 완성 (DEAL_CONFIRMED, SETTLEMENT_CALCULATED 이미 구현됨 ✅)
3. DemandSession → Deal 레코드 생성 (deal.repo.ts 구조 완성 필요)
```

### Phase C: 상품 등록 페이지

```
1. Provider 인증 흐름 설계 (MVP: 더미 Provider)
2. InfoOfferRecord 입력 폼 구현 (이미 schema 있음 → UI만 필요)
3. offer.repo.addOffer() 함수 추가
4. 신규 등록 상품의 Mapbox 마커 동적 추가
```

### Phase D: 날짜 필터 + 거리 정렬 완성

```
1. Offer 스키마에 availableFrom / availableTo 필드 추가
2. conditionFilters.ts 날짜 범위 필터 실제 구현
3. DISTANCE_ASC: haversine 거리 계산 + 사용자 기준점 설정
```

### Phase E: Backend 연결

```
1. infra/storage/info/*.repo.ts → API 클라이언트 교체
2. infra/storage/event/eventLog.ts → API append 교체
3. 인증 (JWT/OAuth) 레이어 추가
4. 낙관적 잠금으로 재고 충돌 방지
```

## 11-2. 반드시 유지해야 할 핵심 원칙

### 원칙 1: Cube SoT (절대 불변)
```
모든 수요, 용량, 재고, 정산은 큐브(250mm³) 단위로 계산
→ unitPricePerCube, capacityCubes, remainingCubes, billableCubes
→ 별도 "총 가격" 필드를 SoT로 사용 금지
```

### 원칙 2: CDS SoT (확장하되 분산 금지)
```
모든 코드셋은 infra/dataspec/codedata/에서 단일 정의
→ FeatureCode, ItemCode, WeightBand, SizeBand, RegionCode
→ 코드 → 라벨 변환은 반드시 format* 함수를 통해서만
→ UI에 raw code 직접 노출 금지
```

### 원칙 3: Repo-Only Data Flow (불변)
```
모든 Offer 데이터는 infra/storage/info/offer.repo.ts 경유
→ getAllStorageOffers() / getAllRouteOffers() 만 사용
→ STORAGE_PRODUCTS를 필터링/거래 로직에 직접 사용 금지
→ mock의 표시용 어댑터(JEJU_LOCATIONS 등) → 로직 사용 금지
```

### 원칙 4: Single Pipeline SoT (불변)
```
모든 검색 결과는 runMatchingPipeline() 통해서만
→ 지도 하이라이트, 리스트, 검색 카운트 모두 동일 소스
→ 컴포넌트별 별도 필터링 로직 금지
→ shadow computation 금지
```

### 원칙 5: Layer Contract (불변)
```
Regulation → Resource → Condition → Trade 순서 강제
→ Condition이 Regulation보다 먼저 실행 금지
→ Trade 로직이 Regulation/Resource 레이어에 누출 금지
→ engine/에 React import 금지 (순수 함수만)
```

## 11-3. 절대 깨지면 안 되는 것

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. CUBE_SPEC.volumeM3 = 0.015625 m³ (250mm³)                     │
│     CUBES_PER_PALLET = 128                                          │
│     PACKING_FACTOR = { STORAGE: 1.15, ROUTE: 1.10 }               │
│     → 이 상수를 바꾸면 모든 재고 비교가 무효화됨                    │
│                                                                     │
│  2. runMatchingPipeline의 파이프라인 순서                           │
│     Reg(1) → Res(2) → Cond(3) → Sort(4)                           │
│     → 순서 변경 시 "통과 불가 상품이 조건 필터에 노출"되는          │
│       데이터 무결성 파괴                                             │
│                                                                     │
│  3. offer.repo.ts의 in-memory 캐시 동일 참조 구조                  │
│     → mockData.STORAGE_PRODUCTS와 getAllStorageOffers()가 동일 배열 │
│       참조 → updateStorageOfferResource() 후 즉시 반영됨            │
│     → deep copy 또는 새 배열 반환으로 변경 시 재고 차감이           │
│       매칭 파이프라인에 반영 안됨                                    │
│                                                                     │
│  4. INFO_SIGNATURES / EVT_SIGNATURES 값                            │
│     → 이 값들이 localStorage에 저장된 이벤트 로그의 eventType과    │
│       직접 매핑됨 → 값 변경 시 기존 로그 조회 불가                  │
│                                                                     │
│  5. SearchResult 타입의 단일 SoT                                    │
│     → layers/types/matchingTypes.ts 외에 별도 정의 금지             │
│     → 컴포넌트별 변형 타입 생성 금지                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 종합 결론

> **이 구조로 계속 가도 되는가?** — **YES.**
> Cube SoT + CDS SoT + Single Pipeline + 4-Layer Contract가 모두 작동 중이며 구조적 견고성이 확보됨.

> **어디를 건드리면 무너지는가?** — 위 "절대 깨지면 안 되는 것" 5개 항목.
> 특히 cubeConfig 상수, 파이프라인 순서, repo 캐시 참조 구조.

> **다음 단계에서 무엇을 해야 하는가?**
> 1. Dead code 3개 즉시 제거 (computeDemandFromArea, 두 marker 함수)
> 2. SearchResultModal 중복 파일 확인 및 정리
> 3. ItemCode 라벨 변환 완성 (featureCodes.ts 패턴 적용)
> 4. Phase B~E 순서로 backend 연결 준비

---

**작성 완료**: 2026-02-24
**기준 커밋**: `04a7ddd` (Final Stabilization Patch — CDS 기반 완결)
**다음 리뷰 시점**: PR7 완성 후 (재고 차감 + 거래 확정 완성 시점)
