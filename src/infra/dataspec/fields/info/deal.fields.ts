/**
 * INFO_DEAL 필드 스키마
 * 거래 데이터 필드 정의 (타입 + schema 객체)
 */

// ============ 필드 타입 ============
export interface DealFields {
  offerId: string
  cargoId: string
  demandId: string
  status: 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'CANCELLED'
  /** 정산 스냅샷 (거래 확정 시점 고정) */
  pricingSnapshot?: {
    billableCubes: number
    unitPricePerCube: number
    totalCost: number
    volumeCubes?: number
    weightCubes?: number
    weightSurchargeApplied?: boolean
  }
  pickupRequested?: boolean
  userMemo?: string
}

// ============ 필드 스키마 객체 ============
export const DEAL_FIELD_SCHEMA = {
  offerId:         { type: 'string',  required: true,  description: '선택된 상품 ID' },
  cargoId:         { type: 'string',  required: true,  description: '화물 ID' },
  demandId:        { type: 'string',  required: true,  description: '수요 세션 ID' },
  status:          { type: 'string',  required: true,  description: '거래 상태' },
  pricingSnapshot: { type: 'object',  required: false, description: '정산 스냅샷 (확정 시점 고정)' },
  pickupRequested: { type: 'boolean', required: false, description: '픽업 요청 여부' },
  userMemo:        { type: 'string',  required: false, description: '요청 메모' },
} as const
