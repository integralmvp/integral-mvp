/**
 * INFO_DEMAND_SESSION 필드 스키마
 * 수요 세션 데이터 필드 정의 (타입 + schema 객체)
 */

// ============ 필드 타입 ============
export interface DemandSessionFields {
  /** 서비스 유형 */
  mode: 'STORAGE' | 'ROUTE' | 'BOTH'
  /** 연결된 화물 ID 목록 */
  cargoIds: string[]
  /** 화물별 수량 */
  quantitiesByCargoId: Record<string, number>
  /** 필터 조건 스냅샷 */
  filters?: {
    locationCode?: string
    originCode?: string
    destinationCode?: string
    startDate?: string
    endDate?: string
    transportDate?: string
  }
  /** 계산된 수요 큐브 */
  computedDemand?: {
    totalCubes: number
    totalPallets?: number
    volumeCubes?: number
    totalWeightKg?: number
  }
  /** 규정/자원 체크 요약 */
  regulationSummary?: {
    checked: boolean
    passedOfferIds: string[]
    failedOfferIdsCount: number
  }
  resourceSummary?: {
    checked: boolean
    passedOfferIds: string[]
    failedOfferIdsCount: number
  }
}

// ============ 필드 스키마 객체 ============
export const DEMAND_SESSION_FIELD_SCHEMA = {
  mode:              { type: 'string',  required: true,  description: 'STORAGE | ROUTE | BOTH' },
  cargoIds:          { type: 'array',   required: true,  description: '연결된 화물 ID 목록' },
  quantitiesByCargoId: { type: 'object', required: true, description: '화물별 수량' },
  filters:           { type: 'object',  required: false, description: '필터 조건 스냅샷' },
  computedDemand:    { type: 'object',  required: false, description: '계산된 수요 큐브/팔렛' },
  regulationSummary: { type: 'object',  required: false, description: '규정 체크 요약' },
  resourceSummary:   { type: 'object',  required: false, description: '자원 체크 요약' },
} as const
