/**
 * Domain Types - DemandSession
 * 수요 세션 도메인 타입 정의
 */

import type { RegionCode } from './codes'

// ============ 서비스 유형 ============
export type ServiceType = 'STORAGE' | 'ROUTE' | 'BOTH'
export type ServiceOrder = 'storage-first' | 'transport-first' | null

// ============ 조건 입력 상태 ============
export interface StorageCondition {
  location?: string           // 보관 장소 표시용 (name)
  locationCode?: RegionCode   // 보관 장소 법정동 코드 (필터링 SoT)
  startDate?: string
  endDate?: string
}

export interface TransportCondition {
  origin?: string
  originCode?: RegionCode
  destination?: string
  destinationCode?: RegionCode
  transportDate?: string
}

// ============ 수요 세션 상태 ============
export type DemandStatus =
  | 'DRAFT'
  | 'RULES_PASSED'
  | 'RESOURCE_READY'
  | 'SEARCHED'
  | 'DEAL_STARTED'

// ============ DemandSession ============
export interface DemandSession {
  demandId: string
  ownerId: string

  serviceType: ServiceType
  order?: ServiceOrder

  cargoIds: string[]
  quantitiesByCargoId: Record<string, number>

  cubeResultByCargoId?: Record<string, {
    mode: 'STORAGE' | 'ROUTE'
    cubes: number
  }>
  totalCubes?: number
  totalPallets?: number
  volumeCubes?: number
  totalWeightKg?: number
  billableCubes?: number

  storageCondition?: StorageCondition
  transportCondition?: TransportCondition

  status: DemandStatus

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

  createdAt: string
  updatedAt: string
}
