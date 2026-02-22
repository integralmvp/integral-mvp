/**
 * PR7: 자원 할당 및 재고 차감
 *
 * 거래 확정 시 remainingCubes/remainingPayloadKg 차감
 * MVP: 메모리상 mockData 업데이트 (실제 DB는 추후)
 */

import type { StorageProduct, RouteProduct } from '../../../types/models'
import {
  getStorageOfferById,
  getRouteOfferById,
  updateStorageOfferResource,
  updateRouteOfferResource,
} from '../../../infra/storage/info/offer.repo'

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

  // 상품 찾기 (repo 경유)
  const offer = offerType === 'storage'
    ? getStorageOfferById(offerId)
    : getRouteOfferById(offerId)

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

  // 재고 차감 (repo 경유)
  const newRemainingCubes = offer.remainingCubes - billableCubes
  const newRemainingPayloadKg = offer.remainingPayloadKg !== undefined
    ? offer.remainingPayloadKg - totalWeightKg
    : undefined

  const updatedOffer = offerType === 'storage'
    ? updateStorageOfferResource(offerId, { remainingCubes: newRemainingCubes, remainingPayloadKg: newRemainingPayloadKg })
    : updateRouteOfferResource(offerId, { remainingCubes: newRemainingCubes, remainingPayloadKg: newRemainingPayloadKg })

  return {
    success: true,
    message: `자원 할당 완료 (큐브: ${billableCubes}, 중량: ${totalWeightKg}kg)`,
    updatedOffer: updatedOffer as StorageProduct | RouteProduct,
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

  // 상품 찾기 (repo 경유)
  const offer = offerType === 'storage'
    ? getStorageOfferById(offerId)
    : getRouteOfferById(offerId)

  if (!offer) {
    return {
      success: false,
      message: `상품을 찾을 수 없습니다: ${offerId}`,
    }
  }

  // 재고 복원 (repo 경유, 상한 클리핑)
  const newRemainingCubes = Math.min(offer.remainingCubes + billableCubes, offer.capacityCubes)
  const newRemainingPayloadKg = (offer.remainingPayloadKg !== undefined && offer.payloadCapacityKg !== undefined)
    ? Math.min(offer.remainingPayloadKg + totalWeightKg, offer.payloadCapacityKg)
    : undefined

  const updatedOffer = offerType === 'storage'
    ? updateStorageOfferResource(offerId, { remainingCubes: newRemainingCubes, remainingPayloadKg: newRemainingPayloadKg })
    : updateRouteOfferResource(offerId, { remainingCubes: newRemainingCubes, remainingPayloadKg: newRemainingPayloadKg })

  return {
    success: true,
    message: `자원 복원 완료 (큐브: ${billableCubes}, 중량: ${totalWeightKg}kg)`,
    updatedOffer: updatedOffer as StorageProduct | RouteProduct,
  }
}
