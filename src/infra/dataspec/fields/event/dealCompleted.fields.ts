/**
 * EVT_DEAL_COMPLETED 필드 스키마
 */

export interface DealCompletedFields {
  dealId: string
  totalCost: number
  billableCubes: number
}

export const DEAL_COMPLETED_FIELD_SCHEMA = {
  dealId:        { type: 'string', required: true, description: '거래 ID' },
  totalCost:     { type: 'number', required: true, description: '총 비용 (원)' },
  billableCubes: { type: 'number', required: true, description: '과금 큐브' },
} as const
