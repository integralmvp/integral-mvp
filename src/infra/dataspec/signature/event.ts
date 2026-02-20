/**
 * EVT_* 시그니처 상수/타입
 * Code Data System - Event 데이터 분류 키 (taxonomy)
 */

export const EVT_SIGNATURES = {
  // 화물 관련
  CARGO_CREATED: 'EVT_CARGO_CREATED',
  CARGO_REMOVED: 'EVT_CARGO_REMOVED',
  CARGO_SIGNATURE_UPDATED: 'EVT_CARGO_SIGNATURE_UPDATED',
  // 매칭 관련
  MATCHING_RUN: 'EVT_MATCHING_RUN',
  OFFER_SELECTED: 'EVT_OFFER_SELECTED',
  // 거래 관련
  DEAL_REQUESTED: 'EVT_DEAL_REQUESTED',
  DEAL_ACCEPTED: 'EVT_DEAL_ACCEPTED',
  DEAL_REJECTED: 'EVT_DEAL_REJECTED',
  DEAL_COMPLETED: 'EVT_DEAL_COMPLETED',
} as const

export type EvtSignatureKey = keyof typeof EVT_SIGNATURES
export type EvtSignatureValue = typeof EVT_SIGNATURES[EvtSignatureKey]
