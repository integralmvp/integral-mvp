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
