/**
 * EVT_DEAL_ACCEPTED 필드 스키마
 */

export interface DealAcceptedFields {
  dealId: string
  billableCubes: number
}

export const DEAL_ACCEPTED_FIELD_SCHEMA = {
  dealId:        { type: 'string', required: true, description: '거래 ID' },
  billableCubes: { type: 'number', required: true, description: '확정 과금 큐브' },
} as const
