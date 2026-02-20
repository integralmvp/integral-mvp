/**
 * UI Types - ServiceConsole
 * ServiceConsole UI 입력/상태 타입
 */

import type { RegionCode } from '../domain/codes'
import type { ModuleClassification, BoxSize } from '../domain/cargo'
import type { WeightBand, SizeBand } from '../domain/codes'

// ============ 중량 구간 (UI 표시용) ============
export type WeightRange = '0-5kg' | '5-10kg' | '10-20kg' | '20-30kg' | '30kg+'

// ============ 품목 카테고리 ============
export interface ProductCategory {
  code: string
  name: string
  subCategories?: { code: string; name: string }[]
}

// ============ 화물 UI 모델 ============
export interface CargoUI {
  id: string
  width: number
  depth: number
  height: number
  moduleType?: ModuleClassification
  itemCode?: string
  productCategory?: string       // 레거시 호환용
  productSubCategory?: string    // 레거시 호환용
  weightKg?: number
  weightRange?: WeightRange      // 레거시 호환용
  weightBand?: WeightBand
  sizeBand?: SizeBand
  sumCm?: number
  cargoInfoId?: string
  completed: boolean
}

// ============ 등록된 화물 ============
export interface RegisteredCargo extends CargoUI {
  cargoNumber: number
  quantity?: number
  estimatedCubes?: number
}

// ============ 지역 옵션 (드롭다운용) ============
export interface LocationOption {
  id: string
  name: string
  level: 'island' | 'city' | 'district'
  parentId?: string
}

// ============ CargoCondition (거래 모달용) ============
export type UnitLoadModule = '소형' | '대형' | '특수'

export type HandlingOption =
  | '파손주의'
  | '냉장'
  | '냉동'
  | '위험물'
  | '온도민감'
  | '적재방향'

export interface CargoCondition {
  unitLoadModule: UnitLoadModule
  handlingOptions: HandlingOption[]
  quantity: number
  notes?: string
}

// ============ 매칭 상태 ============
export type MatchStatus = '가능' | '주의' | '불가'

export interface MatchResult {
  status: MatchStatus
  message: string
  restrictions?: { reason: string; detail: string }[]
  warnings?: string[]
}

// ============ 비용 추정 ============
export interface CostEstimate {
  basePrice: number
  handlingFee?: number
  totalPrice: number
  breakdown: { label: string; amount: number }[]
}

// Re-export BoxSize for UI usage
export type { BoxSize }

// Re-export RegionCode for UI usage
export type { RegionCode }
