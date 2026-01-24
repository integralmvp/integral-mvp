// ============================================
// INTEGRAL MVP - 플랫폼 통합 엔진 설정
// ============================================
// Cube 기반 단일 내부 계산 단위 표준
// Phase 1: 엔진 빌드

/**
 * 큐브 (내부 계산 단일 단위)
 * - 250×250×250mm
 * - 체적: 0.015625 m³
 */
export const CUBE_SPEC = {
  sizeMm: 250,               // mm (한 변 길이)
  volumeM3: 0.015625,        // m³ (0.25 × 0.25 × 0.25)
} as const

/**
 * 파렛트 (보관 거래 단위)
 * - 1100×1100×1800mm
 * - 1 파렛트 = 128 큐브 (플랫폼 표준)
 */
export const PALLET_SPEC = {
  widthMm: 1100,             // mm
  depthMm: 1100,             // mm
  heightMm: 1800,            // mm
  volumeM3: 2.178,           // m³ (1.1 × 1.1 × 1.8)
  baseAreaM2: 1.21,          // m² (1.1 × 1.1)
} as const

/**
 * 큐브-파렛트 환산 비율
 * 1 파렛트 = 128 큐브 (플랫폼 표준)
 */
export const CUBES_PER_PALLET = 128

/**
 * 포장 효율 보정계수 (Packing Factor)
 * - STORAGE: 1.15 (보관 시 여유 공간)
 * - ROUTE: 1.10 (운송 시 적재 효율)
 */
export const PACKING_FACTOR = {
  STORAGE: 1.15,
  ROUTE: 1.10,
} as const

/**
 * 표준 포장 모듈 스펙 (형상 검증 + 분류용)
 * - SMALL: 550×275mm (8분할)
 * - MEDIUM: 550×366mm (6분할)
 * - LARGE: 650×450mm (4분할)
 */
export const MODULE_SPECS = {
  소형: {
    widthMm: 550,
    depthMm: 275,
    label: '소형(8분할)',
  },
  중형: {
    widthMm: 550,
    depthMm: 366,
    label: '중형(6분할)',
  },
  대형: {
    widthMm: 650,
    depthMm: 450,
    label: '대형(4분할)',
  },
} as const

/**
 * 형상 분류 버퍼
 * - 절대값: +10mm (허용 오차)
 * - % 허용오차 금지 (분류 모순 방지)
 * - 90도 회전 허용
 */
export const SHAPE_BUFFER_MM = 10

/**
 * 통합 설정 (모든 설정을 하나의 객체로 export)
 */
export const CUBE_CONFIG = {
  cube: CUBE_SPEC,
  pallet: PALLET_SPEC,
  cubesPerPallet: CUBES_PER_PALLET,
  packingFactor: PACKING_FACTOR,
  moduleSpecs: MODULE_SPECS,
  shapeBufferMm: SHAPE_BUFFER_MM,
} as const

/**
 * Storage 면적 환산 전용 상수
 * - 운영계수(storageAreaFactor): 창고 운영 시 동선/여유/벽면 고려
 * - 1 파레트 바닥면적 × 운영계수 = 실제 필요 창고 면적
 */
export const STORAGE_AREA_CONSTANTS = {
  palletFootprintM2: 1.21,     // 파레트 바닥면적 (1.1m × 1.1m) - PALLET_SPEC.baseAreaM2와 동일
  storageAreaFactor: 1.30,     // 운영계수 (동선/여유/벽면 고려)
  m2PerPyeong: 3.3058,         // 1평 = 3.3058㎡
} as const

/**
 * 기준 창고 (시각화 참고용) - 레거시, 더 이상 사용하지 않음
 * - 10평 = 33㎡ × 3m = 99 CBM
 */
export const REFERENCE_WAREHOUSE = {
  areaM2: 33,              // 10평
  heightM: 3,              // 천장 높이
  volumeCBM: 99,           // 체적 (33 × 3)
} as const

/**
 * 기준 트럭 (시각화 참고용)
 * - 1톤 트럭 = 7 CBM
 */
export const REFERENCE_TRUCK = {
  capacityCBM: 7,          // 적재 체적
  label: '1톤 트럭',
} as const

/**
 * 모듈 타입 (타입 안전성)
 */
export type ModuleName = keyof typeof MODULE_SPECS
