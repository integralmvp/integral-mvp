/**
 * Offer Repository - mock 기반 구현
 *
 * MVP: STORAGE_PRODUCTS / ROUTE_PRODUCTS 배열을 단일 접근점으로 래핑
 * 메모리상 mutable 상태 유지 (remainingCubes 차감 등)
 * PR8+ (DB 연동) 이후 저장소 구체화
 */

import type { StorageProduct, RouteProduct } from '../../../types/models'
import { STORAGE_PRODUCTS, ROUTE_PRODUCTS } from '../../../data/mock/mockData'

/**
 * 보관 상품 전체 조회
 */
export function getAllStorageOffers(): StorageProduct[] {
  return STORAGE_PRODUCTS
}

/**
 * 운송 상품 전체 조회
 */
export function getAllRouteOffers(): RouteProduct[] {
  return ROUTE_PRODUCTS
}

/**
 * 보관 상품 단건 조회
 */
export function getStorageOfferById(id: string): StorageProduct | undefined {
  return STORAGE_PRODUCTS.find(o => o.id === id)
}

/**
 * 운송 상품 단건 조회
 */
export function getRouteOfferById(id: string): RouteProduct | undefined {
  return ROUTE_PRODUCTS.find(o => o.id === id)
}

/**
 * 상품 단건 조회 (타입 불문)
 */
export function getOfferById(id: string): StorageProduct | RouteProduct | undefined {
  return getStorageOfferById(id) ?? getRouteOfferById(id)
}

/**
 * 보관 상품 자원 업데이트 (remainingCubes, remainingPayloadKg)
 * MVP: 메모리상 직접 변경 (배열은 참조 타입)
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

  return offer
}
