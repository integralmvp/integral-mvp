/**
 * Matching Pipeline Module - Export Hub
 * PR6: 검색 파이프라인의 단일 진실 소스
 * 규정(PR4) → 자원(PR5) → 조건(PR6) → 정렬(PR6)
 */

// 파이프라인 함수 (SoT)
export { runMatchingPipeline, runCombinedPipeline } from './pipeline'

// 조건 필터 함수
export {
  filterStorageByConditions,
  filterRouteByConditions,
  hasDateConditions,
} from './condition/conditionFilters'

// 타입 (from layers/types)
export type {
  MatchingPipelineParams,
  MatchingPipelineResult,
  PipelineCounts,
  SortCriteria,
  SearchConditions,
  PreviewResult,
  StorageConditionFilterParams,
  RouteConditionFilterParams,
} from '../types/matchingTypes'
