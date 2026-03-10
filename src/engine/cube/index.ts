// ============================================
// INTEGRAL MVP - Cube Engine (계산 전용)
// ============================================
// 큐브 계산·단위 변환·형상 분류의 단일 진입점
// (규정/자원/매칭은 layers/로 이동됨)

// ============ Exports ============

// 설정
export { CUBE_CONFIG, CUBES_PER_PALLET, REFERENCE_WAREHOUSE, REFERENCE_TRUCK, STORAGE_AREA_CONSTANTS, type ModuleName } from './cubeConfig'

// 형상 분류
export { classifyModule, classifyBoxes, hasUnclassified, type BoxInput, type ShapeCheck } from './shapeClassifier'

// 큐브 계산
export { calcCubeDemand, type DemandMode, type CubeDemand, type ModuleSummary } from './cubeEngine'

// 단위 변환
export {
  cubesToPallets, palletsToCubes, areaTopallets, areaToCubes,
  cubesToCBM, palletsToCBM, cbmToWarehouseCount, cbmToTruckCount,
  // Storage 전용: 운영계수 보정 환산
  palletsToAreaM2, palletsToAreaPyeong, areaToPalletsWithFactor, areaPyeongToPalletsWithFactor
} from './unitConvert'

// ============ 통합 인터페이스 ============

import { calcCubeDemand, type DemandMode, type CubeDemand } from './cubeEngine'
import { cubesToPallets } from './unitConvert'
import type { BoxInput } from './shapeClassifier'

/**
 * 수요 계산 결과 (통합 인터페이스)
 */
export interface DemandResult {
  demandCubes: number           // 필요 큐브 수 (정수)
  demandPallets?: number        // 필요 파렛트 수 (정수, STORAGE 모드만)
  moduleSummary: CubeDemand['byModule']  // 모듈별 요약
  hasUnclassified: boolean      // UNCLASSIFIED 박스 존재 여부
  // 상세 정보 (확장용)
  detail: CubeDemand
}

/**
 * 박스 입력 기반 수요 계산 (메인 함수)
 */
export function computeDemand(
  boxes: BoxInput[],
  mode: DemandMode
): DemandResult {
  const cubeDemand = calcCubeDemand(boxes, mode)
  const demandCubes = cubeDemand.totalCubes
  const demandPallets = mode === 'STORAGE' ? cubesToPallets(demandCubes) : undefined

  return {
    demandCubes,
    demandPallets,
    moduleSummary: cubeDemand.byModule,
    hasUnclassified: cubeDemand.hasUnclassified,
    detail: cubeDemand,
  }
}


