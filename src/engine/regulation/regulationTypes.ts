/**
 * Regulation Engine - 타입 정의
 *
 * PR4: 규정 → 자원 → 거래 흐름에서
 * "화물(Cargo) ↔ 공급상품(Offer)" 매칭 가능 여부를 판단하는 규정 엔진
 *
 * 기존 ruleCheck.ts: 화물 자체가 플랫폼 기본 규격에 맞는지 체크
 * 이 regulationEngine: 화물과 특정 offer(상품)이 매칭 가능한지 체크
 */

import type { ModuleClassification, WeightBand, SizeBand } from '../../types/models'

// ============ 규정 판정 결과 ============

/**
 * RegulationReason - 규정 불통과 사유
 *
 * MVP에서 지원하는 4대 기준 + 선택적 플래그
 */
export type RegulationReason =
  // 핵심 4대 기준
  | 'ITEM_NOT_ALLOWED'        // 품목 제한: offer가 해당 품목 허용 안함
  | 'WEIGHT_OVER_LIMIT'       // 중량 제한: cargo.weightKg > offer.maxWeightKg
  | 'SIZE_OVER_LIMIT'         // 규격 제한: cargo.sumCm > offer.maxSumCm
  | 'MIN_QTY_NOT_MET'         // 최소 물량: demand.totalCubes < offer.minCubes
  // 선택적 플래그 기반
  | 'TEMP_REQUIRED_NOT_SUPPORTED'   // 냉장/냉동 필요한데 offer가 미지원
  | 'HAZMAT_NOT_SUPPORTED'          // 위험물인데 offer가 미지원
  | 'MODULE_NOT_SUPPORTED'          // 포장 모듈(소/중/대)이 offer 미지원
  // 조건 불일치 (장소/일정)
  | 'LOCATION_NOT_SUPPORTED'  // 지역/경로 불일치
  | 'DATE_NOT_SUPPORTED'      // 일정 불일치

/**
 * CargoSignature - 화물 시그니처 (매칭 키)
 */
export interface CargoSignature {
  moduleClass: ModuleClassification
  itemCode: string
  weightBand: WeightBand
  sizeBand: SizeBand
}

/**
 * OfferSignature - 공급 상품 시그니처 (매칭 기준)
 */
export interface OfferSignature {
  offerId: string
  offerType: 'STORAGE' | 'ROUTE'
  // 규정 필드 요약
  maxWeightKg: number
  maxSumCm: number
  minCubes: number
  allowedItemCodes?: string[]
  allowedModuleClasses?: ModuleClassification[]
  tempSupported: boolean
  hazmatSupported: boolean
}

/**
 * RegulationDecision - 규정 판정 결과
 */
export interface RegulationDecision {
  pass: boolean
  reasons: RegulationReason[]  // 내부 기록용 (불통과 사유)
  signature: {
    cargo: CargoSignature
    offer: OfferSignature
    matchedKeys: string[]  // 매칭된 키 목록 (예: ['itemCode', 'weightBand'])
  }
}

// ============ 공급 상품 규정 필드 (MVP) ============

/**
 * OfferRegulationFields - 공급 상품에 추가할 규정 필드
 *
 * StorageProduct, RouteProduct에 추가할 규정 관련 필드 정의
 */
export interface OfferRegulationFields {
  // 품목 제한
  allowedItemCodes?: string[]   // 허용 품목 코드 목록 (없으면 전체 허용)

  // 규격 제한
  maxWeightKg?: number          // 최대 중량 (default: 20kg)
  maxSumCm?: number             // 최대 3변합 (default: 170cm)

  // 최소 물량
  minCubes?: number             // 최소 큐브 수 (default: 0)

  // 특수 조건 지원 여부
  tempSupported?: boolean       // 냉장/냉동 지원 (default: false, 냉장/냉동 창고는 true)
  hazmatSupported?: boolean     // 위험물 지원 (default: false)

  // 포장 모듈 제한
  allowedModuleClasses?: ModuleClassification[]  // 허용 모듈 (없으면 전체 허용)
}

// ============ 규정 엔진 입력 파라미터 ============

/**
 * 화물 정보 (엔진 입력용)
 *
 * CargoInfo 또는 RegisteredCargo에서 필요한 필드만 추출
 */
export interface CargoForRegulation {
  id: string
  signature: CargoSignature
  fields: {
    sumCm: number
    weightKg: number
  }
  // 특수 조건 플래그
  requiresTemp?: boolean    // 냉장/냉동 필요 (품목 코드 기반)
  isHazmat?: boolean        // 위험물 여부 (품목 코드 기반)
}

/**
 * 수요 정보 (엔진 입력용)
 */
export interface DemandForRegulation {
  totalCubes: number
  totalPallets?: number
}

/**
 * 조건 정보 (엔진 입력용)
 */
export interface ConditionsForRegulation {
  // 보관
  storageLocation?: string
  startDate?: string
  endDate?: string
  // 운송
  origin?: string
  destination?: string
  transportDate?: string
}

/**
 * CheckRegulationParams - 규정 체크 함수 파라미터
 */
export interface CheckRegulationParams {
  cargo: CargoForRegulation
  offer: OfferRegulationFields & { id: string }
  mode: 'STORAGE' | 'ROUTE'
  demand?: DemandForRegulation
  conditions?: ConditionsForRegulation
}

// ============ 검색 결과 집계 ============

/**
 * RegulationSummary - 규정 체크 결과 집계 (이벤트 로깅용)
 */
export interface RegulationSummary {
  totalOffers: number
  passedCount: number
  failedCount: number
  failuresByReason: Partial<Record<RegulationReason, number>>
}

// ============ 기본값 상수 ============

export const REGULATION_DEFAULTS = {
  maxWeightKg: 20,
  maxSumCm: 170,
  minCubes: 0,
  tempSupported: false,
  hazmatSupported: false,
} as const
