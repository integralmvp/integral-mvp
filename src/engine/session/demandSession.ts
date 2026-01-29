/**
 * PR5: DemandSession 관리 로직
 *
 * 검색 시점의 스냅샷 생성 및 상태 관리
 */

import type {
  SearchSessionSnapshot,
  CreateSearchSessionParams,
  RegulationSummary,
  ResourceSummary,
} from './demandSessionTypes'

/**
 * ULID 스타일 ID 생성 (간단 버전)
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `session_${timestamp}${random}`
}

/**
 * 검색 세션 스냅샷 생성
 *
 * 검색 버튼 클릭 시점에 호출
 * 초기 상태는 DRAFT
 */
export function createSearchSession(
  params: CreateSearchSessionParams
): SearchSessionSnapshot {
  const { mode, cargos, totalCubes, totalPallets, conditions } = params

  return {
    sessionId: generateSessionId(),
    mode,
    createdAt: new Date().toISOString(),
    cargos,
    totalCubes,
    totalPallets: mode === 'STORAGE' ? totalPallets : undefined,
    conditions,
    regulationSummary: {
      checked: false,
      passedOfferIds: [],
      failedOfferIdsCount: 0,
    },
    resourceSummary: {
      checked: false,
      passedOfferIds: [],
      failedOfferIdsCount: 0,
    },
    status: 'DRAFT',
  }
}

/**
 * 규정 체크 결과 적용
 *
 * 규정 엔진 결과를 세션에 반영
 * 상태를 RULES_PASSED로 전이
 */
export function applyRegulationResult(
  session: SearchSessionSnapshot,
  regulationSummary: RegulationSummary
): SearchSessionSnapshot {
  return {
    ...session,
    regulationSummary: {
      ...regulationSummary,
      checked: true,
    },
    status: 'RULES_PASSED',
  }
}

/**
 * 자원 체크 결과 적용
 *
 * 자원 엔진 결과를 세션에 반영
 * 상태를 RESOURCE_READY로 전이
 */
export function applyResourceResult(
  session: SearchSessionSnapshot,
  resourceSummary: ResourceSummary
): SearchSessionSnapshot {
  return {
    ...session,
    resourceSummary: {
      ...resourceSummary,
      checked: true,
    },
    status: 'RESOURCE_READY',
  }
}

/**
 * 전체 검색 파이프라인 실행 결과 적용
 *
 * 규정 → 자원 순서로 한번에 적용
 */
export function applyFullSearchResult(
  session: SearchSessionSnapshot,
  regulationSummary: RegulationSummary,
  resourceSummary: ResourceSummary
): SearchSessionSnapshot {
  return {
    ...session,
    regulationSummary: {
      ...regulationSummary,
      checked: true,
    },
    resourceSummary: {
      ...resourceSummary,
      checked: true,
    },
    status: 'RESOURCE_READY',
  }
}
