/**
 * EVT_MATCHING_RUN 필드 스키마
 */

export interface MatchingRunFields {
  mode: 'STORAGE' | 'ROUTE' | 'BOTH'
  totalOffers: number
  matchedCount: number
}

export const MATCHING_RUN_FIELD_SCHEMA = {
  mode:         { type: 'string', required: true,  description: '매칭 모드' },
  totalOffers:  { type: 'number', required: true,  description: '전체 상품 수' },
  matchedCount: { type: 'number', required: true,  description: '매칭된 상품 수' },
} as const
