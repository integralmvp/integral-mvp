# [4] Code Data System 분석

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 4/11: Code Data System

---

## 4-1. 요약

Code Data System은 플랫폼의 두 번째 핵심 축이다. "선 규정, 후 거래" 원칙을 데이터 구조로 구현한다. 모든 데이터는 **localStorage 기반**이며, 이벤트 로그는 **append-only**로 관리된다. 백엔드 DB로 전환 시 localStorage 키를 API 호출로 대체하는 구조다.

---

## 4-2. 코드 정의 파일 위치

| 코드셋 | 파일 경로 | 설명 |
|--------|-----------|------|
| 품목 코드 (ItemCode) | `src/data/itemCodes.ts` | IC01~IC99 (30개) |
| 중량 밴드 (WeightBand) | `src/data/bands.ts` | WBX/WBY/WBZ/WBH (4개) |
| 사이즈 밴드 (SizeBand) | `src/data/bands.ts` | SB1/SB2/SB3/SB4/SBX (5개) |
| Feature 코드 | `src/data/featureCodes.ts` | F_xxx (8개, Storage 전용) |
| 지역 코드 (RegionCode) | `src/data/regionCodesJeju.ts` | 제주 법정동 코드 (10자리) |
| 포장 모듈 | `src/engine/cubeConfig.ts` | 소형/중형/대형/UNCLASSIFIED |
| 이벤트 타입 | `src/types/models.ts` | PlatformEventType (22종) |

---

## 4-3. Code Data Dictionary

### A. 품목 코드 (ItemCode)

| group | code | label | flags |
|-------|------|-------|-------|
| 일반 | IC01 | 일반잡화(비파손) | - |
| 일반 | IC02 | 의류/패션/섬유 | - |
| 일반 | IC03 | 도서/인쇄물/서류 | - |
| 일반 | IC04 | 완구/취미/스포츠 | - |
| 일반 | IC05 | 가구/인테리어(소형) | oversizeRisk |
| 식품 | IC10 | 식품(상온·가공) | - |
| 식품 | IC11 | 농산물(신선) | perishable |
| 식품 | IC12 | 축산/수산(신선) | perishable, **tempRequired** |
| 식품 | IC13 | 냉장/냉동 식품(포장완료) | **tempRequired** |
| 식품 | IC14 | 음료(병/캔/페트) | liquid |
| 취급주의 | IC20 | 유리/도자기/사기 | fragile |
| 취급주의 | IC21 | 전자기기/가전(배터리 없음) | fragile |
| 취급주의 | IC22 | 배터리 포함 전자/리튬배터리 | battery, hazmatLike |
| 취급주의 | IC23 | 정밀/고가품 | fragile |
| 취급주의 | IC24 | 예술품/액자/피규어 | fragile, oversizeRisk |
| 액체/화학 | IC30 | 액체류(비위험) | liquid |
| 액체/화학 | IC31 | 페인트/도료(수성) | liquid |
| 액체/화학 | IC32 | 윤활유/오일 | liquid, hazmatLike |
| 액체/화학 | IC33 | 화학제품/세정제 | hazmatLike |
| 액체/화학 | **IC34** | **위험물/인화성/폭발물** | hazmatLike (**RESTRICTED**) |
| 의료 | IC40 | 의약품/의료기기(상온) | - |
| 의료 | IC41 | 검체/생물/냉장필수 | tempRequired, hazmatLike |
| 특수 | IC50 | 중량물(특수) | oversizeRisk |
| 특수 | IC51 | 장척/대형(특수) | oversizeRisk |
| 특수 | IC52 | 이사/벌크/혼합짐 | oversizeRisk |
| 기타 | IC99 | 기타(분류불가/미정) | - |

**RESTRICTED_CODES**: `['IC34']` — 플랫폼 게이트에서 기본 차단
**SPECIAL_HANDLING_CODES**: `['IC34', 'IC41']` — 특수 취급 필요
**tempRequired**: IC10(농산물), IC12(축산/수산), IC13(냉장냉동), IC41(검체)
→ `isTempRequiredItem()` — 실제 코드에서는 IC10, IC12만 체크 (IC13, IC41 누락)

**코드 사용처**: `CargoSignature.itemCode`, `OfferRegulationFields.allowedItemCodes`, `checkRegulation()`, `adaptCargoForRegulation()`

### B. 중량 밴드 (WeightBand)

| code | label | 범위 |
|------|-------|------|
| WBX | 초경량 (≤5kg) | 0 < kg ≤ 5 |
| WBY | 경량 (≤20kg) | 5 < kg ≤ 20 |
| WBZ | 중량 (≤30kg) | 20 < kg ≤ 30 |
| WBH | 중량물 (>30kg) | kg > 30 |

**계산 함수**: `getWeightBand(weightKg: number): WeightBand` (`data/bands.ts`)
**사용처**: `CargoSignature.weightBand`, `CargoInfo.signature`

### C. 사이즈 밴드 (SizeBand)

| code | label | 범위 (3변합) |
|------|-------|------------|
| SB1 | 소형 (≤80cm) | sumCm ≤ 80 |
| SB2 | 표준 (≤120cm) | 80 < sumCm ≤ 120 |
| SB3 | 중형 (≤160cm) | 120 < sumCm ≤ 160 |
| SB4 | 대형 (≤170cm) | 160 < sumCm ≤ 170 |
| SBX | 특대형 (>170cm) | sumCm > 170 |

**계산 함수**: `getSizeBand(sumCm: number): SizeBand` (`data/bands.ts`)
**사용처**: `CargoSignature.sizeBand`, `CargoInfo.signature`

### D. 포장 모듈 (ModuleClassification)

| code | label | 치수 (mm) | 분류 기준 |
|------|-------|----------|----------|
| 소형 | 소형 | 550×275 | fitsModule() 최소 면적 |
| 중형 | 중형 | 550×366 | fitsModule() |
| 대형 | 대형 | 650×450 | fitsModule() |
| UNCLASSIFIED | 분류불가 | - | 위 3개 불일치 |

**계산 함수**: `classifyModule(box: BoxInput): ShapeCheck` (`engine/shapeClassifier.ts`)
**버퍼**: ±10mm, 90도 회전 허용
**사용처**: `CargoSignature.moduleClass`, `OfferRegulationFields.allowedModuleClasses`

### E. Feature 코드 (Storage 전용)

| code | label |
|------|-------|
| F_24H_INOUT | 24시간 입출고 |
| F_FORKLIFT | 지게차 보유 |
| F_CCTV | CCTV |
| F_TEMP_MONITORING | 온도 모니터링 |
| F_FAST_FREEZE | 급속 냉동 |
| F_PARKING | 주차 공간 |
| F_FOOD_SPECIALIZED | 식품 특화 |
| F_AGRI_SPECIALIZED | 농산물 특화 |

**사용처**: `StorageProduct.features[]` (mockData)
**현재 상태**: 코드 타입만 정의, 실제 상품 데이터는 아직 한글 문자열로 사용 중 — **정합성 문제**

### F. 지역 코드 (RegionCode)

- **형식**: 10자리 문자열 (법정동 코드)
- **예시**: `'5011000000'` = 제주시, `'5013000000'` = 서귀포시
- **파일**: `data/regionCodesJeju.ts` (JEJU_REGION_CODES 배열)
- **레벨**: province/city/town/district/ri
- **항만 특수 코드**: `'JEJU_PORT'`, `'BUSAN_PORT'`, `'SEOGWIPO_PORT'` (`regionRepresentativeCoords.ts`)
- **사용처**: `StorageCondition.locationCode`, `TransportCondition.originCode/destinationCode`, `conditionFilters.ts`

---

## 4-4. ID 체계

| 엔티티 | 형식 | 생성 함수 | 예시 |
|--------|------|----------|------|
| CargoInfo | `cargo_{timestamp36}{random16}` | `makeCargoId()` | `cargo_lz1234abcdef...` |
| DemandSession | `demand_{timestamp36}{random16}` | `makeDemandId()` | `demand_lz5678...` |
| PlatformEvent | `evt_{timestamp36}{random16}` | `makeEventId()` | `evt_lz9012...` |
| Deal | `deal_{timestamp36}{random16}` | `makeDealId()` | `deal_lzabcd...` |

---

## 4-5. 이벤트 로그 (PlatformEventType 전수 조사)

`types/models.ts`에 정의된 22종 이벤트:

| 카테고리 | 이벤트 타입 |
|---------|-----------|
| Cargo | `CARGO_CREATED`, `CARGO_REMOVED`, `CARGO_SIGNATURE_UPDATED` |
| Rule | `RULE_CHECKED`, `RULES_PASSED` |
| Quantity | `QUANTITY_SET`, `CUBE_CALCULATED`, `RESOURCE_READY` |
| Storage | `STORAGE_CONDITION_SET`, `STORAGE_SEARCHED`, `STORAGE_SELECTED` |
| Transport | `TRANSPORT_CONDITION_SET`, `TRANSPORT_SEARCHED`, `TRANSPORT_SELECTED` |
| Search | `SEARCH_EXECUTED` |
| DemandSession | `DEMAND_SESSION_CREATED`, `RESOURCE_CHECKED` |
| Deal (PR7) | `DEAL_CREATED`, `DEAL_SUBMITTED`, `DEAL_CONFIRMED`, `DEAL_CANCELLED` |
| Settlement (PR7) | `SETTLEMENT_CALCULATED` |
| Resource (PR7) | `RESOURCE_ALLOCATED` |

**저장 방식**: `localStorage[integral_mvp_v1_events]` — 최대 1000개, 초과 시 오래된 것 삭제

---

## 4-6. localStorage 키 구조

```
integral_mvp_v1_cargos              → CargoInfo[]
integral_mvp_v1_demands             → DemandSession[]
integral_mvp_v1_active_demand_storage → demandId (string)
integral_mvp_v1_active_demand_route   → demandId (string)
integral_mvp_v1_active_demand_both    → demandId (string)
integral_mvp_v1_events              → PlatformEvent[] (max 1000)
integral_mvp_v1_deals               → Deal[]
integral_mvp_v1_settings            → 설정 (현재 미사용)
```

---

## 4-7. 핵심 흐름 (CargoInfo 생성 → DemandSession 연결)

```
1. CargoUI 입력 완료 → completeCargo() [useServiceConsoleState.ts:378]
2. checkQuickRulesWithLogging() — 즉각 규정 경고
3. addCargo(CreateCargoParams) [cargoStore.ts:69]
   ├─ makeCargoId() → cargo_xxx
   ├─ calculateSumCm(w,d,h) → sumCm
   ├─ getWeightBand(weightKg) → WBX/WBY/WBZ/WBH
   ├─ getSizeBand(sumCm) → SB1~SBX
   ├─ classifyModule(box) → 소형/중형/대형/UNCLASSIFIED
   ├─ CargoInfo 조립 (signature + fields)
   ├─ localStorage.setItem(CARGOS)
   └─ logCargoCreated() → 이벤트 기록
4. addCargoToDemand(currentDemandId, cargoInfo.id) [demandStore.ts]
5. setRegisteredCargos([...registeredCargos, registeredCargo])
```

---

## 4-8. 정합성 검사

| 문제 | 위치 | 심각도 |
|------|------|--------|
| `tempRequired` 불일치: IC13, IC41이 `isTempRequiredItem()`에서 누락 | `engine/regulation/regulationEngine.ts:278-281` | 중 |
| `StorageProduct.features[]`가 `FeatureCode` 타입이 아닌 한글 문자열 | `data/mockData.ts` | 중 |
| `price` 필드: mockData에 정의되어 있으나 실제 계산에 미사용 | `data/mockData.ts`, `types/models.ts` | 하 |
| `JEJU_LOCATIONS.id`와 `locationCode` 혼용 (getLocationName이 id 기반) | `components/Layout/ServiceConsole/ui/SearchResultModal.tsx:19-23` | 중 |
| 중복 코드: `ItemCode`가 data/bands.ts의 WeightBand/SizeBand와 함께 독립 코드셋으로 관리 | 설계상 의도적 분리 | - |

---

*근거 파일: `data/itemCodes.ts`, `data/bands.ts`, `data/featureCodes.ts`, `data/regionCodesJeju.ts`, `store/storageKeys.ts`, `store/id.ts`, `store/cargoStore.ts`, `store/eventLog.ts`, `types/models.ts`*
