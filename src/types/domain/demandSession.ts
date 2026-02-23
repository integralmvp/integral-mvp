/**
 * Domain Types - DemandSession
 * 수요 세션 도메인 타입 정의
 */

export type { StorageCondition, TransportCondition } from './condition'
import type { StorageCondition, TransportCondition } from './condition'

// ============ 서비스 유형 ============
export type ServiceType = 'STORAGE' | 'ROUTE' | 'BOTH'
export type ServiceOrder = 'storage-first' | 'transport-first' | null

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
  signature: string   // CDS record type identifier ('INFO_DEMAND_SESSION')
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
