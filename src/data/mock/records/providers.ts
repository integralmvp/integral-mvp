/**
 * Mock Records - INFO_PROVIDER[]
 * 업체 정보 CDS 레코드 (8개)
 *
 * 규칙:
 * - id: 'PROVIDER_S1' 등 의미적 식별자 (InfoOfferRecord.fields.providerId와 1:1 매핑)
 * - signature: 'INFO_PROVIDER'
 * - 빌더/repo가 ProviderInfo UI DTO로 변환하여 사용
 * - findProvider() 는 제거됨. builder/repo에서 조회 처리.
 */

import type { InfoProviderRecord } from '../../../infra/dataspec/fields/info/provider.fields'

const SEED_DATE = '2026-01-01T00:00:00.000Z'

export const PROVIDER_RECORDS: InfoProviderRecord[] = [
  // ── 보관 업체 (4개) ────────────────────────────────────────────────
  {
    id: 'PROVIDER_S1',
    signature: 'INFO_PROVIDER',
    fields: {
      name: '제주물류센터',
      serviceType: '보관',
      verified: true,
      description: '제주항 인근 대형 물류센터, 24시간 입출고 가능',
      contractTemplate: '제주물류센터 표준 계약서 v2.1',
      pickupAvailable: true,
      weightLimitKg: 25,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'PROVIDER_S2',
    signature: 'INFO_PROVIDER',
    fields: {
      name: '한라냉장',
      serviceType: '보관',
      verified: true,
      description: '식품 전문 냉장/냉동 물류 서비스',
      contractTemplate: '한라냉장 표준 계약서 v1.8',
      pickupAvailable: false,
      weightLimitKg: 20,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'PROVIDER_S3',
    signature: 'INFO_PROVIDER',
    fields: {
      name: '서귀창고',
      serviceType: '보관',
      verified: true,
      description: '서귀포 지역 중심 물류 창고',
      contractTemplate: '서귀창고 표준 계약서 v1.5',
      pickupAvailable: true,
      weightLimitKg: 30,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'PROVIDER_S4',
    signature: 'INFO_PROVIDER',
    fields: {
      name: '탐라스토리지',
      serviceType: '보관',
      verified: false,
      description: '중소 규모 창고 전문',
      contractTemplate: '탐라스토리지 계약서 v1.0',
      pickupAvailable: false,
      weightLimitKg: 20,
    },
    createdAt: SEED_DATE,
    version: 1,
  },

  // ── 운송 업체 (3개) ────────────────────────────────────────────────
  {
    id: 'PROVIDER_R1',
    signature: 'INFO_PROVIDER',
    fields: {
      name: '제주택배',
      serviceType: '운송',
      verified: true,
      description: '도내 운송 전문, 정시 배송 보장',
      contractTemplate: '제주택배 표준 계약서 v3.2',
      pickupAvailable: true,
      weightLimitKg: 25,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'PROVIDER_R2',
    signature: 'INFO_PROVIDER',
    fields: {
      name: '해운물류',
      serviceType: '운송',
      verified: true,
      description: '제주-육지 간 해상 운송 전문',
      contractTemplate: '해운물류 표준 계약서 v2.5',
      pickupAvailable: false,
      weightLimitKg: 30,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'PROVIDER_R3',
    signature: 'INFO_PROVIDER',
    fields: {
      name: '올레운송',
      serviceType: '운송',
      verified: true,
      description: '소형 화물 빠른 배송',
      contractTemplate: '올레운송 계약서 v1.2',
      pickupAvailable: true,
      weightLimitKg: 15,
    },
    createdAt: SEED_DATE,
    version: 1,
  },

  // ── 통합 업체 (1개) ────────────────────────────────────────────────
  {
    id: 'PROVIDER_B1',
    signature: 'INFO_PROVIDER',
    fields: {
      name: '제주통합물류',
      serviceType: '통합',
      verified: true,
      description: '보관부터 운송까지 원스톱 서비스',
      contractTemplate: '제주통합물류 표준 계약서 v2.0',
      pickupAvailable: true,
      weightLimitKg: 30,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
]
