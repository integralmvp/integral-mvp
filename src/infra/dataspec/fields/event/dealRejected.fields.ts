/**
 * EVT_DEAL_REJECTED 필드 스키마
 */

export interface DealRejectedFields {
  dealId: string
  reason?: string
}

export const DEAL_REJECTED_FIELD_SCHEMA = {
  dealId: { type: 'string', required: true,  description: '거래 ID' },
  reason: { type: 'string', required: false, description: '거절 사유' },
} as const
