/**
 * Rule Check - 플랫폼 기본 규정 체크
 *
 * "선 규정 후 거래"의 최소 게이트를 제공
 * 실패 이유를 데이터로 기록
 *
 * MVP 체크 항목:
 * - 규격 상한(기본): sumCm <= 170
 * - 중량 상한(기본): weightKg <= 20
 * - 위험물(IC34) / 특수(IC41 등): SPECIAL_HANDLING 또는 NOT_ALLOWED
 * - UNCLASSIFIED moduleClass: UNCLASSIFIED_FALLBACK 기록
 */

import type { CargoInfo, ModuleClassification, EventSubject } from '../../types/models'
import { SPECIAL_HANDLING_CODES, RESTRICTED_CODES } from '../../data/itemCodes'
import { logRuleChecked } from '../../store/eventLog'

/**
 * 규정 체크 결과
 */
export interface RuleCheckResult {
  passed: boolean
  reasons: string[]
}

/**
 * 규정 체크 이유 코드
 */
export type RuleReason =
  | 'SIZE_EXCEEDED'           // 규격 상한 초과
  | 'WEIGHT_EXCEEDED'         // 중량 상한 초과
  | 'SPECIAL_HANDLING'        // 특수 처리 필요
  | 'NOT_ALLOWED'             // 플랫폼 취급 불가
  | 'UNCLASSIFIED_FALLBACK'   // 분류 불가 (fallback)
  | 'PASSED'                  // 통과

/**
 * 플랫폼 기본 제한 설정
 */
const PLATFORM_LIMITS = {
  // 규격 상한: 3변합 170cm (기본 택배 규격)
  MAX_SUM_CM: 170,

  // 중량 상한: 20kg (기본 택배 중량)
  MAX_WEIGHT_KG: 20,
} as const

/**
 * 화물 정보 기반 규정 체크
 */
export function checkCargoRules(cargo: CargoInfo): RuleCheckResult {
  const reasons: string[] = []

  // 1. 규격 상한 체크
  if (cargo.fields.sumCm > PLATFORM_LIMITS.MAX_SUM_CM) {
    reasons.push('SIZE_EXCEEDED')
  }

  // 2. 중량 상한 체크
  if (cargo.fields.weightKg > PLATFORM_LIMITS.MAX_WEIGHT_KG) {
    reasons.push('WEIGHT_EXCEEDED')
  }

  // 3. 위험물/제한 품목 체크
  const itemCode = cargo.signature.itemCode
  if (RESTRICTED_CODES.includes(itemCode)) {
    reasons.push('NOT_ALLOWED')
  } else if (SPECIAL_HANDLING_CODES.includes(itemCode)) {
    reasons.push('SPECIAL_HANDLING')
  }

  // 4. UNCLASSIFIED 체크 (fallback 허용, 기록만)
  if (cargo.signature.moduleClass === 'UNCLASSIFIED') {
    reasons.push('UNCLASSIFIED_FALLBACK')
  }

  // 통과 여부 결정
  // NOT_ALLOWED만 실패, 나머지는 경고 수준
  const passed = !reasons.includes('NOT_ALLOWED')

  return { passed, reasons: reasons.length > 0 ? reasons : ['PASSED'] }
}

/**
 * 화물 정보 기반 규정 체크 (이벤트 로깅 포함)
 */
export function checkCargoRulesWithLogging(cargo: CargoInfo): RuleCheckResult {
  const result = checkCargoRules(cargo)

  // 이벤트 로깅
  logRuleChecked(
    { kind: 'cargo', id: cargo.id },
    result.passed,
    result.reasons
  )

  return result
}

/**
 * 간이 규정 체크 (CargoInfo 없이)
 */
export function checkQuickRules(params: {
  sumCm: number
  weightKg: number
  itemCode: string
  moduleClass: ModuleClassification
}): RuleCheckResult {
  const reasons: string[] = []

  // 1. 규격 상한 체크
  if (params.sumCm > PLATFORM_LIMITS.MAX_SUM_CM) {
    reasons.push('SIZE_EXCEEDED')
  }

  // 2. 중량 상한 체크
  if (params.weightKg > PLATFORM_LIMITS.MAX_WEIGHT_KG) {
    reasons.push('WEIGHT_EXCEEDED')
  }

  // 3. 위험물/제한 품목 체크
  if (RESTRICTED_CODES.includes(params.itemCode)) {
    reasons.push('NOT_ALLOWED')
  } else if (SPECIAL_HANDLING_CODES.includes(params.itemCode)) {
    reasons.push('SPECIAL_HANDLING')
  }

  // 4. UNCLASSIFIED 체크
  if (params.moduleClass === 'UNCLASSIFIED') {
    reasons.push('UNCLASSIFIED_FALLBACK')
  }

  const passed = !reasons.includes('NOT_ALLOWED')

  return { passed, reasons: reasons.length > 0 ? reasons : ['PASSED'] }
}

/**
 * 간이 규정 체크 (이벤트 로깅 포함)
 */
export function checkQuickRulesWithLogging(
  params: {
    sumCm: number
    weightKg: number
    itemCode: string
    moduleClass: ModuleClassification
  },
  subject: EventSubject
): RuleCheckResult {
  const result = checkQuickRules(params)

  logRuleChecked(subject, result.passed, result.reasons)

  return result
}

/**
 * 규정 이유 코드 → 한글 메시지
 */
export function getRuleReasonMessage(reason: string): string {
  switch (reason) {
    case 'SIZE_EXCEEDED':
      return `규격 초과 (3변합 ${PLATFORM_LIMITS.MAX_SUM_CM}cm 초과)`
    case 'WEIGHT_EXCEEDED':
      return `중량 초과 (${PLATFORM_LIMITS.MAX_WEIGHT_KG}kg 초과)`
    case 'SPECIAL_HANDLING':
      return '특수 처리 필요 (별도 문의)'
    case 'NOT_ALLOWED':
      return '플랫폼 취급 불가 품목'
    case 'UNCLASSIFIED_FALLBACK':
      return '규격 분류 불가 (대형 처리)'
    case 'PASSED':
      return '규정 통과'
    default:
      return reason
  }
}

/**
 * 규정 체크 결과 메시지 목록
 */
export function getRuleResultMessages(result: RuleCheckResult): string[] {
  return result.reasons.map(getRuleReasonMessage)
}

/**
 * 규정 체크 결과에 경고가 있는지 확인
 */
export function hasWarnings(result: RuleCheckResult): boolean {
  const warningReasons: string[] = [
    'SIZE_EXCEEDED',
    'WEIGHT_EXCEEDED',
    'SPECIAL_HANDLING',
    'UNCLASSIFIED_FALLBACK',
  ]

  return result.reasons.some(r => warningReasons.includes(r))
}

/**
 * 플랫폼 제한 값 조회
 */
export function getPlatformLimits() {
  return { ...PLATFORM_LIMITS }
}
