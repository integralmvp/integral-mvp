/**
 * INFO_OFFER 필드 스키마
 * 공간/경로 상품 데이터 필드 정의 (타입 + schema 객체)
 */

import type { FeatureCode } from '../../codedata/features/featureCodes'

// ============ 필드 타입 (CDS 핵심 스키마) ============
export interface OfferFields {
  offerType: 'STORAGE' | 'ROUTE'
  providerId: string
  /** 보관 상품: 보관 지역 법정동 코드 */
  regionCode?: string
  /** 경로 상품: 출발지 법정동 코드 */
  originCode?: string
  /** 경로 상품: 도착지 법정동 코드 */
  destinationCode?: string
  /** 큐브 단가 (SoT: unitPricePerCube) */
  unitPricePerCube: number
  /** 총 수용 가능 큐브 (SoT) */
  capacityCubes: number
  /** 현재 남은 큐브 (SoT) */
  remainingCubes: number
  /** 규정 (크기/중량/품목 제한) */
  rules?: {
    maxWeightKg?: number
    maxSumCm?: number
    minCubes?: number
    allowedItemCodes?: string[]
    tempSupported?: boolean
    hazmatSupported?: boolean
  }
  /** 기능 코드 목록 */
  features?: FeatureCode[]
}

// ============ CDS 레코드용 확장 필드 (UI DTO 재구성에 필요한 모든 필드) ============
export interface OfferRecordFields {
  offerType: 'STORAGE' | 'ROUTE'
  providerId: string          // PROVIDER_S1 등 provider 레코드 ID

  // SoT: 큐브/가격/하중 (단일 진실)
  capacityCubes: number
  remainingCubes: number
  unitPricePerCube: number
  maxKgPerCube: number
  payloadCapacityKg: number
  remainingPayloadKg: number

  // 규정 필드
  maxWeightKg?: number
  maxSumCm?: number
  minCubes?: number
  allowedItemCodes?: string[]
  tempSupported?: boolean
  hazmatSupported?: boolean
  allowedModuleClasses?: string[]   // ModuleClassification[]

  // STORAGE 전용
  regionCode?: string               // 법정동 코드 (필터링 SoT)
  locationCoordsKey?: string        // 좌표 조회 키, 없으면 regionCode 폴백
  locationName?: string             // 표시용 지역명
  locationRegion?: string           // 표시용 지역 라벨
  storageType?: '상온' | '냉장' | '냉동'
  capacityText?: string             // '파렛트 30개' 등 표시용
  features?: FeatureCode[]

  // ROUTE 전용
  originCode?: string               // 출발지 법정동 코드 ('' = 육지 항만)
  destinationCode?: string          // 도착지 법정동 코드 ('' = 육지 항만)
  originCoordsKey?: string          // 출발지 좌표 조회 키, 없으면 originCode 폴백
  destinationCoordsKey?: string     // 도착지 좌표 조회 키, 없으면 destinationCode 폴백
  originName?: string               // 출발지 표시명
  destinationName?: string          // 도착지 표시명
  schedule?: string                 // 운행 스케줄
  vehicleCapacityText?: string      // '5톤' 등 표시용
  vehicleType?: string
  cargoTypes?: string[]             // CargoType[]
  routeScope?: 'INTRA_JEJU' | 'SEA'
  direction?: 'INBOUND' | 'OUTBOUND'
  tripType?: 'ONE_WAY' | 'ROUND_TRIP'
}

// ============ InfoOfferRecord (CDS 레코드 타입) ============
export interface InfoOfferRecord {
  id: string              // 'offer_r001' ~ 'offer_s008' 형식
  signature: 'INFO_OFFER'
  fields: OfferRecordFields
  createdAt: string       // ISO 8601
  version: number
}

// ============ 필드 스키마 객체 ============
export const OFFER_FIELD_SCHEMA = {
  offerType:         { type: 'string',  required: true,  description: 'STORAGE | ROUTE' },
  providerId:        { type: 'string',  required: true,  description: '업체 ID' },
  regionCode:        { type: 'string',  required: false, description: '보관 지역 법정동 코드' },
  originCode:        { type: 'string',  required: false, description: '경로 출발지 법정동 코드' },
  destinationCode:   { type: 'string',  required: false, description: '경로 도착지 법정동 코드' },
  unitPricePerCube:  { type: 'number',  required: true,  description: '큐브 단가 (SoT)' },
  capacityCubes:     { type: 'number',  required: true,  description: '총 수용 가능 큐브 (SoT)' },
  remainingCubes:    { type: 'number',  required: true,  description: '남은 큐브 (SoT)' },
  rules:             { type: 'object',  required: false, description: '규정 (크기/중량/품목 제한)' },
  features:          { type: 'array',   required: false, description: '기능 코드 목록' },
} as const
