/**
 * PR7: Deal Store
 *
 * 거래 신청 데이터 관리
 * localStorage 기반 CRUD
 */

import type { Deal, DealStatus } from '../types/models'
import { STORAGE_KEYS } from './storageKeys'
import { makeDealId } from './id'
import { logEvent } from './eventLog'

// MVP 기본 소유자 ID
const DEFAULT_USER_ID = 'demo-user'

/**
 * 모든 거래 로드
 */
function loadAllDeals(): Deal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEALS)
    if (!raw) return []
    return JSON.parse(raw) as Deal[]
  } catch {
    console.error('[DealStore] Failed to load deals')
    return []
  }
}

/**
 * 거래 저장
 */
function saveAllDeals(deals: Deal[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals))
  } catch (error) {
    console.error('[DealStore] Failed to save deals:', error)
  }
}

/**
 * 거래 생성 파라미터
 */
export interface CreateDealParams {
  demandId: string
  userId?: string
  selectedStorageId?: string
  selectedRouteId?: string
  pickupRequested?: boolean
  pickupLocation?: string
  dropoffLocation?: string
  baseCost?: number
  cubeCost?: number
  weightCost?: number
  optionsCost?: number
  totalCost?: number
  // PR7 정산 breakdown
  volumeCubes?: number
  weightCubes?: number
  billableCubes?: number
  unitPricePerCube?: number
  weightSurchargeApplied?: boolean
}

/**
 * 거래 생성 및 저장
 */
export function createDeal(params: CreateDealParams): Deal {
  const {
    demandId,
    userId = DEFAULT_USER_ID,
    selectedStorageId,
    selectedRouteId,
    pickupRequested = false,
    pickupLocation,
    dropoffLocation,
    baseCost = 0,
    cubeCost = 0,
    weightCost = 0,
    optionsCost = 0,
    totalCost = 0,
    volumeCubes,
    weightCubes,
    billableCubes,
    unitPricePerCube,
    weightSurchargeApplied,
  } = params

  const now = new Date().toISOString()

  const deal: Deal = {
    id: makeDealId(),
    demandId,
    userId,
    selectedStorageId,
    selectedRouteId,
    pickupRequested,
    pickupLocation,
    dropoffLocation,
    options: [], // MVP: 빈 배열
    baseCost,
    cubeCost,
    weightCost,
    optionsCost,
    totalCost,
    // PR7 정산 breakdown
    volumeCubes,
    weightCubes,
    billableCubes,
    unitPricePerCube,
    weightSurchargeApplied,
    contractAgreed: false,
    status: 'DRAFT',
    createdAt: now,
    updatedAt: now,
  }

  const deals = loadAllDeals()
  deals.push(deal)
  saveAllDeals(deals)

  // 이벤트 로그
  logEvent({
    eventType: 'DEAL_CREATED',
    subject: { kind: 'deal', id: deal.id },
    fields: {
      demandId,
      selectedStorageId,
      selectedRouteId,
      totalCost,
    },
  })

  return deal
}

/**
 * 거래 조회 (ID로)
 */
export function getDealById(id: string): Deal | null {
  const deals = loadAllDeals()
  return deals.find(d => d.id === id) || null
}

/**
 * 수요 세션별 거래 목록 조회
 */
export function getDealsByDemandId(demandId: string): Deal[] {
  const deals = loadAllDeals()
  return deals.filter(d => d.demandId === demandId)
}

/**
 * 사용자별 거래 목록 조회
 */
export function getDealsByUserId(userId: string): Deal[] {
  const deals = loadAllDeals()
  return deals.filter(d => d.userId === userId)
}

/**
 * 거래 상태 업데이트
 */
export function updateDealStatus(id: string, status: DealStatus): Deal | null {
  const deals = loadAllDeals()
  const index = deals.findIndex(d => d.id === id)

  if (index === -1) {
    console.error(`[DealStore] Deal not found: ${id}`)
    return null
  }

  const deal = deals[index]
  deal.status = status
  deal.updatedAt = new Date().toISOString()

  saveAllDeals(deals)

  // 이벤트 로그
  if (status === 'SUBMITTED') {
    logEvent({
      eventType: 'DEAL_SUBMITTED',
      subject: { kind: 'deal', id },
      fields: { status },
    })
  } else if (status === 'CONFIRMED') {
    logEvent({
      eventType: 'DEAL_CONFIRMED',
      subject: { kind: 'deal', id },
      fields: { status },
    })
  } else if (status === 'CANCELLED') {
    logEvent({
      eventType: 'DEAL_CANCELLED',
      subject: { kind: 'deal', id },
      fields: { status },
    })
  }

  return deal
}

/**
 * 거래 계약 동의 처리
 */
export function agreeToDealContract(id: string): Deal | null {
  const deals = loadAllDeals()
  const index = deals.findIndex(d => d.id === id)

  if (index === -1) {
    console.error(`[DealStore] Deal not found: ${id}`)
    return null
  }

  const deal = deals[index]
  deal.contractAgreed = true
  deal.contractAgreedAt = new Date().toISOString()
  deal.updatedAt = deal.contractAgreedAt

  saveAllDeals(deals)

  return deal
}

/**
 * 거래 업데이트 (부분 업데이트)
 */
export function updateDeal(id: string, updates: Partial<Deal>): Deal | null {
  const deals = loadAllDeals()
  const index = deals.findIndex(d => d.id === id)

  if (index === -1) {
    console.error(`[DealStore] Deal not found: ${id}`)
    return null
  }

  const deal = deals[index]
  Object.assign(deal, updates, { updatedAt: new Date().toISOString() })

  saveAllDeals(deals)

  return deal
}

/**
 * 거래 삭제
 */
export function deleteDeal(id: string): boolean {
  const deals = loadAllDeals()
  const filtered = deals.filter(d => d.id !== id)

  if (filtered.length === deals.length) {
    console.error(`[DealStore] Deal not found: ${id}`)
    return false
  }

  saveAllDeals(filtered)
  return true
}

/**
 * 모든 거래 조회
 */
export function getAllDeals(): Deal[] {
  return loadAllDeals()
}
