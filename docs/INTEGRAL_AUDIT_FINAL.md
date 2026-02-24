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

*(섹션 4-11은 다음 커밋에서 계속)*
