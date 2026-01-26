/**
 * Demand Store
 *
 * DemandSession 저장/로드
 * 수요 세션 데이터 관리
 */

import type {
  DemandSession,
  ServiceType,
  DemandStatus,
  ServiceOrder,
  StorageCondition,
  TransportCondition,
} from '../types/models'
import { STORAGE_KEYS, getActiveDemandKey } from './storageKeys'
import { makeDemandId } from './id'
import {
  logQuantitySet,
  logCubeCalculated,
  logResourceReady,
  logStorageLocationSet,
  logStoragePeriodSet,
  logTransportOriginSet,
  logTransportDestinationSet,
  logTransportDateSet,
  logSearchExecuted,
  logRulesPassed,
} from './eventLog'

// MVP 기본 소유자 ID
const DEFAULT_OWNER_ID = 'demo-user'

/**
 * 모든 수요 세션 로드
 */
function loadAllDemands(): DemandSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEMANDS)
    if (!raw) return []
    return JSON.parse(raw) as DemandSession[]
  } catch {
    console.error('[DemandStore] Failed to load demands')
    return []
  }
}

/**
 * 수요 세션 저장
 */
function saveAllDemands(demands: DemandSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEMANDS, JSON.stringify(demands))
  } catch (error) {
    console.error('[DemandStore] Failed to save demands:', error)
  }
}

/**
 * 활성 수요 세션 ID 저장
 */
function saveActiveDemandId(serviceType: ServiceType, demandId: string): void {
  const key = getActiveDemandKey(serviceType)
  localStorage.setItem(key, demandId)
}

/**
 * 활성 수요 세션 ID 로드
 */
function loadActiveDemandId(serviceType: ServiceType): string | null {
  const key = getActiveDemandKey(serviceType)
  return localStorage.getItem(key)
}

/**
 * 새 수요 세션 생성
 */
export function createDemand(params: {
  serviceType: ServiceType
  order?: ServiceOrder
  ownerId?: string
}): DemandSession {
  const now = new Date().toISOString()

  const demand: DemandSession = {
    demandId: makeDemandId(),
    ownerId: params.ownerId || DEFAULT_OWNER_ID,
    serviceType: params.serviceType,
    order: params.order,
    cargoIds: [],
    quantitiesByCargoId: {},
    status: 'DRAFT',
    createdAt: now,
    updatedAt: now,
  }

  // 저장
  const demands = loadAllDemands()
  demands.push(demand)
  saveAllDemands(demands)

  // 활성 세션으로 설정
  saveActiveDemandId(params.serviceType, demand.demandId)

  return demand
}

/**
 * 수요 세션 조회 (ID)
 */
export function getDemandById(demandId: string): DemandSession | undefined {
  const demands = loadAllDemands()
  return demands.find(d => d.demandId === demandId)
}

/**
 * 현재 탭의 활성 수요 세션 로드 (없으면 생성)
 */
export function loadOrCreateActiveDemand(serviceType: ServiceType): DemandSession {
  const activeDemandId = loadActiveDemandId(serviceType)

  if (activeDemandId) {
    const demand = getDemandById(activeDemandId)
    if (demand) return demand
  }

  // 활성 세션이 없으면 새로 생성
  return createDemand({ serviceType })
}

/**
 * 현재 활성 수요 세션 로드 (없으면 null)
 */
export function getActiveDemand(serviceType: ServiceType): DemandSession | null {
  const activeDemandId = loadActiveDemandId(serviceType)
  if (!activeDemandId) return null

  return getDemandById(activeDemandId) || null
}

/**
 * 수요 세션 업데이트
 */
export function updateDemand(
  demandId: string,
  updates: Partial<Omit<DemandSession, 'demandId' | 'ownerId' | 'createdAt'>>
): DemandSession | undefined {
  const demands = loadAllDemands()
  const index = demands.findIndex(d => d.demandId === demandId)

  if (index === -1) return undefined

  const demand = demands[index]
  demands[index] = {
    ...demand,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveAllDemands(demands)
  return demands[index]
}

/**
 * 수요 세션에 화물 추가
 */
export function addCargoToDemand(demandId: string, cargoId: string): DemandSession | undefined {
  const demand = getDemandById(demandId)
  if (!demand) return undefined

  if (!demand.cargoIds.includes(cargoId)) {
    demand.cargoIds.push(cargoId)
    demand.quantitiesByCargoId[cargoId] = 1  // 기본 수량 1
    return updateDemand(demandId, {
      cargoIds: demand.cargoIds,
      quantitiesByCargoId: demand.quantitiesByCargoId,
    })
  }

  return demand
}

/**
 * 수요 세션에서 화물 제거
 */
export function removeCargoFromDemand(demandId: string, cargoId: string): DemandSession | undefined {
  const demand = getDemandById(demandId)
  if (!demand) return undefined

  demand.cargoIds = demand.cargoIds.filter(id => id !== cargoId)
  delete demand.quantitiesByCargoId[cargoId]
  if (demand.cubeResultByCargoId) {
    delete demand.cubeResultByCargoId[cargoId]
  }

  return updateDemand(demandId, {
    cargoIds: demand.cargoIds,
    quantitiesByCargoId: demand.quantitiesByCargoId,
    cubeResultByCargoId: demand.cubeResultByCargoId,
  })
}

/**
 * 물량 설정 및 큐브 계산 결과 저장
 */
export function setQuantitiesAndCubes(
  demandId: string,
  params: {
    quantitiesByCargoId: Record<string, number>
    cubeResultByCargoId: Record<string, { mode: 'STORAGE' | 'ROUTE'; cubes: number }>
    totalCubes: number
    totalPallets?: number
    packingFactor: number
  }
): DemandSession | undefined {
  const demand = getDemandById(demandId)
  if (!demand) return undefined

  // 이벤트 로깅
  logQuantitySet(demandId, params.quantitiesByCargoId)
  logCubeCalculated(
    demandId,
    params.totalPallets !== undefined ? 'STORAGE' : 'ROUTE',
    params.totalCubes,
    params.packingFactor
  )
  logResourceReady(demandId, params.totalCubes, params.totalPallets)

  return updateDemand(demandId, {
    quantitiesByCargoId: params.quantitiesByCargoId,
    cubeResultByCargoId: params.cubeResultByCargoId,
    totalCubes: params.totalCubes,
    totalPallets: params.totalPallets,
    status: 'RESOURCE_READY',
  })
}

/**
 * 보관 조건 설정
 */
export function setStorageCondition(
  demandId: string,
  condition: StorageCondition
): DemandSession | undefined {
  const demand = getDemandById(demandId)
  if (!demand) return undefined

  // 이벤트 로깅
  if (condition.location) {
    logStorageLocationSet(demandId, condition.location)
  }
  if (condition.startDate && condition.endDate) {
    logStoragePeriodSet(demandId, condition.startDate, condition.endDate)
  }

  return updateDemand(demandId, {
    storageCondition: { ...demand.storageCondition, ...condition },
  })
}

/**
 * 운송 조건 설정
 */
export function setTransportCondition(
  demandId: string,
  condition: TransportCondition
): DemandSession | undefined {
  const demand = getDemandById(demandId)
  if (!demand) return undefined

  // 이벤트 로깅
  if (condition.origin) {
    logTransportOriginSet(demandId, condition.origin)
  }
  if (condition.destination) {
    logTransportDestinationSet(demandId, condition.destination)
  }
  if (condition.transportDate) {
    logTransportDateSet(demandId, condition.transportDate)
  }

  return updateDemand(demandId, {
    transportCondition: { ...demand.transportCondition, ...condition },
  })
}

/**
 * 상태 업데이트
 */
export function setDemandStatus(demandId: string, status: DemandStatus): DemandSession | undefined {
  // RULES_PASSED 이벤트 로깅
  if (status === 'RULES_PASSED') {
    logRulesPassed(demandId)
  }

  return updateDemand(demandId, { status })
}

/**
 * 검색 실행 기록
 */
export function recordSearchExecution(demandId: string, resultCount: number): DemandSession | undefined {
  logSearchExecuted(demandId, resultCount)

  return updateDemand(demandId, { status: 'SEARCHED' })
}

/**
 * 수요 세션 삭제
 */
export function removeDemand(demandId: string): boolean {
  const demands = loadAllDemands()
  const index = demands.findIndex(d => d.demandId === demandId)

  if (index === -1) return false

  demands.splice(index, 1)
  saveAllDemands(demands)

  return true
}

/**
 * 모든 수요 세션 삭제 (개발용)
 */
export function clearAllDemands(): void {
  localStorage.removeItem(STORAGE_KEYS.DEMANDS)
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_DEMAND_STORAGE)
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_DEMAND_ROUTE)
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_DEMAND_BOTH)
}

/**
 * 활성 수요 세션 초기화 (새 세션 시작)
 */
export function resetActiveDemand(serviceType: ServiceType): DemandSession {
  // 기존 활성 세션 ID 제거
  const key = getActiveDemandKey(serviceType)
  localStorage.removeItem(key)

  // 새 세션 생성
  return createDemand({ serviceType })
}
