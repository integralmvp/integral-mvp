/**
 * PR5: DemandSession 모듈
 *
 * 검색 시점의 스냅샷 생성 및 관리
 */

// 타입 내보내기
export type {
  SearchConditionSnapshot,
  RegulationSummary,
  ResourceSummary,
  SearchSessionSnapshot,
  CreateSearchSessionParams,
} from './demandSessionTypes'

// 함수 내보내기
export {
  createSearchSession,
  applyRegulationResult,
  applyResourceResult,
  applyFullSearchResult,
} from './demandSession'
