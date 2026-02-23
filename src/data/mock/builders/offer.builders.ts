/**
 * Offer Builders
 * InfoOfferRecord → StorageProduct / RouteProduct UI DTO 변환
 *
 * 원칙:
 * - 레코드 fields.providerId로 providerById 맵에서 ProviderInfo 주입
 * - 좌표는 REGION_REPRESENTATIVE_COORDS에서 조회 (레코드에 저장 안 함)
 * - locationCoordsKey/originCoordsKey/destinationCoordsKey → 명시적 좌표 조회
 * - 없으면 regionCode/originCode/destinationCode 폴백
 */

import type { InfoOfferRecord } from '../../../infra/dataspec/fields/info/offer.fields'
import type { StorageProduct, RouteProduct, StorageType, RouteScope, Direction, TripType } from '../../../types/domain/offer'
import type { ProviderInfo } from '../../../types/domain/provider'
import type { FeatureCode } from '../../../infra/dataspec/codedata/features/featureCodes'
import type { ModuleClassification, CargoType } from '../../../types/domain/cargo'
import { getCoordsByCode } from '../../../infra/dataspec/codedata/regions/regionRepresentativeCoords'

/**
 * StorageProduct 빌드
 * @throws 좌표 조회 실패 또는 provider 미존재 시
 */
export function buildStorageProductFromRecord(
  record: InfoOfferRecord,
  providerById: Map<string, ProviderInfo>
): StorageProduct {
  const f = record.fields
  if (f.offerType !== 'STORAGE') {
    throw new Error(`[Builder] offer ${record.id} is not STORAGE type`)
  }

  const provider = providerById.get(f.providerId)
  if (!provider) {
    throw new Error(`[Builder] Provider not found: ${f.providerId} (offer: ${record.id})`)
  }

  const coordsKey = f.locationCoordsKey ?? f.regionCode!
  const coords = getCoordsByCode(coordsKey)
  if (!coords) {
    throw new Error(`[Builder] Coords not found for key: ${coordsKey} (offer: ${record.id})`)
  }

  return {
    id: record.id,
    signature: record.signature,
    location: {
      name: f.locationName!,
      lat: coords.lat,
      lng: coords.lng,
      region: f.locationRegion!,
      regionCode: f.regionCode!,
    },
    storageType: f.storageType as StorageType,
    capacity: f.capacityText!,
    features: (f.features ?? []) as FeatureCode[],
    regulationStatus: { allowed: true },
    // 규정 필드
    allowedItemCodes: f.allowedItemCodes,
    maxWeightKg: f.maxWeightKg,
    maxSumCm: f.maxSumCm,
    minCubes: f.minCubes,
    tempSupported: f.tempSupported,
    hazmatSupported: f.hazmatSupported,
    allowedModuleClasses: f.allowedModuleClasses as ModuleClassification[] | undefined,
    // SoT 필드
    capacityCubes: f.capacityCubes,
    remainingCubes: f.remainingCubes,
    unitPricePerCube: f.unitPricePerCube,
    maxKgPerCube: f.maxKgPerCube,
    payloadCapacityKg: f.payloadCapacityKg,
    remainingPayloadKg: f.remainingPayloadKg,
    // 업체
    provider,
  }
}

/**
 * RouteProduct 빌드
 * @throws 좌표 조회 실패 또는 provider 미존재 시
 */
export function buildRouteProductFromRecord(
  record: InfoOfferRecord,
  providerById: Map<string, ProviderInfo>
): RouteProduct {
  const f = record.fields
  if (f.offerType !== 'ROUTE') {
    throw new Error(`[Builder] offer ${record.id} is not ROUTE type`)
  }

  const provider = providerById.get(f.providerId)
  if (!provider) {
    throw new Error(`[Builder] Provider not found: ${f.providerId} (offer: ${record.id})`)
  }

  // 출발지 좌표: 명시적 key 우선, 없으면 originCode (빈 문자열이면 안 됨)
  const originKey = f.originCoordsKey ?? (f.originCode || null)
  const originCoords = originKey ? getCoordsByCode(originKey) : undefined
  if (!originCoords) {
    throw new Error(`[Builder] Origin coords not found (key: ${originKey}, offer: ${record.id})`)
  }

  // 도착지 좌표: 명시적 key 우선, 없으면 destinationCode
  const destKey = f.destinationCoordsKey ?? (f.destinationCode || null)
  const destCoords = destKey ? getCoordsByCode(destKey) : undefined
  if (!destCoords) {
    throw new Error(`[Builder] Destination coords not found (key: ${destKey}, offer: ${record.id})`)
  }

  return {
    id: record.id,
    signature: record.signature,
    origin: {
      name: f.originName!,
      lat: originCoords.lat,
      lng: originCoords.lng,
    },
    destination: {
      name: f.destinationName!,
      lat: destCoords.lat,
      lng: destCoords.lng,
    },
    originCode: f.originCode ?? '',
    destinationCode: f.destinationCode ?? '',
    schedule: f.schedule!,
    capacity: f.vehicleCapacityText!,
    vehicleType: f.vehicleType!,
    cargoTypes: (f.cargoTypes ?? []) as CargoType[],
    regulationStatus: { allowed: true },
    routeScope: f.routeScope as RouteScope,
    direction: f.direction as Direction | undefined,
    tripType: f.tripType as TripType | undefined,
    // 규정 필드
    allowedItemCodes: f.allowedItemCodes,
    maxWeightKg: f.maxWeightKg,
    maxSumCm: f.maxSumCm,
    minCubes: f.minCubes,
    tempSupported: f.tempSupported,
    hazmatSupported: f.hazmatSupported,
    allowedModuleClasses: f.allowedModuleClasses as ModuleClassification[] | undefined,
    // SoT 필드
    capacityCubes: f.capacityCubes,
    remainingCubes: f.remainingCubes,
    unitPricePerCube: f.unitPricePerCube,
    maxKgPerCube: f.maxKgPerCube,
    payloadCapacityKg: f.payloadCapacityKg,
    remainingPayloadKg: f.remainingPayloadKg,
    // 업체
    provider,
  }
}
