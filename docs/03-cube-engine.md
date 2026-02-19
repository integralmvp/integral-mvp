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
