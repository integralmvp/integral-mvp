/**
 * PR7: 자원 할당 및 재고 차감
 *
 * 거래 확정 시 remainingCubes/remainingPayloadKg 차감
 * MVP: 메모리상 mockData 업데이트 (실제 DB는 추후)
 */

import type { StorageProduct, RouteProduct } from '../../../types/models'
import { STORAGE_PRODUCTS, ROUTE_PRODUCTS } from '../../../data/mock/mockData'

/**
 * 자원 할당 파라미터
 */
export interface AllocateResourceParams {
  offerId: string
  offerType: 'storage' | 'route'
  billableCubes: number
  totalWeightKg: number
}

/**
 * 자원 할당 결과
 */
export interface AllocateResourceResult {
  success: boolean
  message?: string
  updatedOffer?: StorageProduct | RouteProduct
}

/**
 * allocateResource
 *
 * 거래 확정 시 자원(큐브/하중) 차감
 * MVP: mockData 업데이트 (메모리상)
 *
 * @param params - 자원 할당 파라미터
 * @returns AllocateResourceResult
 */
export function allocateResource(params: AllocateResourceParams): AllocateResourceResult {
  const { offerId, offerType, billableCubes, totalWeightKg } = params

  // 상품 찾기
  const offers = offerType === 'storage' ? STORAGE_PRODUCTS : ROUTE_PRODUCTS
  const offer = offers.find(o => o.id === offerId)

  if (!offer) {
    return {
      success: false,
      message: `상품을 찾을 수 없습니다: ${offerId}`,
    }
  }

  // 자원 체크 (방어)
  if (offer.remainingCubes < billableCubes) {
    return {
      success: false,
      message: `큐브 재고 부족 (필요: ${billableCubes}, 남음: ${offer.remainingCubes})`,
    }
  }

  if (offer.remainingPayloadKg !== undefined && offer.remainingPayloadKg < totalWeightKg) {
    return {
      success: false,
      message: `하중 재고 부족 (필요: ${totalWeightKg}kg, 남음: ${offer.remainingPayloadKg}kg)`,
    }
  }

  // 재고 차감
  offer.remainingCubes -= billableCubes

  if (offer.remainingPayloadKg !== undefined) {
    offer.remainingPayloadKg -= totalWeightKg
  }

  return {
    success: true,
    message: `자원 할당 완료 (큐브: ${billableCubes}, 중량: ${totalWeightKg}kg)`,
    updatedOffer: offer,
  }
}

/**
 * releaseResource
 *
 * 거래 취소 시 자원 복원
 * MVP: mockData 업데이트 (메모리상)
 *
 * @param params - 자원 할당 파라미터
 * @returns AllocateResourceResult
 */
export function releaseResource(params: AllocateResourceParams): AllocateResourceResult {
  const { offerId, offerType, billableCubes, totalWeightKg } = params

  // 상품 찾기
  const offers = offerType === 'storage' ? STORAGE_PRODUCTS : ROUTE_PRODUCTS
  const offer = offers.find(o => o.id === offerId)

  if (!offer) {
    return {
      success: false,
      message: `상품을 찾을 수 없습니다: ${offerId}`,
    }
  }

  // 재고 복원
  offer.remainingCubes = Math.min(
    offer.remainingCubes + billableCubes,
    offer.capacityCubes
  )

  if (offer.remainingPayloadKg !== undefined && offer.payloadCapacityKg !== undefined) {
    offer.remainingPayloadKg = Math.min(
      offer.remainingPayloadKg + totalWeightKg,
      offer.payloadCapacityKg
    )
  }

  return {
    success: true,
    message: `자원 복원 완료 (큐브: ${billableCubes}, 중량: ${totalWeightKg}kg)`,
    updatedOffer: offer,
  }
}
