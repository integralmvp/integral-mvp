/**
 * EVT_MATCHING_RUN 최소 필드 스키마
 */

export interface MatchingRunFields {
  mode: 'STORAGE' | 'ROUTE' | 'BOTH'
  totalOffers: number
  matchedCount: number
}
