/**
 * Offer Repository — localStorage 기반 구현
 *
 * 설계:
 * - 최초 로드 시 localStorage 없으면 OFFER_RECORDS → builders → seed 저장
 * - 이후 모든 조회/변경은 in-memory 캐시(= localStorage 동기화) 기반
 * - updateStorageOfferResource / updateRouteOfferResource 는 캐시 객체를 직접 변경 후 localStorage 동기화
 *   → 동일 참조를 반환하므로 매칭 파이프라인의 useMemo도 최신 remainingCubes를 읽음
 *
 * G4: 저장/조회가 localStorage 기반
 * G5: buildSeedOffers() 내부에서 seed 검증 실행 (throw 가능)
 * G6: 새로고침 후 remainingCubes/remainingPayloadKg 유지
 */

import type { StorageProduct, RouteProduct } from '../../../types/models'
import { STORAGE_KEYS } from '../keys'
import { buildSeedOffers } from '../../../data/mock/builders'

// ── in-memory 캐시 (단일 진실 소스) ────────────────────────────────
let _storageCache: StorageProduct[] | null = null
let _routeCache: RouteProduct[] | null = null

// ── 초기화 ──────────────────────────────────────────────────────────

function initIfNeeded(): void {
  if (_storageCache !== null && _routeCache !== null) return

  const storedStorage = localStorage.getItem(STORAGE_KEYS.STORAGE_OFFERS)
  const storedRoute = localStorage.getItem(STORAGE_KEYS.ROUTE_OFFERS)

  if (storedStorage && storedRoute) {
    // localStorage 에서 로드 (G6: 새로고침 후 remaining 유지)
    try {
      _storageCache = JSON.parse(storedStorage) as StorageProduct[]
      _routeCache = JSON.parse(storedRoute) as RouteProduct[]
      return
    } catch {
      console.warn('[offer.repo] localStorage parse error, re-seeding...')
    }
  }

  // 최초 seed (G5: buildSeedOffers 내부에서 validateOfferSeed 실행)
  const { storageProducts, routeProducts } = buildSeedOffers()
  _storageCache = storageProducts
  _routeCache = routeProducts
  _persistStorage()
  _persistRoute()
}

function _persistStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STORAGE_OFFERS, JSON.stringify(_storageCache))
  } catch (e) {
    console.error('[offer.repo] Failed to persist storage offers:', e)
  }
}

function _persistRoute(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTE_OFFERS, JSON.stringify(_routeCache))
  } catch (e) {
    console.error('[offer.repo] Failed to persist route offers:', e)
  }
}

// ── 조회 ────────────────────────────────────────────────────────────

export function getAllStorageOffers(): StorageProduct[] {
  initIfNeeded()
  return _storageCache!
}

export function getAllRouteOffers(): RouteProduct[] {
  initIfNeeded()
  return _routeCache!
}

export function getStorageOfferById(id: string): StorageProduct | undefined {
  initIfNeeded()
  return _storageCache!.find(o => o.id === id)
}

export function getRouteOfferById(id: string): RouteProduct | undefined {
  initIfNeeded()
  return _routeCache!.find(o => o.id === id)
}

export function getOfferById(id: string): StorageProduct | RouteProduct | undefined {
  return getStorageOfferById(id) ?? getRouteOfferById(id)
}

// ── 자원 업데이트 ────────────────────────────────────────────────────

/**
 * 보관 상품 자원 업데이트 (remainingCubes, remainingPayloadKg)
 * 캐시 객체를 in-place 수정 후 localStorage 동기화
 */
export function updateStorageOfferResource(
  id: string,
  updates: Pick<StorageProduct, 'remainingCubes'> & { remainingPayloadKg?: number }
): StorageProduct | undefined {
  const offer = getStorageOfferById(id)
  if (!offer) return undefined

  offer.remainingCubes = updates.remainingCubes
  if (updates.remainingPayloadKg !== undefined) {
    offer.remainingPayloadKg = updates.remainingPayloadKg
  }
  _persistStorage()

  return offer
}

/**
 * 운송 상품 자원 업데이트
 */
export function updateRouteOfferResource(
  id: string,
  updates: Pick<RouteProduct, 'remainingCubes'> & { remainingPayloadKg?: number }
): RouteProduct | undefined {
  const offer = getRouteOfferById(id)
  if (!offer) return undefined

  offer.remainingCubes = updates.remainingCubes
  if (updates.remainingPayloadKg !== undefined) {
    offer.remainingPayloadKg = updates.remainingPayloadKg
  }
  _persistRoute()

  return offer
}
