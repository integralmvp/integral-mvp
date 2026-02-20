/**
 * INFO_OFFER 필드 스키마
 * 공간/경로 상품 데이터 필드 정의 (타입 + schema 객체)
 */

// ============ 필드 타입 ============
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
  features?: string[]
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
