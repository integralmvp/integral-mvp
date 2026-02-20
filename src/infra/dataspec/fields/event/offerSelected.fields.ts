/**
 * EVT_OFFER_SELECTED 최소 필드 스키마
 */

export interface OfferSelectedFields {
  offerId: string
  offerType: 'STORAGE' | 'ROUTE'
}
