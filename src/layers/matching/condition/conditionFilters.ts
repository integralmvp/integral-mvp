/**
 * PR6: 조건 필터 (Condition Filters)
 * PR7-pre: 법정동 코드 기반 범위 필터링으로 업그레이드
 *
 * 규정/자원 통과 후 UI 조건(지역/날짜)에 따라 필터링
 * - 지역: 법정동 코드 기반 범위 필터링 (상위 선택 시 하위 포함)
 * - 날짜: MVP에서는 조건 존재 확인만
 */

import type { StorageProduct, RouteProduct } from '../../../types/models'
import type { SearchConditions } from '../../types/matchingTypes'

// ============ 법정동 코드 계층 판단 로직 (PR7-pre) ============

/**
 * 법정동 코드에서 유효 prefix 추출
 *
 * 법정동 코드 구조 (10자리):
 * - [시도 2자리][시군구 3자리][읍면동 3자리][리 2자리]
 * - 예: 50|110|250|00 (제주도 제주시 한림읍)
 *
 * 유효 자릿수:
 * - 시도 레벨 (XX00000000): 앞 2자리 (예: '5000000000' = 제주특별자치도)
 * - 시군구 레벨 (XXXXX00000): 앞 5자리
 * - 읍면동 레벨 (XXXXXXXX00): 앞 8자리
 * - 리 레벨 (XXXXXXXXXX): 전체 10자리
 */
function getEffectivePrefix(code: string): string {
  // 리 자리(뒤 2자리)가 00이 아니면 리 레벨
  if (!code.endsWith('00')) {
    return code
  }

  // 시도 레벨 (XX + 8개의 0): 앞 2자리 (예: '5000000000' = 제주특별자치도)
  if (code.slice(2) === '00000000') {
    return code.slice(0, 2)
  }

  // 읍면동 자리(6~8자리)가 000이면 시군구 레벨
  if (code.slice(5, 8) === '000') {
    return code.slice(0, 5)
  }

  // 읍면동 레벨: 앞 8자리 유효
  return code.slice(0, 8)
}

/**
 * childCode가 parentCode의 하위 지역인지 판단
 *
 * 예:
 * - isDescendantRegion('5011025021', '5011025000') → true (귀덕리는 한림읍의 하위)
 * - isDescendantRegion('5011025000', '5011000000') → true (한림읍은 제주시의 하위)
 * - isDescendantRegion('5011025300', '5011025000') → false (애월읍은 한림읍의 하위 아님)
 * - isDescendantRegion('5013000000', '5011000000') → false (서귀포시는 제주시의 하위 아님)
 */
function isDescendantRegion(childCode: string, parentCode: string): boolean {
  const parentPrefix = getEffectivePrefix(parentCode)
  const childPrefix = getEffectivePrefix(childCode)

  // 부모 prefix가 자식 prefix의 진정한 prefix여야 함
  // 단, 같은 코드이거나 부모 prefix보다 짧으면 하위 아님
  return (
    childCode.startsWith(parentPrefix) &&
    childCode !== parentCode &&
    childPrefix.length > parentPrefix.length
  )
}

/**
 * 지역 코드 매칭 (동일하거나 하위 지역이면 통과)
 *
 * @param offerRegionCode - 상품의 지역 코드
 * @param selectedRegionCode - 사용자가 선택한 지역 코드
 * @returns 매칭 여부
 */
function matchRegionCode(offerRegionCode: string, selectedRegionCode: string): boolean {
  // 상품 코드가 없으면 매칭 실패 (빈 문자열 = 제주 외 지역)
  if (!offerRegionCode) {
    return false
  }

  // 동일한 코드이거나 하위 지역이면 통과
  return offerRegionCode === selectedRegionCode ||
         isDescendantRegion(offerRegionCode, selectedRegionCode)
}

// ============ Storage 조건 필터 ============

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
  const { storageLocationCode, storageLocation } = conditions

  // 조건이 없으면 전체 반환
  if (!storageLocationCode && !storageLocation) {
    return offers
  }

  return offers.filter(offer => {
    // 우선순위 1: 코드 기반 필터링 (PR7-pre)
    if (storageLocationCode) {
      return matchRegionCode(offer.location.regionCode, storageLocationCode)
    }

    // 우선순위 2: 이름 기반 필터링 (기존 호환성 유지)
    if (storageLocation) {
      return matchLocationName(
        storageLocation,
        offer.location.name,
        offer.location.region
      )
    }

    // 이 코드는 도달하지 않아야 함 (위 조건 체크에서 이미 걸러짐)
    return false
  })
}

// ============ Route 조건 필터 ============

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
  const { originCode, destinationCode, origin, destination } = conditions

  // 조건이 없으면 전체 반환
  if (!originCode && !destinationCode && !origin && !destination) {
    return offers
  }

  return offers.filter(offer => {
    // 출발지 매칭
    let originMatch = true
    if (originCode) {
      // 코드 기반 필터링 (PR7-pre)
      // 빈 문자열(육지)인 경우 항상 매칭 실패 - 제주 지역만 필터링 가능
      originMatch = offer.originCode ? matchRegionCode(offer.originCode, originCode) : false
    } else if (origin) {
      // 이름 기반 필터링 (기존 호환성)
      originMatch = matchLocationName(origin, offer.origin.name)
    }

    // 도착지 매칭
    let destinationMatch = true
    if (destinationCode) {
      // 코드 기반 필터링 (PR7-pre)
      destinationMatch = offer.destinationCode ? matchRegionCode(offer.destinationCode, destinationCode) : false
    } else if (destination) {
      // 이름 기반 필터링 (기존 호환성)
      destinationMatch = matchLocationName(destination, offer.destination.name)
    }

    return originMatch && destinationMatch
  })
}

// ============ 기존 이름 기반 매칭 (호환성 유지) ============

/**
 * 지역명 매칭 함수 (기존 호환성 유지)
 *
 * MVP 단순 매칭: 입력값이 상품 지역에 포함되거나, 상품 지역이 입력값에 포함되면 통과
 * "제주" 입력 시 "제주시", "제주항" 등 모두 매칭
 * "서귀포" 입력 시 "서귀포", "서귀포시" 등 모두 매칭
 *
 * @param condition - 검색 조건 지역명
 * @param locationNames - 상품의 지역명들 (name, region 등)
 */
function matchLocationName(condition: string, ...locationNames: (string | undefined)[]): boolean {
  const normalizedCondition = normalizeLocationText(condition)

  for (const name of locationNames) {
    if (!name) continue

    const normalizedName = normalizeLocationText(name)

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
function normalizeLocationText(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()]/g, '')
}

// ============ 날짜 조건 체크 (MVP: 스텁) ============

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
