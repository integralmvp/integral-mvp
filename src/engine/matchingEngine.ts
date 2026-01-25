// ============================================
// INTEGRAL MVP - 검색·매칭 엔진 (스텁)
// ============================================
// Cube 기반 검색/매칭 함수 시그니처
// Phase 4: 스텁 준비 (실제 구현은 PR4에서)
//
// 설계 원칙:
// - Pallet은 검색/매칭 기준에 사용하지 않음
// - Cube는 내부 계산 및 판단의 유일한 단위
// - 모든 함수는 순수 함수 형태 유지
// - 핵심 제약: offer.remainingCubes >= demandCubes

import type {
  StorageDemand,
  RouteDemand,
  StorageOffer,
  RouteOffer,
  MatchValidation,
  MatchScore,
  MatchResult,
  StorageSearchRequest,
  RouteSearchRequest,
  StorageSearchResponse,
  RouteSearchResponse,
} from './matchingTypes'

// ============ 용량 검증 함수 (핵심 제약) ============

/**
 * 용량 충족 여부 검증 (핵심 제약)
 * offer.remainingCubes >= demandCubes
 *
 * @param offerCubes 공급 잔여 큐브 수
 * @param demandCubes 수요 큐브 수
 * @returns 용량 충족 여부
 */
export function checkCapacity(offerCubes: number, demandCubes: number): boolean {
  return offerCubes >= demandCubes
}

// ============ 필터 함수 (스텁) ============

/**
 * 보관 공급 필터링
 * 수요 조건에 맞는 공급 상품만 필터링
 *
 * @param offers 전체 보관 공급 리스트
 * @param demand 보관 수요
 * @returns 필터링된 보관 공급 리스트
 *
 * TODO (PR4): 구현 예정
 * - storageType 일치 검증
 * - 용량 검증 (remainingCubes >= demandCubes)
 * - 지역 필터 (preferredRegion)
 * - 기간 검증 (availablePeriod)
 */
export function filterStorageOffers(
  offers: StorageOffer[],
  demand: StorageDemand
): StorageOffer[] {
  // TODO: PR4에서 구현
  // 현재는 용량 충족 상품만 반환 (기본 제약)
  return offers.filter((offer) => checkCapacity(offer.remainingCubes, demand.demandCubes))
}

/**
 * 운송 공급 필터링
 * 수요 조건에 맞는 공급 상품만 필터링
 *
 * @param offers 전체 운송 공급 리스트
 * @param demand 운송 수요
 * @returns 필터링된 운송 공급 리스트
 *
 * TODO (PR4): 구현 예정
 * - routeScope 일치 검증
 * - direction 일치 검증 (SEA인 경우)
 * - 용량 검증 (remainingCubes >= demandCubes)
 * - 경로 근접성 검증 (origin/destination)
 * - 일정 검증 (availableDate)
 */
export function filterRouteOffers(
  offers: RouteOffer[],
  demand: RouteDemand
): RouteOffer[] {
  // TODO: PR4에서 구현
  // 현재는 용량 충족 상품만 반환 (기본 제약)
  return offers.filter((offer) => checkCapacity(offer.remainingCubes, demand.demandCubes))
}

// ============ 검증 함수 (스텁) ============

/**
 * 보관 매칭 검증
 * 수요-공급 매칭의 유효성 검증
 *
 * @param offer 보관 공급
 * @param demand 보관 수요
 * @returns 매칭 검증 결과
 *
 * TODO (PR4): 구현 예정
 * - 용량 검증 (핵심 제약)
 * - 타입 검증 (storageType)
 * - 기간 검증 (startDate ~ endDate)
 * - 위치 검증 (region)
 */
export function validateStorageMatch(
  offer: StorageOffer,
  demand: StorageDemand
): MatchValidation {
  // TODO: PR4에서 상세 구현
  const capacityMet = checkCapacity(offer.remainingCubes, demand.demandCubes)

  return {
    isValid: capacityMet, // 현재는 용량만 검증
    capacityMet,
    locationMet: true,    // TODO: 구현
    scheduleMet: true,    // TODO: 구현
    typeMet: true,        // TODO: 구현
    failureReasons: capacityMet ? undefined : ['용량 부족'],
  }
}

/**
 * 운송 매칭 검증
 * 수요-공급 매칭의 유효성 검증
 *
 * @param offer 운송 공급
 * @param demand 운송 수요
 * @returns 매칭 검증 결과
 *
 * TODO (PR4): 구현 예정
 * - 용량 검증 (핵심 제약)
 * - 경로 범위 검증 (routeScope)
 * - 방향 검증 (direction)
 * - 일정 검증 (transportDate)
 * - 경로 근접성 검증
 */
export function validateRouteMatch(
  offer: RouteOffer,
  demand: RouteDemand
): MatchValidation {
  // TODO: PR4에서 상세 구현
  const capacityMet = checkCapacity(offer.remainingCubes, demand.demandCubes)

  return {
    isValid: capacityMet, // 현재는 용량만 검증
    capacityMet,
    locationMet: true,    // TODO: 구현
    scheduleMet: true,    // TODO: 구현
    typeMet: true,        // TODO: 구현
    failureReasons: capacityMet ? undefined : ['용량 부족'],
  }
}

// ============ 점수 계산 함수 (스텁) ============

/**
 * 보관 매칭 점수 계산
 * 추천 정렬을 위한 종합 점수 계산
 *
 * @param offer 보관 공급
 * @param demand 보관 수요
 * @returns 매칭 점수
 *
 * TODO (PR4): 구현 예정
 * - 가격 점수 (pricePerPalletPerDay 기준)
 * - 거리 점수 (location 근접성)
 * - 용량 여유 점수 (remainingCubes - demandCubes)
 * - 일정 적합도 점수
 */
export function scoreStorageMatch(
  _offer: StorageOffer,
  _demand: StorageDemand
): MatchScore {
  // TODO: PR4에서 구현
  return {
    totalScore: 0,
    priceScore: 0,
    distanceScore: 0,
    capacityScore: 0,
    scheduleScore: 0,
  }
}

/**
 * 운송 매칭 점수 계산
 * 추천 정렬을 위한 종합 점수 계산
 *
 * @param offer 운송 공급
 * @param demand 운송 수요
 * @returns 매칭 점수
 *
 * TODO (PR4): 구현 예정
 * - 가격 점수 (pricePerCube 기준)
 * - 경로 일치도 점수 (origin/destination 근접성)
 * - 용량 여유 점수 (remainingCubes - demandCubes)
 * - 일정 적합도 점수
 */
export function scoreRouteMatch(
  _offer: RouteOffer,
  _demand: RouteDemand
): MatchScore {
  // TODO: PR4에서 구현
  return {
    totalScore: 0,
    priceScore: 0,
    distanceScore: 0,
    capacityScore: 0,
    scheduleScore: 0,
  }
}

// ============ 비용 계산 함수 (스텁) ============

/**
 * 보관 비용 추정
 *
 * @param offer 보관 공급
 * @param demand 보관 수요
 * @returns 예상 비용 (원)
 *
 * TODO (PR4): 구현 예정
 * - totalCost = demandPallets × pricePerPalletPerDay × days
 */
export function estimateStorageCost(
  _offer: StorageOffer,
  _demand: StorageDemand
): number {
  // TODO: PR4에서 구현
  return 0
}

/**
 * 운송 비용 추정
 *
 * @param offer 운송 공급
 * @param demand 운송 수요
 * @returns 예상 비용 (원)
 *
 * TODO (PR4): 구현 예정
 * - totalCost = demandCubes × pricePerCube
 */
export function estimateRouteCost(
  _offer: RouteOffer,
  _demand: RouteDemand
): number {
  // TODO: PR4에서 구현
  return 0
}

// ============ 매칭 결과 생성 함수 (스텁) ============

/**
 * 보관 매칭 결과 생성
 *
 * @param offer 보관 공급
 * @param demand 보관 수요
 * @returns 매칭 결과
 *
 * TODO (PR4): 구현 예정
 */
export function createStorageMatchResult(
  offer: StorageOffer,
  demand: StorageDemand
): MatchResult<StorageOffer> {
  const validation = validateStorageMatch(offer, demand)
  const score = scoreStorageMatch(offer, demand)
  const estimatedCost = estimateStorageCost(offer, demand)

  return {
    offer,
    validation,
    score,
    estimatedCost,
  }
}

/**
 * 운송 매칭 결과 생성
 *
 * @param offer 운송 공급
 * @param demand 운송 수요
 * @returns 매칭 결과
 *
 * TODO (PR4): 구현 예정
 */
export function createRouteMatchResult(
  offer: RouteOffer,
  demand: RouteDemand
): MatchResult<RouteOffer> {
  const validation = validateRouteMatch(offer, demand)
  const score = scoreRouteMatch(offer, demand)
  const estimatedCost = estimateRouteCost(offer, demand)

  return {
    offer,
    validation,
    score,
    estimatedCost,
  }
}

// ============ 검색 함수 (스텁) ============

/**
 * 보관 상품 검색
 * 수요에 맞는 보관 공급을 검색하고 정렬하여 반환
 *
 * @param request 검색 요청
 * @param allOffers 전체 보관 공급 리스트 (mockData에서 전달)
 * @returns 검색 응답
 *
 * TODO (PR4): 구현 예정
 * - 필터링 → 검증 → 점수 계산 → 정렬 → 제한
 */
export function searchStorageOffers(
  _request: StorageSearchRequest,
  _allOffers: StorageOffer[]
): StorageSearchResponse {
  // TODO: PR4에서 구현
  return {
    results: [],
    totalCount: 0,
    demandCubes: _request.demand.demandCubes,
  }
}

/**
 * 운송 상품 검색
 * 수요에 맞는 운송 공급을 검색하고 정렬하여 반환
 *
 * @param request 검색 요청
 * @param allOffers 전체 운송 공급 리스트 (mockData에서 전달)
 * @returns 검색 응답
 *
 * TODO (PR4): 구현 예정
 * - 필터링 → 검증 → 점수 계산 → 정렬 → 제한
 */
export function searchRouteOffers(
  _request: RouteSearchRequest,
  _allOffers: RouteOffer[]
): RouteSearchResponse {
  // TODO: PR4에서 구현
  return {
    results: [],
    totalCount: 0,
    demandCubes: _request.demand.demandCubes,
  }
}
