/**
 * INFO_PROVIDER 필드 스키마
 * 업체 정보 데이터 필드 정의 (타입 + schema 객체)
 */

// ============ 필드 타입 ============
export interface ProviderFields {
  name: string
  serviceType: '보관' | '운송' | '통합'
  verified: boolean
  description?: string
  contractTemplate?: string
  pickupAvailable?: boolean
  weightLimitKg?: number
}

// ============ InfoProviderRecord (CDS 레코드 타입) ============
export interface InfoProviderRecord {
  id: string              // 'PROVIDER_S1' 등 의미적 식별자 (offer 레코드 providerId와 매핑)
  signature: 'INFO_PROVIDER'
  fields: ProviderFields
  createdAt: string       // ISO 8601
  version: number
}

// ============ 필드 스키마 객체 ============
export const PROVIDER_FIELD_SCHEMA = {
  name:             { type: 'string',  required: true,  description: '업체명' },
  serviceType:      { type: 'string',  required: true,  description: '서비스 유형 (보관/운송/통합)' },
  verified:         { type: 'boolean', required: true,  description: '인증 여부' },
  description:      { type: 'string',  required: false, description: '업체 설명' },
  contractTemplate: { type: 'string',  required: false, description: '계약서 템플릿' },
  pickupAvailable:  { type: 'boolean', required: false, description: '픽업 서비스 제공 여부' },
  weightLimitKg:    { type: 'number',  required: false, description: '업체별 중량 제한 (kg)' },
} as const
