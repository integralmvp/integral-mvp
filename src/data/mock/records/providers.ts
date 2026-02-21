/**
 * Mock Records - INFO_PROVIDER[]
 * 업체 정보 목업 레코드 (CDS 기반)
 * signature: INFO_PROVIDER
 */

import type { ProviderInfo } from '../../../types/models'

export const PROVIDERS: ProviderInfo[] = [
  // 보관 업체
  {
    id: 'PROVIDER_S1',
    name: '제주물류센터',
    serviceType: '보관',
    verified: true,
    description: '제주항 인근 대형 물류센터, 24시간 입출고 가능',
    contractTemplate: '제주물류센터 표준 계약서 v2.1',
    pickupAvailable: true,
    weightLimitKg: 25,
  },
  {
    id: 'PROVIDER_S2',
    name: '한라냉장',
    serviceType: '보관',
    verified: true,
    description: '식품 전문 냉장/냉동 물류 서비스',
    contractTemplate: '한라냉장 표준 계약서 v1.8',
    pickupAvailable: false,
    weightLimitKg: 20,
  },
  {
    id: 'PROVIDER_S3',
    name: '서귀창고',
    serviceType: '보관',
    verified: true,
    description: '서귀포 지역 중심 물류 창고',
    contractTemplate: '서귀창고 표준 계약서 v1.5',
    pickupAvailable: true,
    weightLimitKg: 30,
  },
  {
    id: 'PROVIDER_S4',
    name: '탐라스토리지',
    serviceType: '보관',
    verified: false,
    description: '중소 규모 창고 전문',
    contractTemplate: '탐라스토리지 계약서 v1.0',
    pickupAvailable: false,
    weightLimitKg: 20,
  },
  // 운송 업체
  {
    id: 'PROVIDER_R1',
    name: '제주택배',
    serviceType: '운송',
    verified: true,
    description: '도내 운송 전문, 정시 배송 보장',
    contractTemplate: '제주택배 표준 계약서 v3.2',
    pickupAvailable: true,
    weightLimitKg: 25,
  },
  {
    id: 'PROVIDER_R2',
    name: '해운물류',
    serviceType: '운송',
    verified: true,
    description: '제주-육지 간 해상 운송 전문',
    contractTemplate: '해운물류 표준 계약서 v2.5',
    pickupAvailable: false,
    weightLimitKg: 30,
  },
  {
    id: 'PROVIDER_R3',
    name: '올레운송',
    serviceType: '운송',
    verified: true,
    description: '소형 화물 빠른 배송',
    contractTemplate: '올레운송 계약서 v1.2',
    pickupAvailable: true,
    weightLimitKg: 15,
  },
  // 통합 업체
  {
    id: 'PROVIDER_B1',
    name: '제주통합물류',
    serviceType: '통합',
    verified: true,
    description: '보관부터 운송까지 원스톱 서비스',
    contractTemplate: '제주통합물류 표준 계약서 v2.0',
    pickupAvailable: true,
    weightLimitKg: 30,
  },
]

/** 업체 ID로 업체 정보 찾기 (records 내부용) */
export function findProvider(id: string): ProviderInfo {
  const provider = PROVIDERS.find(p => p.id === id)
  if (!provider) throw new Error(`Provider ${id} not found`)
  return provider
}
