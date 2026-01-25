// ============================================
// INTEGRAL MVP - 검색·매칭 타입 정의
// ============================================
// Cube 기반 검색/매칭을 위한 타입 정의
// Phase 4: 타입 및 스텁 준비 (실제 구현은 PR4에서)

import type { ModuleName } from './cubeConfig'

// ============ 수요(Demand) 타입 ============

/**
 * 보관 수요 (Storage Demand)
 * - 거래 단위: Pallet
 * - 내부 계산: Cube
 */
export interface StorageDemand {
  /** 수요 ID (클라이언트 생성) */
  demandId?: string

  /** 필요 큐브 수 (내부 계산 기준) */
  demandCubes: number

  /** 필요 파렛트 수 (거래 기준, ceil(demandCubes / 128)) */
  demandPallets: number

  /** 희망 보관 타입 */
  storageType: '상온' | '냉장' | '냉동'

  /** 희망 지역 (옵션) */
  preferredRegion?: string

  /** 보관 시작일 (ISO 8601) */
  startDate: string

  /** 보관 종료일 (ISO 8601) */
  endDate: string

  /** 품목 카테고리 (옵션) */
  cargoCategory?: string

  /** UNCLASSIFIED 박스 포함 여부 */
  hasUnclassified?: boolean

  /** 형상 분류 결과 요약 (설명용) */
  moduleSummary?: Array<{
    module: ModuleName | 'UNCLASSIFIED'
    boxCount: number
  }>
}

/**
 * 운송 수요 (Route Demand)
 * - 거래 단위: Cube
 * - 내부 계산: Cube
 */
export interface RouteDemand {
  /** 수요 ID (클라이언트 생성) */
  demandId?: string

  /** 필요 큐브 수 (거래 및 계산 기준) */
  demandCubes: number

  /** 출발지 좌표 */
  origin: {
    name: string
    lat: number
    lng: number
  }

  /** 도착지 좌표 */
  destination: {
    name: string
    lat: number
    lng: number
  }

  /** 운송 범위 */
  routeScope: 'INTRA_JEJU' | 'SEA'

  /** 운송 방향 (SEA인 경우) */
  direction?: 'INBOUND' | 'OUTBOUND'

  /** 희망 운송일 (ISO 8601) */
  transportDate: string

  /** 품목 카테고리 (옵션) */
  cargoCategory?: string

  /** UNCLASSIFIED 박스 포함 여부 */
  hasUnclassified?: boolean
}

// ============ 공급(Offer) 타입 ============

/**
 * 보관 공급 (Storage Offer)
 * - 거래 단위: Pallet
 * - 내부 계산: Cube
 */
export interface StorageOffer {
  /** 상품 ID (mockData 참조) */
  offerId: string

  /** 잔여 큐브 수 (매칭 기준) */
  remainingCubes: number

  /** 잔여 파렛트 수 (거래 표시용) */
  remainingPallets: number

  /** 보관 타입 */
  storageType: '상온' | '냉장' | '냉동'

  /** 위치 정보 */
  location: {
    name: string
    lat: number
    lng: number
    region: string
  }

  /** 단가 (원/파렛트/일) */
  pricePerPalletPerDay: number

  /** 가용 기간 (옵션) */
  availablePeriod?: {
    startDate: string
    endDate: string
  }

  /** 특수 기능/시설 */
  features?: string[]
}

/**
 * 운송 공급 (Route Offer)
 * - 거래 단위: Cube
 * - 내부 계산: Cube
 */
export interface RouteOffer {
  /** 상품 ID (mockData 참조) */
  offerId: string

  /** 잔여 큐브 수 (매칭 기준) */
  remainingCubes: number

  /** 출발지 */
  origin: {
    name: string
    lat: number
    lng: number
  }

  /** 도착지 */
  destination: {
    name: string
    lat: number
    lng: number
  }

  /** 운송 범위 */
  routeScope: 'INTRA_JEJU' | 'SEA'

  /** 운송 방향 (SEA인 경우) */
  direction?: 'INBOUND' | 'OUTBOUND'

  /** 차량 유형 */
  vehicleType: string

  /** 단가 (원/Cube) */
  pricePerCube: number

  /** 운송 가능일 (ISO 8601) */
  availableDate?: string

  /** 취급 가능 화물 유형 */
  cargoTypes?: string[]
}

// ============ 매칭 결과 타입 ============

/**
 * 매칭 검증 결과
 */
export interface MatchValidation {
  /** 매칭 가능 여부 */
  isValid: boolean

  /** 용량 충족 여부 (핵심 제약: offer.remainingCubes >= demandCubes) */
  capacityMet: boolean

  /** 위치/경로 조건 충족 여부 */
  locationMet: boolean

  /** 기간/일정 조건 충족 여부 */
  scheduleMet: boolean

  /** 타입 조건 충족 여부 (보관타입, 운송범위 등) */
  typeMet: boolean

  /** 검증 실패 사유 (isValid=false인 경우) */
  failureReasons?: string[]
}

/**
 * 매칭 점수 (추천 정렬용)
 */
export interface MatchScore {
  /** 종합 점수 (0~100) */
  totalScore: number

  /** 가격 점수 (낮을수록 높은 점수) */
  priceScore: number

  /** 거리 점수 (가까울수록 높은 점수) */
  distanceScore: number

  /** 용량 여유 점수 (여유 있을수록 높은 점수) */
  capacityScore: number

  /** 일정 적합도 점수 */
  scheduleScore: number
}

/**
 * 매칭된 상품 결과
 */
export interface MatchResult<T extends StorageOffer | RouteOffer> {
  /** 매칭된 공급 상품 */
  offer: T

  /** 검증 결과 */
  validation: MatchValidation

  /** 매칭 점수 (추천 정렬용) */
  score: MatchScore

  /** 예상 비용 (원) */
  estimatedCost?: number

  /** 예상 비용 상세 */
  costBreakdown?: {
    basePrice: number
    quantity: number
    days?: number
    totalPrice: number
  }
}

// ============ 검색 요청/응답 타입 ============

/**
 * 보관 검색 요청
 */
export interface StorageSearchRequest {
  demand: StorageDemand
  /** 정렬 기준 */
  sortBy?: 'price' | 'distance' | 'capacity' | 'score'
  /** 최대 결과 수 */
  limit?: number
}

/**
 * 운송 검색 요청
 */
export interface RouteSearchRequest {
  demand: RouteDemand
  /** 정렬 기준 */
  sortBy?: 'price' | 'distance' | 'capacity' | 'score'
  /** 최대 결과 수 */
  limit?: number
}

/**
 * 검색 응답 (공통)
 */
export interface SearchResponse<T extends StorageOffer | RouteOffer> {
  /** 매칭된 결과 리스트 */
  results: MatchResult<T>[]

  /** 총 매칭 수 */
  totalCount: number

  /** 검색에 사용된 수요 큐브 수 */
  demandCubes: number

  /** 검색 메타 정보 */
  meta?: {
    searchTime: number
    filterApplied: string[]
  }
}

// ============ 타입 별칭 (편의용) ============

export type StorageSearchResponse = SearchResponse<StorageOffer>
export type RouteSearchResponse = SearchResponse<RouteOffer>
export type StorageMatchResult = MatchResult<StorageOffer>
export type RouteMatchResult = MatchResult<RouteOffer>
