/**
 * INFO_CARGO 필드 스키마
 * 화물 정보 데이터 필드 정의 (타입 + schema 객체)
 */

// ============ 필드 타입 ============
export interface CargoFields {
  dimsMm: { w: number; d: number; h: number }
  sumCm: number
  weightKg: number
  itemCode: string
  weightBand: string
  sizeBand: string
  originRegion?: string
  destinationRegion?: string
  quantity?: number
  boxes?: Array<{ widthMm: number; depthMm: number; heightMm: number; count: number }>
  demandCubes?: number
  notes?: string
}

// ============ 필드 스키마 객체 ============
export const CARGO_FIELD_SCHEMA = {
  dimsMm:            { type: 'object',  required: true,  description: '박스 치수 { w, d, h } (mm)' },
  sumCm:             { type: 'number',  required: true,  description: '3변합 (cm)' },
  weightKg:          { type: 'number',  required: true,  description: '중량 (kg)' },
  itemCode:          { type: 'string',  required: true,  description: '품목 코드 (ICxx)' },
  weightBand:        { type: 'string',  required: true,  description: '중량 밴드 (WBX/WBY/WBZ/WBH)' },
  sizeBand:          { type: 'string',  required: true,  description: '크기 밴드 (SB1~SBX)' },
  originRegion:      { type: 'string',  required: false, description: '출발 지역 법정동 코드' },
  destinationRegion: { type: 'string',  required: false, description: '도착 지역 법정동 코드' },
  quantity:          { type: 'number',  required: false, description: '수량' },
  boxes:             { type: 'array',   required: false, description: '박스 목록' },
  demandCubes:       { type: 'number',  required: false, description: '환산 수요 큐브' },
  notes:             { type: 'string',  required: false, description: '비고' },
} as const
