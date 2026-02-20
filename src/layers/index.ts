/**
 * Layers - 통합 Export
 * 플랫폼 레이어 (Regulation → Resource → Condition → Trade)
 */

// Matching Pipeline (SoT)
export {
  runMatchingPipeline,
  runCombinedPipeline,
  filterStorageByConditions,
  filterRouteByConditions,
  hasDateConditions,
} from './matching'

export type {
  MatchingPipelineParams,
  MatchingPipelineResult,
  PipelineCounts,
  SortCriteria,
  SearchConditions,
  PreviewResult,
} from './matching'
