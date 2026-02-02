/**
 * PR5: 자원 체크 모듈
 *
 * 규정 통과 → 자원(용량) 체크 → 최종 구매 가능 상품
 */

// 타입 내보내기
export type {
  ResourceCheckResult,
  ResourceCheckParams,
  OfferResourceCheckResult,
  ResourceFilterResult,
} from './resourceTypes'

// 함수 내보내기
export {
  checkResource,
  filterStorageByResource,
  filterRouteByResource,
  filterOffersByResource,
} from './resourceEngine'
