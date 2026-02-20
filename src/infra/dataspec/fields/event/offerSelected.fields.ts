/**
 * EVT_OFFER_SELECTED 필드 스키마
 */

export interface OfferSelectedFields {
  offerId: string
  offerType: 'STORAGE' | 'ROUTE'
}

export const OFFER_SELECTED_FIELD_SCHEMA = {
  offerId:   { type: 'string', required: true, description: '선택된 상품 ID' },
  offerType: { type: 'string', required: true, description: 'STORAGE | ROUTE' },
} as const
