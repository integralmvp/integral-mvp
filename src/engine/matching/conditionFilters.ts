/**
 * PR6: 조건 필터 (Condition Filters)
 *
 * 규정/자원 통과 후 UI 조건(지역/날짜)에 따라 필터링
 * MVP: 지역명 포함 체크, 날짜는 조건 존재 확인만
 */

import type { StorageProduct, RouteProduct } from '../../types/models'
import type { SearchConditions } from './matchingPipelineTypes'

/**
 * Storage 조건 필터
 *
 * @param offers - 규정/자원 통과한 Storage 상품
 * @param conditions - 검색 조건
 * @returns 조건에 맞는 상품 목록
 */
export function filterStorageByConditions(
  offers: StorageProduct[],
  conditions: SearchConditions
): StorageProduct[] {
  const { storageLocation } = conditions

  // 조건이 없으면 전체 반환
  if (!storageLocation) {
    return offers
  }

  return offers.filter(offer => {
    // 지역명 매칭: location.name 또는 location.region에 포함되면 통과
    const locationMatch = matchLocation(
      storageLocation,
      offer.location.name,
      offer.location.region
    )

    return locationMatch
  })
}

/**
 * Route 조건 필터
 *
 * @param offers - 규정/자원 통과한 Route 상품
 * @param conditions - 검색 조건
 * @returns 조건에 맞는 상품 목록
 */
export function filterRouteByConditions(
  offers: RouteProduct[],
  conditions: SearchConditions
): RouteProduct[] {
  const { origin, destination } = conditions

  // 조건이 없으면 전체 반환
  if (!origin && !destination) {
    return offers
  }

  return offers.filter(offer => {
    // 출발지 매칭
    const originMatch = !origin || matchLocation(origin, offer.origin.name)

    // 도착지 매칭
    const destinationMatch = !destination || matchLocation(destination, offer.destination.name)

    return originMatch && destinationMatch
  })
}

/**
 * 지역명 매칭 함수
 *
 * MVP 단순 매칭: 입력값이 상품 지역에 포함되거나, 상품 지역이 입력값에 포함되면 통과
 * "제주" 입력 시 "제주시", "제주항" 등 모두 매칭
 * "서귀포" 입력 시 "서귀포", "서귀포시" 등 모두 매칭
 *
 * @param condition - 검색 조건 지역명
 * @param locationNames - 상품의 지역명들 (name, region 등)
 */
function matchLocation(condition: string, ...locationNames: (string | undefined)[]): boolean {
  const normalizedCondition = normalizeLocationName(condition)

  for (const name of locationNames) {
    if (!name) continue

    const normalizedName = normalizeLocationName(name)

    // 양방향 포함 체크
    if (
      normalizedName.includes(normalizedCondition) ||
      normalizedCondition.includes(normalizedName)
    ) {
      return true
    }
  }

  return false
}

/**
 * 지역명 정규화 (공백/특수문자 제거, 소문자화)
 */
function normalizeLocationName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()]/g, '')
}

/**
 * 날짜 조건 체크 (MVP: 스텁 구현)
 *
 * MVP에서는 offer에 availableFrom/To 필드가 없으므로
 * 조건이 입력되었는지만 확인하고 실제 필터링은 하지 않음
 *
 * @param conditions - 검색 조건
 * @returns 날짜 조건 입력 완료 여부
 */
export function hasDateConditions(conditions: SearchConditions): {
  hasStorageDate: boolean
  hasTransportDate: boolean
} {
  return {
    hasStorageDate: !!(conditions.startDate && conditions.endDate),
    hasTransportDate: !!conditions.transportDate,
  }
}
