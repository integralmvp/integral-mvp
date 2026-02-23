/**
 * Domain Types - Cargo
 * 화물 관련 도메인 타입 정의
 */

import type { WeightBand, SizeBand } from '../../infra/dataspec/codedata/bands/bands'

// ============ 기본 타입 ============
export type CargoType = '일반' | '냉장' | '냉동' | '위험물'

// ============ 박스 규격 (엔진 레이어 호환) ============
export interface BoxInput {
  widthMm: number
  depthMm: number
  heightMm: number
  count: number
  weightKg?: number
  stackable?: boolean
}

// 박스 UI 입력 Row
export interface BoxInputUI {
  id: string
  width: number   // mm
  depth: number   // mm
  height: number  // mm
  count: number
  completed?: boolean
}

// ============ 모듈 분류 ============
export type ModuleClassification = '소형' | '중형' | '대형' | 'UNCLASSIFIED'
export type BoxSize = '소형' | '중형' | '대형'

export interface ClassifiedBox extends BoxInput {
  classification: ModuleClassification
}

export interface ModuleAggregate {
  moduleName: BoxSize
  countTotal: number
  heightMax: number
  volumeTotal: number
  palletsStandalone: number
}

// ============ 면적 선택 ============
export type AreaInputType = 'module' | 'area'

export interface ModuleInput {
  count: number
  height: number
}

export interface ModuleInputs {
  소형?: ModuleInput
  중형?: ModuleInput
  대형?: ModuleInput
}

export interface StorageAreaSelection {
  inputType: AreaInputType
  selectedModules?: Set<BoxSize>
  moduleInputs?: ModuleInputs
  areaInSquareMeters?: number
  estimatedPallets?: number
}

export interface BoxBasedAreaSelection {
  inputType: 'box' | 'area'
  boxes?: BoxInput[]
  classifiedBoxes?: ClassifiedBox[]
  moduleAggregates?: ModuleAggregate[]
  hasUnclassified?: boolean
  areaInSquareMeters?: number
  estimatedPallets?: number
}

// ============ Code Data System - CargoInfo ============
export interface CargoInfo {
  id: string
  signature: string  // CDS record type identifier ('INFO_CARGO')
  ownerId: string

  taxonomy: {
    moduleClass: ModuleClassification
    itemCode: string
    weightBand: WeightBand
    sizeBand: SizeBand
  }

  fields: {
    dimsMm: { w: number; d: number; h: number }
    sumCm: number
    weightKg: number
    notes?: string
  }

  createdAt: string
}

// ============ Event Fields (화물 관련) ============
export interface RuleCheckedFields {
  passed: boolean
  reasons: string[]
}

export interface CubeCalculatedFields {
  mode: 'STORAGE' | 'ROUTE'
  cubes: number
  packingFactor: number
}
