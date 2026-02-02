/**
 * PR6: 단일 매칭 파이프라인 (Matching Pipeline)
 *
 * 검색 결과의 "단일 진실 소스(Single Source of Truth)"
 * 규정(PR4) → 자원(PR5) → 조건(PR6) → 정렬(PR6) 순서로 처리
 *
 * 사용처:
 * - 검색 버튼 건수 (previewMatch)
 * - 지도 하이라이트 (highlightedIds)
 * - 검색 결과 리스트 (searchResults)
 */

import type { StorageProduct, RouteProduct } from '../../types/models'
import type {
  MatchingPipelineParams,
  MatchingPipelineResult,
  SortCriteria,
  SearchConditions,
} from './matchingPipelineTypes'
import {
  filterOffersByRegulation,
  adaptCargoForRegulation,
} from '../regulation'
import { filterStorageByResource, filterRouteByResource } from '../resource'
import { filterStorageByConditions, filterRouteByConditions } from './conditionFilters'

/**
 * Storage용 매칭 파이프라인 실행
 */
export function runMatchingPipeline(
  params: MatchingPipelineParams & { mode: 'STORAGE'; offers: StorageProduct[] }
): MatchingPipelineResult<StorageProduct>

/**
 * Route용 매칭 파이프라인 실행
 */
export function runMatchingPipeline(
  params: MatchingPipelineParams & { mode: 'ROUTE'; offers: RouteProduct[] }
): MatchingPipelineResult<RouteProduct>

/**
 * 단일 매칭 파이프라인 실행 (구현)
 *
 * 파이프라인 순서:
 * 1. 규정 체크 (PR4): 크기/중량/품목/최소물량 필터링
 * 2. 자원 체크 (PR5): 용량(remainingCubes) 필터링
 * 3. 조건 필터 (PR6): 지역/날짜 필터링
 * 4. 정렬 (PR6): MVP는 LATEST만 구현
 */
export function runMatchingPipeline(
  params: MatchingPipelineParams
): MatchingPipelineResult<StorageProduct> | MatchingPipelineResult<RouteProduct> {
  const { mode, offers, session, conditions = {}, sort = 'LATEST' } = params

  // 초기 건수
  const totalOffers = offers.length

  // 화물이 없으면 전체 반환 (규정 체크 스킵)
  if (session.cargos.length === 0) {
    if (mode === 'STORAGE') {
      const storageOffers = offers as StorageProduct[]
      const sorted = applySorting(storageOffers, sort)
      return {
        matchedOffers: sorted,
        matchedOfferIds: sorted.map(o => o.id),
        counts: {
          totalOffers,
          afterRegulation: totalOffers,
          afterResource: totalOffers,
          afterConditions: totalOffers,
        },
        meta: {
          mode,
          executedAt: new Date().toISOString(),
          sortApplied: sort,
        },
      }
    } else {
      const routeOffers = offers as RouteProduct[]
      const sorted = applySorting(routeOffers, sort)
      return {
        matchedOffers: sorted,
        matchedOfferIds: sorted.map(o => o.id),
        counts: {
          totalOffers,
          afterRegulation: totalOffers,
          afterResource: totalOffers,
          afterConditions: totalOffers,
        },
        meta: {
          mode,
          executedAt: new Date().toISOString(),
          sortApplied: sort,
        },
      }
    }
  }

  // Step 1: 규정 체크 (PR4)
  const cargosForRegulation = session.cargos.map(cargo =>
    adaptCargoForRegulation({
      id: cargo.id,
      sumCm: cargo.sumCm,
      weightKg: cargo.weightKg,
      moduleType: cargo.moduleType,
      itemCode: cargo.itemCode,
      weightBand: cargo.weightBand,
      sizeBand: cargo.sizeBand,
    })
  )

  const demand = {
    totalCubes: session.totalCubes,
    totalPallets: session.totalPallets,
  }

  // PR6: totalCubes가 미입력(0 또는 undefined)이면 자원 체크 스킵
  const shouldSkipResourceCheck = !session.totalCubes || session.totalCubes === 0

  // mode에 따라 분기 처리
  if (mode === 'STORAGE') {
    const storageOffers = offers as StorageProduct[]

    // 규정 체크
    const regulationResult = filterOffersByRegulation(
      cargosForRegulation,
      storageOffers,
      'STORAGE',
      demand
    )
    const afterRegulation = regulationResult.passed.length

    // 자원 체크 (물량 미입력 시 스킵)
    let resourcePassed: StorageProduct[]
    let afterResource: number
    if (shouldSkipResourceCheck) {
      resourcePassed = regulationResult.passed
      afterResource = afterRegulation
    } else {
      const resourceResult = filterStorageByResource(
        regulationResult.passed,
        session.totalCubes
      )
      resourcePassed = resourceResult.passed
      afterResource = resourceResult.passed.length
    }

    // 조건 필터
    const conditionFiltered = filterStorageByConditions(
      resourcePassed,
      conditions
    )
    const afterConditions = conditionFiltered.length

    // 정렬
    const sortedOffers = applySorting(conditionFiltered, sort)

    return {
      matchedOffers: sortedOffers,
      matchedOfferIds: sortedOffers.map(o => o.id),
      counts: {
        totalOffers,
        afterRegulation,
        afterResource,
        afterConditions,
      },
      meta: {
        mode,
        executedAt: new Date().toISOString(),
        sortApplied: sort,
      },
    }
  } else {
    const routeOffers = offers as RouteProduct[]

    // 규정 체크
    const regulationResult = filterOffersByRegulation(
      cargosForRegulation,
      routeOffers,
      'ROUTE',
      demand
    )
    const afterRegulation = regulationResult.passed.length

    // 자원 체크 (물량 미입력 시 스킵)
    let resourcePassed: RouteProduct[]
    let afterResource: number
    if (shouldSkipResourceCheck) {
      resourcePassed = regulationResult.passed
      afterResource = afterRegulation
    } else {
      const resourceResult = filterRouteByResource(
        regulationResult.passed,
        session.totalCubes
      )
      resourcePassed = resourceResult.passed
      afterResource = resourceResult.passed.length
    }

    // 조건 필터
    const conditionFiltered = filterRouteByConditions(
      resourcePassed,
      conditions
    )
    const afterConditions = conditionFiltered.length

    // 정렬
    const sortedOffers = applySorting(conditionFiltered, sort)

    return {
      matchedOffers: sortedOffers,
      matchedOfferIds: sortedOffers.map(o => o.id),
      counts: {
        totalOffers,
        afterRegulation,
        afterResource,
        afterConditions,
      },
      meta: {
        mode,
        executedAt: new Date().toISOString(),
        sortApplied: sort,
      },
    }
  }
}

/**
 * 통합 파이프라인 실행 (Storage + Route 동시 처리)
 *
 * both 탭에서 Storage와 Route를 동시에 처리할 때 사용
 */
export function runCombinedPipeline(params: {
  storageOffers: StorageProduct[]
  routeOffers: RouteProduct[]
  session: MatchingPipelineParams['session']
  conditions?: SearchConditions
  sort?: SortCriteria
}): {
  storage: MatchingPipelineResult<StorageProduct>
  route: MatchingPipelineResult<RouteProduct>
  combinedIds: string[]
  combinedCounts: {
    totalOffers: number
    afterRegulation: number
    afterResource: number
    afterConditions: number
  }
} {
  const { storageOffers, routeOffers, session, conditions, sort } = params

  const storageResult = runMatchingPipeline({
    mode: 'STORAGE',
    offers: storageOffers,
    session,
    conditions,
    sort,
  })

  const routeResult = runMatchingPipeline({
    mode: 'ROUTE',
    offers: routeOffers,
    session,
    conditions,
    sort,
  })

  return {
    storage: storageResult,
    route: routeResult,
    combinedIds: [
      ...storageResult.matchedOfferIds,
      ...routeResult.matchedOfferIds,
    ],
    combinedCounts: {
      totalOffers: storageResult.counts.totalOffers + routeResult.counts.totalOffers,
      afterRegulation: storageResult.counts.afterRegulation + routeResult.counts.afterRegulation,
      afterResource: storageResult.counts.afterResource + routeResult.counts.afterResource,
      afterConditions: storageResult.counts.afterConditions + routeResult.counts.afterConditions,
    },
  }
}

/**
 * 정렬 적용
 *
 * MVP: LATEST만 구현 (기본 배열 순서 또는 id 역순)
 * PRICE_ASC, DISTANCE_ASC는 스텁 처리
 */
function applySorting<T extends StorageProduct | RouteProduct>(
  offers: T[],
  sort: SortCriteria
): T[] {
  switch (sort) {
    case 'LATEST':
      // MVP: id 역순 (최신 등록 = id가 큰 것으로 가정)
      return [...offers].sort((a, b) => b.id.localeCompare(a.id))

    case 'PRICE_ASC':
      // 스텁: price 오름차순
      return [...offers].sort((a, b) => a.price - b.price)

    case 'DISTANCE_ASC':
      // 스텁: MVP에서는 정렬 없이 반환 (거리 계산 필요)
      return [...offers]

    default:
      return [...offers]
  }
}
