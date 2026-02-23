/**
 * PR6: Matching Pipeline Types
 *
 * 단일 필터링 파이프라인의 입력/출력 타입 정의
 * 규정(PR4) → 자원(PR5) → 조건(PR6) → 정렬(PR6) 순서로 처리
 */

import type { StorageProduct, RouteProduct } from '../../types/models'

// ============ 파이프라인 입력 타입 ============

/**
 * 검색 조건 (UI에서 입력된 조건)
 * PR7-pre: 코드 기반 조건 필드 추가 (우선순위 > 이름 기반)
 */
export interface SearchConditions {
  // Storage 조건 - 코드 기반 (PR7-pre)
  storageLocationCode?: string   // 법정동 코드 (우선)
  storageLocation?: string       // 지역명 (기존 호환성)
  startDate?: string
  endDate?: string

  // Route 조건 - 코드 기반 (PR7-pre)
  originCode?: string            // 출발지 법정동 코드 (우선)
  destinationCode?: string       // 도착지 법정동 코드 (우선)
  origin?: string                // 출발지명 (기존 호환성)
  destination?: string           // 도착지명 (기존 호환성)
  transportDate?: string
}

/**
 * 정렬 기준
 * MVP: LATEST만 구현, 나머지는 스텁
 */
export type SortCriteria = 'LATEST' | 'PRICE_ASC' | 'DISTANCE_ASC'

/**
 * 파이프라인 실행 파라미터
 */
export interface MatchingPipelineParams {
  /** 서비스 모드 */
  mode: 'STORAGE' | 'ROUTE'

  /** 전체 상품 목록 */
  offers: StorageProduct[] | RouteProduct[]

  /** 수요 세션 (화물 정보, 총 큐브 등) */
  session: {
    demandId?: string
    totalCubes: number
    totalPallets?: number
    cargos: Array<{
      id: string
      sumCm?: number
      weightKg?: number
      moduleType?: string
      itemCode?: string
      weightBand?: string
      sizeBand?: string
    }>
  }

  /** 검색 조건 (세션에서 읽거나 UI에서 override) */
  conditions?: SearchConditions

  /** 정렬 기준 (기본: LATEST) */
  sort?: SortCriteria
}

// ============ 파이프라인 출력 타입 ============

/**
 * 파이프라인 단계별 건수
 */
export interface PipelineCounts {
  /** 전체 상품 수 */
  totalOffers: number
  /** 규정 통과 후 */
  afterRegulation: number
  /** 자원 통과 후 */
  afterResource: number
  /** 조건 필터 후 */
  afterConditions: number
}

/**
 * 파이프라인 실행 결과
 */
export interface MatchingPipelineResult<T extends StorageProduct | RouteProduct> {
  /** 최종 매칭된 상품 목록 */
  matchedOffers: T[]

  /** 매칭된 상품 ID 목록 (지도 하이라이트용) */
  matchedOfferIds: string[]

  /** 단계별 건수 */
  counts: PipelineCounts

  /** 실행 메타 정보 */
  meta: {
    mode: 'STORAGE' | 'ROUTE'
    executedAt: string
    sortApplied: SortCriteria
  }
}

// ============ 조건 필터 타입 ============

/**
 * Storage 조건 필터 파라미터
 */
export interface StorageConditionFilterParams {
  offers: StorageProduct[]
  conditions: SearchConditions
}

/**
 * Route 조건 필터 파라미터
 */
export interface RouteConditionFilterParams {
  offers: RouteProduct[]
  conditions: SearchConditions
}

// ============ Preview 관련 타입 ============

/**
 * 프리뷰 결과 (실시간 업데이트용)
 * 검색 버튼 건수, 지도 하이라이트에 사용
 */
export interface PreviewResult {
  /** 매칭된 상품 ID 목록 */
  matchedOfferIds: string[]
  /** 매칭된 건수 */
  matchedCount: number
  /** 단계별 건수 */
  counts: PipelineCounts
  /** Storage 매칭 결과 */
  storageOffers?: StorageProduct[]
  /** Route 매칭 결과 */
  routeOffers?: RouteProduct[]
}

/**
 * 검색 결과 스냅샷 (검색 버튼 클릭 시 확정)
 * 단일 진실 소스: layers/types/matchingTypes.ts
 * → SearchResultContext와 useServiceConsoleState 모두 이 타입을 사용
 */
export interface SearchResult {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  counts: PipelineCounts
  searchedAt: string
}
