/**
 * PR5: 자원 체크 엔진
 *
 * 규정 통과 상품에 대해 자원(용량) 체크를 수행
 * offer.remainingCubes >= demand.totalCubes → 통과
 */

import type {
  ResourceCheckResult,
  ResourceCheckParams,
  ResourceFilterResult,
} from './resourceTypes'
import type { StorageProduct, RouteProduct } from '../../types/models'

/**
 * 단일 자원 체크
 *
 * @param params.offerRemainingCubes - Offer의 남은 수용 가능 큐브
 * @param params.demandCubes - 수요 큐브 (totalCubes)
 * @returns 통과 여부 및 실패 사유
 */
export function checkResource(params: ResourceCheckParams): ResourceCheckResult {
  const { offerRemainingCubes, demandCubes } = params

  // 핵심 판단: 남은 용량 >= 수요량
  if (offerRemainingCubes >= demandCubes) {
    return { pass: true }
  }

  return {
    pass: false,
    reason: 'INSUFFICIENT_CAPACITY',
  }
}

/**
 * Storage 상품 자원 필터링
 *
 * 규정 통과 Storage 상품 → 자원 체크 → 자원 통과 상품
 */
export function filterStorageByResource(
  regulationPassedOffers: StorageProduct[],
  demandCubes: number
): ResourceFilterResult<StorageProduct> {
  const passed: StorageProduct[] = []
  const failed: StorageProduct[] = []

  for (const offer of regulationPassedOffers) {
    const result = checkResource({
      offerRemainingCubes: offer.remainingCubes,
      demandCubes,
    })

    if (result.pass) {
      passed.push(offer)
    } else {
      failed.push(offer)
    }
  }

  return {
    passed,
    failed,
    summary: {
      passedCount: passed.length,
      failedCount: failed.length,
    },
  }
}

/**
 * Route 상품 자원 필터링
 *
 * 규정 통과 Route 상품 → 자원 체크 → 자원 통과 상품
 */
export function filterRouteByResource(
  regulationPassedOffers: RouteProduct[],
  demandCubes: number
): ResourceFilterResult<RouteProduct> {
  const passed: RouteProduct[] = []
  const failed: RouteProduct[] = []

  for (const offer of regulationPassedOffers) {
    const result = checkResource({
      offerRemainingCubes: offer.remainingCubes,
      demandCubes,
    })

    if (result.pass) {
      passed.push(offer)
    } else {
      failed.push(offer)
    }
  }

  return {
    passed,
    failed,
    summary: {
      passedCount: passed.length,
      failedCount: failed.length,
    },
  }
}

/**
 * 통합 자원 필터링
 *
 * mode에 따라 적절한 필터링 수행
 */
export function filterOffersByResource<T extends StorageProduct | RouteProduct>(
  regulationPassedOffers: T[],
  demandCubes: number
): ResourceFilterResult<T> {
  const passed: T[] = []
  const failed: T[] = []

  for (const offer of regulationPassedOffers) {
    const result = checkResource({
      offerRemainingCubes: offer.remainingCubes,
      demandCubes,
    })

    if (result.pass) {
      passed.push(offer)
    } else {
      failed.push(offer)
    }
  }

  return {
    passed,
    failed,
    summary: {
      passedCount: passed.length,
      failedCount: failed.length,
    },
  }
}
