/**
 * Domain Types - Provider
 * 업체 정보 도메인 타입 정의
 */

export interface ProviderInfo {
  id: string
  name: string
  serviceType: '보관' | '운송' | '통합'
  verified: boolean
  description?: string
  contractTemplate?: string
  pickupAvailable?: boolean
  weightLimitKg?: number
}
