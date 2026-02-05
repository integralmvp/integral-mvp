/**
 * PR5: 자원 체크 타입 정의
 *
 * Offer의 수용 가능 용량(remainingCubes)과 수요(demandCubes) 비교
 */

/**
 * 자원 체크 결과
 */
export interface ResourceCheckResult {
  pass: boolean
  reason?: 'INSUFFICIENT_CAPACITY' | 'INSUFFICIENT_PAYLOAD'
}

/**
 * 자원 체크 파라미터
 */
export interface ResourceCheckParams {
  offerRemainingCubes: number
  demandCubes: number
}

/**
 * PR7: 중량 재고 포함 자원 체크 파라미터
 */
export interface ResourceCheckWithPayloadParams {
  offerRemainingCubes: number
  demandCubes: number
  offerRemainingPayloadKg?: number  // 남은 하중 (선택)
  demandWeightKg?: number           // 수요 중량 (선택)
}

/**
 * 단일 Offer 자원 체크 결과
 */
export interface OfferResourceCheckResult {
  offerId: string
  pass: boolean
  reason?: 'INSUFFICIENT_CAPACITY'
}

/**
 * 자원 필터링 결과
 */
export interface ResourceFilterResult<T> {
  passed: T[]
  failed: T[]
  summary: {
    passedCount: number
    failedCount: number
  }
}
