/**
 * Provider Repository - mock 기반 구현
 *
 * MVP: PROVIDERS 배열을 단일 접근점으로 래핑
 * PR8+ (DB 연동) 이후 저장소 구체화
 */

import type { ProviderInfo } from '../../../types/models'
import { PROVIDERS } from '../../../data/mock/records/providers'

/**
 * 업체 전체 조회
 */
export function getAllProviders(): ProviderInfo[] {
  return PROVIDERS
}

/**
 * 업체 단건 조회 (ID)
 */
export function getProviderById(id: string): ProviderInfo | undefined {
  return PROVIDERS.find(p => p.id === id)
}

/**
 * 업체 단건 조회 (서비스 타입별)
 */
export function getProvidersByServiceType(serviceType: ProviderInfo['serviceType']): ProviderInfo[] {
  return PROVIDERS.filter(p => p.serviceType === serviceType)
}
