/**
 * Mock Builders
 * CDS 레코드 → UI DTO 변환 진입점
 *
 * 역할:
 * - buildSeedProviders(): PROVIDER_RECORDS → ProviderInfo[]
 * - buildSeedOffers(): OFFER_RECORDS → { storageProducts, routeProducts }
 * - assertOfferSoT(): SoT 필드 최소 검증 (seed 깨짐 조기 발견)
 *
 * 변환 원칙:
 * - unitPricePerCube / capacityCubes / remainingCubes 는 SoT (UI DTO 그대로 보존)
 * - price(total) 파생 필드는 생성하지 않음
 */

import type { StorageProduct, RouteProduct } from '../../../types/models'
import type { ProviderInfo } from '../../../types/domain/provider'
import { PROVIDER_RECORDS } from '../records/providers'
import { OFFER_RECORDS } from '../records/offers'
import { buildProviderInfoFromRecord } from './provider.builders'
import { buildStorageProductFromRecord, buildRouteProductFromRecord } from './offer.builders'

export type { StorageProduct, RouteProduct }

// ============ Provider Seed ============

/**
 * PROVIDER_RECORDS → ProviderInfo[]
 */
export function buildSeedProviders(): ProviderInfo[] {
  return PROVIDER_RECORDS.map(buildProviderInfoFromRecord)
}

// ============ Offer Seed ============

/**
 * OFFER_RECORDS → { storageProducts, routeProducts }
 *
 * 1. PROVIDER_RECORDS → providerById Map 구성
 * 2. seed 최소 검증 (invariant 파괴 시 throw)
 * 3. 타입별 분기 → builder로 DTO 생성
 */
export function buildSeedOffers(): {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
} {
  // 1. providerById 맵 구성
  const providerById = new Map<string, ProviderInfo>(
    PROVIDER_RECORDS.map(r => [r.id, buildProviderInfoFromRecord(r)])
  )

  const storageProducts: StorageProduct[] = []
  const routeProducts: RouteProduct[] = []

  for (const record of OFFER_RECORDS) {
    // 2. seed 최소 검증
    validateOfferSeed(record, providerById)

    // 3. 타입별 빌더 호출
    if (record.fields.offerType === 'STORAGE') {
      storageProducts.push(buildStorageProductFromRecord(record, providerById))
    } else {
      routeProducts.push(buildRouteProductFromRecord(record, providerById))
    }
  }

  return { storageProducts, routeProducts }
}

// ============ Seed 최소 검증 ============

/**
 * Seed 정합성 체크 — 불변 조건 위반 시 앱 시작 전 throw
 *
 * 검사 항목:
 * - id/signature 존재
 * - capacityCubes > 0
 * - remainingCubes <= capacityCubes
 * - unitPricePerCube > 0
 * - maxKgPerCube > 0
 * - payloadCapacityKg === capacityCubes * maxKgPerCube (정확히 일치)
 * - remainingPayloadKg <= payloadCapacityKg
 * - offerType별 필수 필드 존재
 * - providerId가 providerById에 존재
 */
function validateOfferSeed(
  record: (typeof OFFER_RECORDS)[0],
  providerById: Map<string, ProviderInfo>
): void {
  const { id, signature, fields: f } = record
  const ctx = `[Seed] offer ${id}`

  if (!id) throw new Error(`${ctx}: id is missing`)
  if (signature !== 'INFO_OFFER') throw new Error(`${ctx}: invalid signature`)

  if (f.capacityCubes <= 0) throw new Error(`${ctx}: capacityCubes must be > 0`)
  if (f.remainingCubes < 0 || f.remainingCubes > f.capacityCubes) {
    throw new Error(`${ctx}: remainingCubes(${f.remainingCubes}) out of range [0, ${f.capacityCubes}]`)
  }
  if (f.unitPricePerCube <= 0) throw new Error(`${ctx}: unitPricePerCube must be > 0`)
  if (f.maxKgPerCube <= 0) throw new Error(`${ctx}: maxKgPerCube must be > 0`)

  const expectedPayload = f.capacityCubes * f.maxKgPerCube
  if (f.payloadCapacityKg !== expectedPayload) {
    throw new Error(
      `${ctx}: payloadCapacityKg(${f.payloadCapacityKg}) !== capacityCubes*maxKgPerCube(${expectedPayload})`
    )
  }
  if (f.remainingPayloadKg < 0 || f.remainingPayloadKg > f.payloadCapacityKg) {
    throw new Error(
      `${ctx}: remainingPayloadKg(${f.remainingPayloadKg}) out of range [0, ${f.payloadCapacityKg}]`
    )
  }

  if (!providerById.has(f.providerId)) {
    throw new Error(`${ctx}: providerId '${f.providerId}' not found in PROVIDER_RECORDS`)
  }

  if (f.offerType === 'STORAGE') {
    if (!f.regionCode) throw new Error(`${ctx}: STORAGE requires regionCode`)
    if (!f.locationName) throw new Error(`${ctx}: STORAGE requires locationName`)
    if (!f.storageType) throw new Error(`${ctx}: STORAGE requires storageType`)
    if (!f.capacityText) throw new Error(`${ctx}: STORAGE requires capacityText`)
  } else {
    if (f.originName === undefined) throw new Error(`${ctx}: ROUTE requires originName`)
    if (f.destinationName === undefined) throw new Error(`${ctx}: ROUTE requires destinationName`)
    if (!f.routeScope) throw new Error(`${ctx}: ROUTE requires routeScope`)
    if (!f.schedule) throw new Error(`${ctx}: ROUTE requires schedule`)
  }
}

/**
 * SoT 필드 최소 검증 헬퍼 (외부 사용 허용)
 * unitPricePerCube / capacityCubes 가 SoT인지 확인
 */
export function assertOfferSoT(offer: { unitPricePerCube: number; capacityCubes: number }): void {
  if (!offer.unitPricePerCube || !offer.capacityCubes) {
    throw new Error('[CDS] Offer must have unitPricePerCube and capacityCubes (SoT fields)')
  }
}
