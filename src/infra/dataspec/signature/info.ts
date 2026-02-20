/**
 * INFO_* 시그니처 상수/타입
 * Code Data System - Info 데이터 분류 키 (taxonomy)
 *
 * "signature"는 Code Data System 전용 분류 키 (INFO_* / EVT_*)
 * 레이어 로직 파생 뷰에는 "profile/snapshot" 용어 사용
 */

export const INFO_SIGNATURES = {
  CARGO: 'INFO_CARGO',
  OFFER: 'INFO_OFFER',
  PROVIDER: 'INFO_PROVIDER',
  DEMAND_SESSION: 'INFO_DEMAND_SESSION',
  DEAL: 'INFO_DEAL',
} as const

export type InfoSignatureKey = keyof typeof INFO_SIGNATURES
export type InfoSignatureValue = typeof INFO_SIGNATURES[InfoSignatureKey]
