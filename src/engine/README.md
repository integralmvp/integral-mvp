# INTEGRAL MVP - 플랫폼 통합 엔진

## 📋 개요

플랫폼의 모든 계산 로직을 하나의 체계로 통합한 **Cube 기반 계산 엔진**입니다.

### 핵심 원칙

- **단일 내부 단위**: Cube (250×250×250mm, 0.015625m³)
- **모드별 거래 단위**:
  - 보관 (STORAGE): Pallet (자연수)
  - 운송 (ROUTE): Cube (자연수)
- **포장 모듈**: 형상 검증 + 표준 분류 (계산 중심 아님)

---

## 🏗️ 구조

```
/src/engine/
├── cubeConfig.ts        # 전역 표준 상수
├── shapeClassifier.ts   # 형상 분류기
├── cubeEngine.ts        # 큐브 수요 계산 엔진
├── unitConvert.ts       # 단위 변환 유틸리티
├── index.ts             # 통합 인터페이스 (메인)
└── README.md            # 이 문서
```

---

## 📦 주요 상수 (cubeConfig.ts)

### 큐브 (내부 계산 단위)
- 크기: 250×250×250mm
- 체적: 0.015625 m³

### 파렛트 (보관 거래 단위)
- 크기: 1100×1100×1800mm
- **1 파렛트 = 128 큐브** (플랫폼 표준)

### 포장 효율 보정계수
- STORAGE: 1.15 (보관 시 여유 공간)
- ROUTE: 1.10 (운송 시 적재 효율)

### 표준 포장 모듈 (형상 검증용)
- 소형: 550×275mm (8분할)
- 중형: 550×366mm (6분할)
- 대형: 650×450mm (4분할)

---

## 🔧 사용법

### 1. 기본 사용 (computeDemand)

```typescript
import { computeDemand, type BoxInput } from '@/engine'

const boxes: BoxInput[] = [
  { widthMm: 300, depthMm: 200, heightMm: 150, count: 10 },
  { widthMm: 500, depthMm: 350, heightMm: 200, count: 5 },
]

// 보관 모드 (파렛트 단위)
const storageResult = computeDemand(boxes, 'STORAGE')
console.log('필요 파렛트:', storageResult.demandPallets)  // 예: 3

// 운송 모드 (큐브 단위)
const routeResult = computeDemand(boxes, 'ROUTE')
console.log('필요 큐브:', routeResult.demandCubes)  // 예: 256
```

### 2. 면적 입력 (Fallback)

```typescript
import { computeDemandFromArea } from '@/engine'

const result = computeDemandFromArea(10, 'STORAGE')  // 10㎡
console.log('필요 파렛트:', result.demandPallets)  // 예: 9
```

### 3. 형상 분류 (classifyModule)

```typescript
import { classifyModule } from '@/engine'

const box = { widthMm: 300, depthMm: 200, heightMm: 150, count: 1 }
const result = classifyModule(box)

console.log(result.module)  // '소형' | '중형' | '대형' | 'UNCLASSIFIED'
```

---

## 📊 DemandResult 구조

```typescript
{
  demandCubes: number           // 필요 큐브 수 (정수)
  demandPallets?: number        // 필요 파렛트 수 (STORAGE만, 정수)
  moduleSummary: ModuleSummary[]  // 모듈별 요약 (설명용)
  hasUnclassified: boolean      // UNCLASSIFIED 박스 존재 여부
  detail: CubeDemand            // 상세 정보 (확장용)
}
```

---

## 🎯 계산 플로우

### 보관 (STORAGE)

```
박스 입력
  ↓
실제 체적 합산 (m³)
  ↓
포장 효율 적용 (×1.15)
  ↓
큐브 수 계산 (정수, ceil)
  ↓
파렛트 환산 (÷128, ceil)
  ↓
결과: N 파렛트
```

### 운송 (ROUTE)

```
박스 입력
  ↓
실제 체적 합산 (m³)
  ↓
포장 효율 적용 (×1.10)
  ↓
큐브 수 계산 (정수, ceil)
  ↓
결과: N 큐브
```

---

## ⚠️ 중요 규칙

### 거래 단위 분리
- **보관**: 반드시 Pallet 단위만 사용
- **운송**: 반드시 Cube 단위만 사용
- "약 N 파렛트" 표기 금지 → 항상 정수 (ceil)

### UNCLASSIFIED 처리
- 표준 모듈 범위를 벗어난 박스 발견 시 `hasUnclassified: true`
- UI에서 "면적 단위 입력"으로 유도
- 디버그 메시지는 console.warn만 (사용자 UI에 노출 금지)

### 확장성
- Phase 2-4: 매칭/추천/AI 확장 대비
- 모든 함수는 순수 함수로 구현
- 데이터 모델과 시그니처는 확장 가능하게 설계

---

## 🔄 Phase 로드맵

- **Phase 1** (완료): 엔진 빌드 ✅
- **Phase 2**: 보관/운송 탭 UI 적용
- **Phase 3**: 운송 수요면적란 수정 (Cube 단위)
- **Phase 4**: 매칭/필터링/추천 기능

---

**작성일**: 2025.01.24
**버전**: Phase 1 (엔진 빌드 완료)
