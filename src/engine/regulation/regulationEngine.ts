/**
 * Regulation Engine - 핵심 로직
 *
 * PR4: 화물(Cargo) ↔ 공급상품(Offer) 매칭 가능 여부 판단
 *
 * "코드/시그니처 기반 판단" + "필드(수치) 기반 상한/하한"만 사용
 * ID 문자열에 의미 압축 금지
 *
 * MVP 지원 규정 (4대 기준):
 * 1. 규격 제한: sumCm <= offer.maxSumCm
 * 2. 중량 제한: weightKg <= offer.maxWeightKg
 * 3. 품목 제한: cargo.itemCode in offer.allowedItemCodes
 * 4. 최소 물량: demand.totalCubes >= offer.minCubes
 *
 * 선택적 플래그:
 * - hazmat/temp 지원 여부
 * - 포장 모듈 지원 여부
 */

import type {
  RegulationDecision,
  RegulationReason,
  CheckRegulationParams,
  CargoForRegulation,
  OfferRegulationFields,
  CargoSignature,
  OfferSignature,
  RegulationSummary,
  DemandForRegulation,
} from './regulationTypes'
import { REGULATION_DEFAULTS } from './regulationTypes'
import { SPECIAL_HANDLING_CODES, RESTRICTED_CODES } from '../../data/itemCodes'

// ============ 핵심 규정 체크 함수 ============

/**
 * checkRegulation - 단일 화물-상품 매칭 규정 체크
 *
 * @param params - 화물, 상품, 모드, 수요, 조건
 * @returns RegulationDecision
 */
export function checkRegulation(params: CheckRegulationParams): RegulationDecision {
  const { cargo, offer, mode, demand } = params
  const reasons: RegulationReason[] = []
  const matchedKeys: string[] = []

  // 규정 필드 기본값 적용
  const maxWeightKg = offer.maxWeightKg ?? REGULATION_DEFAULTS.maxWeightKg
  const maxSumCm = offer.maxSumCm ?? REGULATION_DEFAULTS.maxSumCm
  const minCubes = offer.minCubes ?? REGULATION_DEFAULTS.minCubes
  const tempSupported = offer.tempSupported ?? REGULATION_DEFAULTS.tempSupported
  const hazmatSupported = offer.hazmatSupported ?? REGULATION_DEFAULTS.hazmatSupported

  // ======= 1. 규격 제한 체크 =======
  if (cargo.fields.sumCm > maxSumCm) {
    reasons.push('SIZE_OVER_LIMIT')
  } else {
    matchedKeys.push('sizeBand')
  }

  // ======= 2. 중량 제한 체크 =======
  if (cargo.fields.weightKg > maxWeightKg) {
    reasons.push('WEIGHT_OVER_LIMIT')
  } else {
    matchedKeys.push('weightBand')
  }

  // ======= 3. 품목 제한 체크 =======
  if (offer.allowedItemCodes && offer.allowedItemCodes.length > 0) {
    if (!offer.allowedItemCodes.includes(cargo.signature.itemCode)) {
      reasons.push('ITEM_NOT_ALLOWED')
    } else {
      matchedKeys.push('itemCode')
    }
  } else {
    // 허용 목록이 없으면 전체 허용 (단, 플랫폼 제한 품목 제외)
    if (!RESTRICTED_CODES.includes(cargo.signature.itemCode)) {
      matchedKeys.push('itemCode')
    } else {
      reasons.push('ITEM_NOT_ALLOWED')
    }
  }

  // ======= 4. 최소 물량 체크 =======
  if (demand && minCubes > 0) {
    if (demand.totalCubes < minCubes) {
      reasons.push('MIN_QTY_NOT_MET')
    }
  }

  // ======= 5. 냉장/냉동 지원 체크 =======
  if (cargo.requiresTemp && !tempSupported) {
    reasons.push('TEMP_REQUIRED_NOT_SUPPORTED')
  }

  // ======= 6. 위험물 지원 체크 =======
  if (cargo.isHazmat && !hazmatSupported) {
    reasons.push('HAZMAT_NOT_SUPPORTED')
  }

  // ======= 7. 포장 모듈 지원 체크 =======
  if (offer.allowedModuleClasses && offer.allowedModuleClasses.length > 0) {
    if (!offer.allowedModuleClasses.includes(cargo.signature.moduleClass)) {
      reasons.push('MODULE_NOT_SUPPORTED')
    } else {
      matchedKeys.push('moduleClass')
    }
  } else {
    // 모듈 제한이 없으면 전체 허용
    matchedKeys.push('moduleClass')
  }

  // 판정 결과 생성
  const pass = reasons.length === 0

  return {
    pass,
    reasons,
    signature: {
      cargo: cargo.signature,
      offer: buildOfferSignature(offer, mode),
      matchedKeys,
    },
  }
}

/**
 * 공급 상품 시그니처 생성
 */
function buildOfferSignature(
  offer: OfferRegulationFields & { id: string },
  mode: 'STORAGE' | 'ROUTE'
): OfferSignature {
  return {
    offerId: offer.id,
    offerType: mode,
    maxWeightKg: offer.maxWeightKg ?? REGULATION_DEFAULTS.maxWeightKg,
    maxSumCm: offer.maxSumCm ?? REGULATION_DEFAULTS.maxSumCm,
    minCubes: offer.minCubes ?? REGULATION_DEFAULTS.minCubes,
    allowedItemCodes: offer.allowedItemCodes,
    allowedModuleClasses: offer.allowedModuleClasses,
    tempSupported: offer.tempSupported ?? REGULATION_DEFAULTS.tempSupported,
    hazmatSupported: offer.hazmatSupported ?? REGULATION_DEFAULTS.hazmatSupported,
  }
}

// ============ 다중 상품 필터링 ============

/**
 * filterOffersByRegulation - 규정 통과 상품만 필터링
 *
 * @param cargos - 화물 목록
 * @param offers - 공급 상품 목록
 * @param mode - 서비스 모드
 * @param demand - 수요 정보 (선택)
 * @returns 통과한 상품 목록과 집계 정보
 */
export function filterOffersByRegulation<T extends OfferRegulationFields & { id: string }>(
  cargos: CargoForRegulation[],
  offers: T[],
  mode: 'STORAGE' | 'ROUTE',
  demand?: DemandForRegulation
): {
  passed: T[]
  failed: T[]
  summary: RegulationSummary
} {
  const passed: T[] = []
  const failed: T[] = []
  const failuresByReason: Partial<Record<RegulationReason, number>> = {}

  for (const offer of offers) {
    // 모든 화물이 해당 상품 규정을 통과해야 함
    let allPass = true
    const allReasons: RegulationReason[] = []

    for (const cargo of cargos) {
      const decision = checkRegulation({
        cargo,
        offer,
        mode,
        demand,
      })

      if (!decision.pass) {
        allPass = false
        allReasons.push(...decision.reasons)
      }
    }

    if (allPass) {
      passed.push(offer)
    } else {
      failed.push(offer)
      // 실패 사유 집계
      for (const reason of allReasons) {
        failuresByReason[reason] = (failuresByReason[reason] || 0) + 1
      }
    }
  }

  return {
    passed,
    failed,
    summary: {
      totalOffers: offers.length,
      passedCount: passed.length,
      failedCount: failed.length,
      failuresByReason,
    },
  }
}

// ============ 어댑터 함수 ============

/**
 * adaptCargoForRegulation - CargoInfo/RegisteredCargo를 규정 엔진 입력으로 변환
 */
export function adaptCargoForRegulation(cargo: {
  id: string
  signature?: CargoSignature
  fields?: { sumCm: number; weightKg: number }
  // CargoUI 필드
  sumCm?: number
  weightKg?: number
  moduleType?: string
  itemCode?: string
  weightBand?: string
  sizeBand?: string
}): CargoForRegulation {
  // CargoInfo 형식인 경우
  if (cargo.signature && cargo.fields) {
    const isHazmat = RESTRICTED_CODES.includes(cargo.signature.itemCode) ||
                     SPECIAL_HANDLING_CODES.includes(cargo.signature.itemCode)
    const requiresTemp = isTempRequiredItem(cargo.signature.itemCode)

    return {
      id: cargo.id,
      signature: cargo.signature,
      fields: {
        sumCm: cargo.fields.sumCm,
        weightKg: cargo.fields.weightKg,
      },
      requiresTemp,
      isHazmat,
    }
  }

  // CargoUI/RegisteredCargo 형식인 경우
  const itemCode = cargo.itemCode || 'IC01'
  const isHazmat = RESTRICTED_CODES.includes(itemCode) ||
                   SPECIAL_HANDLING_CODES.includes(itemCode)
  const requiresTemp = isTempRequiredItem(itemCode)

  return {
    id: cargo.id,
    signature: {
      moduleClass: (cargo.moduleType as CargoSignature['moduleClass']) || 'UNCLASSIFIED',
      itemCode,
      weightBand: (cargo.weightBand as CargoSignature['weightBand']) || 'WBY',
      sizeBand: (cargo.sizeBand as CargoSignature['sizeBand']) || 'SB3',
    },
    fields: {
      sumCm: cargo.sumCm || 100,
      weightKg: cargo.weightKg || 10,
    },
    requiresTemp,
    isHazmat,
  }
}

/**
 * 냉장/냉동이 필요한 품목인지 판단
 * IC10~IC14: 식품류 중 일부
 */
function isTempRequiredItem(itemCode: string): boolean {
  // 신선식품/냉동식품 코드
  const tempRequiredCodes = ['IC10', 'IC12'] // 신선식품, 냉동식품
  return tempRequiredCodes.includes(itemCode)
}

// ============ 규정 이유 메시지 ============

/**
 * getRegulationReasonMessage - 규정 불통과 사유 한글 메시지
 */
export function getRegulationReasonMessage(reason: RegulationReason): string {
  switch (reason) {
    case 'ITEM_NOT_ALLOWED':
      return '해당 상품에서 취급 불가 품목'
    case 'WEIGHT_OVER_LIMIT':
      return '중량 초과'
    case 'SIZE_OVER_LIMIT':
      return '규격 초과'
    case 'MIN_QTY_NOT_MET':
      return '최소 물량 미달'
    case 'TEMP_REQUIRED_NOT_SUPPORTED':
      return '냉장/냉동 미지원'
    case 'HAZMAT_NOT_SUPPORTED':
      return '위험물 미지원'
    case 'MODULE_NOT_SUPPORTED':
      return '포장 규격 미지원'
    case 'LOCATION_NOT_SUPPORTED':
      return '지역/경로 불일치'
    case 'DATE_NOT_SUPPORTED':
      return '일정 불일치'
    default:
      return reason
  }
}

/**
 * 규정 체크 결과 요약 메시지
 */
export function getRegulationSummaryMessage(summary: RegulationSummary): string {
  const { totalOffers, passedCount, failedCount } = summary
  return `전체 ${totalOffers}건 중 ${passedCount}건 통과, ${failedCount}건 탈락`
}
