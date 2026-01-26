// ============================================
// INTEGRAL MVP - 플랫폼 통합 엔진
// ============================================
// 모든 계산 로직의 단일 진입점
// Phase 1: 엔진 빌드 - 완료
// Phase 2-3: 운영계수 보정 환산 - 완료
// Phase 4: 검색·매칭 타입/스텁 준비 - 완료
// PR4: 실제 매칭 구현 예정

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

// 매칭 타입 (Phase 4)
export type {
  StorageDemand, RouteDemand,
  StorageOffer, RouteOffer,
  MatchValidation, MatchScore, MatchResult,
  StorageSearchRequest, RouteSearchRequest,
  StorageSearchResponse, RouteSearchResponse,
  StorageMatchResult, RouteMatchResult,
} from './matchingTypes'

// 매칭 엔진 (Phase 4 - 스텁)
export {
  checkCapacity,
  filterStorageOffers, filterRouteOffers,
  validateStorageMatch, validateRouteMatch,
  scoreStorageMatch, scoreRouteMatch,
  estimateStorageCost, estimateRouteCost,
  createStorageMatchResult, createRouteMatchResult,
  searchStorageOffers, searchRouteOffers,
} from './matchingEngine'

// 규정 체크 (Code Data System)
export {
  checkCargoRules,
  checkCargoRulesWithLogging,
  checkQuickRules,
  checkQuickRulesWithLogging,
  getRuleReasonMessage,
  getRuleResultMessages,
  hasWarnings,
  getPlatformLimits,
} from './rules'
export type { RuleCheckResult, RuleReason } from './rules'

// ============ 통합 인터페이스 ============

import { calcCubeDemand, type DemandMode, type CubeDemand } from './cubeEngine'
import { cubesToPallets, areaToCubes } from './unitConvert'
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
 * @param boxes 박스 입력 리스트
 * @param mode 계산 모드 (STORAGE | ROUTE)
 * @returns 수요 계산 결과
 */
export function computeDemand(
  boxes: BoxInput[],
  mode: DemandMode
): DemandResult {
  // 큐브 수요 계산
  const cubeDemand = calcCubeDemand(boxes, mode)

  // 모드별 처리
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

/**
 * 면적 입력 기반 수요 계산 (Fallback)
 * @param areaM2 면적 (㎡)
 * @param mode 계산 모드 (STORAGE | ROUTE)
 * @returns 수요 계산 결과
 */
export function computeDemandFromArea(
  areaM2: number,
  mode: DemandMode
): Pick<DemandResult, 'demandCubes' | 'demandPallets'> {
  // 면적 → 큐브
  const demandCubes = areaToCubes(areaM2)
  const demandPallets = mode === 'STORAGE' ? cubesToPallets(demandCubes) : undefined

  return {
    demandCubes,
    demandPallets,
  }
}
