/**
 * EVT_DEAL_REQUESTED 필드 스키마
 */

export interface DealRequestedFields {
  demandId: string
  selectedStorageId?: string
  selectedRouteId?: string
}

export const DEAL_REQUESTED_FIELD_SCHEMA = {
  demandId:          { type: 'string', required: true,  description: '수요 세션 ID' },
  selectedStorageId: { type: 'string', required: false, description: '선택된 보관 상품 ID' },
  selectedRouteId:   { type: 'string', required: false, description: '선택된 경로 상품 ID' },
} as const
