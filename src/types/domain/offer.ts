/**
 * Domain Types - Offer (StorageProduct, RouteProduct)
 * 공간/경로 상품 도메인 타입 정의
 */

import type { FeatureCode } from '../../infra/dataspec/codedata/features/featureCodes'
import type { ModuleClassification } from './cargo'
import type { ProviderInfo } from './provider'

// ============ 기본 위치 타입 ============
export interface Location {
  name: string
  lat: number
  lng: number
}

// ============ 규정 상태 ============
export interface RegulationStatus {
  allowed: boolean
  restrictions?: string[]
}

// ============ 공간 상품 ============
export type StorageType = '상온' | '냉장' | '냉동'

export interface StorageProduct {
  id: string
  location: Location & { region: string; regionCode: string }
  storageType: StorageType
  capacity: string
  price: number
  priceUnit: string
  features: FeatureCode[]
  connectedRoutes?: string[]
  regulationStatus: RegulationStatus
  // PR4 규정 필드
  allowedItemCodes?: string[]
  maxWeightKg?: number
  maxSumCm?: number
  minCubes?: number
  tempSupported?: boolean
  hazmatSupported?: boolean
  allowedModuleClasses?: ModuleClassification[]
  // PR5 자원 필드 (SoT)
  capacityCubes: number
  remainingCubes: number
  // PR7 정산 필드 (SoT)
  unitPricePerCube: number
  maxKgPerCube: number
  payloadCapacityKg?: number
  remainingPayloadKg?: number
  // PR7 업체 정보
  provider: ProviderInfo
}

// ============ 경로 상품 ============
export type RouteScope = 'INTRA_JEJU' | 'SEA'
export type Direction = 'INBOUND' | 'OUTBOUND'
export type TripType = 'ONE_WAY' | 'ROUND_TRIP'

export interface RouteProduct {
  id: string
  origin: Location
  destination: Location
  originCode: string
  destinationCode: string
  schedule: string
  capacity: string
  vehicleType: string
  cargoTypes: import('./cargo').CargoType[]
  price: number
  priceUnit: string
  canIntegrateWith?: string[]
  regulationStatus: RegulationStatus
  routeScope: RouteScope
  direction?: Direction
  tripType?: TripType
  // PR4 규정 필드
  allowedItemCodes?: string[]
  maxWeightKg?: number
  maxSumCm?: number
  minCubes?: number
  tempSupported?: boolean
  hazmatSupported?: boolean
  allowedModuleClasses?: ModuleClassification[]
  // PR5 자원 필드 (SoT)
  capacityCubes: number
  remainingCubes: number
  // PR7 정산 필드 (SoT)
  unitPricePerCube: number
  maxKgPerCube: number
  payloadCapacityKg?: number
  remainingPayloadKg?: number
  // PR7 업체 정보
  provider: ProviderInfo
}
