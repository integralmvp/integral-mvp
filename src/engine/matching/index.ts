/**
 * PR6: Matching Pipeline Module
 *
 * 검색 파이프라인의 단일 진실 소스
 * 규정(PR4) → 자원(PR5) → 조건(PR6) → 정렬(PR6)
 */

// 파이프라인 함수
export { runMatchingPipeline, runCombinedPipeline } from './matchingPipeline'

// 조건 필터 함수
export {
  filterStorageByConditions,
  filterRouteByConditions,
  hasDateConditions,
} from './conditionFilters'

// 타입
export type {
  MatchingPipelineParams,
  MatchingPipelineResult,
  PipelineCounts,
  SortCriteria,
  SearchConditions,
  PreviewResult,
  StorageConditionFilterParams,
  RouteConditionFilterParams,
} from './matchingPipelineTypes'
