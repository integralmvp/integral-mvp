// ============================================
// INTEGRAL MVP - 단위 변환 유틸리티
// ============================================
// Cube ↔ Pallet 변환
// Phase 1: 엔진 빌드

import { CUBES_PER_PALLET, PALLET_SPEC, CUBE_SPEC, REFERENCE_WAREHOUSE, REFERENCE_TRUCK, STORAGE_AREA_CONSTANTS } from './cubeConfig'

/**
 * 큐브를 파렛트로 변환
 * @param cubes 큐브 수
 * @returns 파렛트 수 (정수, ceil)
 */
export function cubesToPallets(cubes: number): number {
  if (cubes <= 0) return 0
  return Math.ceil(cubes / CUBES_PER_PALLET)
}

/**
 * 파렛트를 큐브로 변환
 * @param pallets 파렛트 수
 * @returns 큐브 수 (정수)
 */
export function palletsToCubes(pallets: number): number {
  if (pallets <= 0) return 0
  return pallets * CUBES_PER_PALLET
}

/**
 * 면적(㎡)을 파렛트로 변환
 * @param areaM2 면적 (㎡)
 * @returns 파렛트 수 (정수, ceil)
 */
export function areaTopallets(areaM2: number): number {
  if (areaM2 <= 0) return 0
  // 1 파렛트 = 1.21 ㎡ (1.1m × 1.1m)
  return Math.ceil(areaM2 / PALLET_SPEC.baseAreaM2)
}

/**
 * 면적(㎡)을 큐브로 변환 (면적 → 파렛트 → 큐브)
 * @param areaM2 면적 (㎡)
 * @returns 큐브 수 (정수)
 */
export function areaToCubes(areaM2: number): number {
  const pallets = areaTopallets(areaM2)
  return palletsToCubes(pallets)
}

// ============ Storage 전용: 운영계수 보정 환산 ============

/**
 * 파레트 → 면적(㎡) 환산 (Storage 전용, 운영계수 적용)
 * requiredAreaM2 = pallets × palletFootprintM2 × storageAreaFactor
 * @param pallets 파레트 수
 * @returns 필요 면적 (㎡, 소수점 2자리)
 */
export function palletsToAreaM2(pallets: number): number {
  if (pallets <= 0) return 0
  const { palletFootprintM2, storageAreaFactor } = STORAGE_AREA_CONSTANTS
  const requiredAreaM2 = pallets * palletFootprintM2 * storageAreaFactor
  return parseFloat(requiredAreaM2.toFixed(2))
}

/**
 * 파레트 → 면적(평) 환산 (Storage 전용, 운영계수 적용)
 * requiredAreaPyeong = requiredAreaM2 / m2PerPyeong
 * @param pallets 파레트 수
 * @returns 필요 면적 (평, 소수점 2자리)
 */
export function palletsToAreaPyeong(pallets: number): number {
  if (pallets <= 0) return 0
  const areaM2 = palletsToAreaM2(pallets)
  const areaPyeong = areaM2 / STORAGE_AREA_CONSTANTS.m2PerPyeong
  return parseFloat(areaPyeong.toFixed(2))
}

/**
 * 면적(㎡) → 파레트 환산 (Storage 전용, 운영계수 역보정)
 * effectiveAreaM2 = inputAreaM2 / storageAreaFactor
 * pallets = floor(effectiveAreaM2 / palletFootprintM2)
 * @param areaM2 입력 면적 (㎡)
 * @returns 수용 가능 파레트 수 (정수, floor)
 */
export function areaToPalletsWithFactor(areaM2: number): number {
  if (areaM2 <= 0) return 0
  const { palletFootprintM2, storageAreaFactor } = STORAGE_AREA_CONSTANTS
  const effectiveAreaM2 = areaM2 / storageAreaFactor
  return Math.floor(effectiveAreaM2 / palletFootprintM2)
}

/**
 * 면적(평) → 파레트 환산 (Storage 전용, 운영계수 역보정)
 * @param areaPyeong 입력 면적 (평)
 * @returns 수용 가능 파레트 수 (정수, floor)
 */
export function areaPyeongToPalletsWithFactor(areaPyeong: number): number {
  if (areaPyeong <= 0) return 0
  const areaM2 = areaPyeong * STORAGE_AREA_CONSTANTS.m2PerPyeong
  return areaToPalletsWithFactor(areaM2)
}

// ============ 참고용 환산 (시각화 목적) ============

/**
 * 큐브를 CBM(Cubic Meter)으로 변환
 * @param cubes 큐브 수
 * @returns CBM (소수점 3자리)
 */
export function cubesToCBM(cubes: number): number {
  if (cubes <= 0) return 0
  return parseFloat((cubes * CUBE_SPEC.volumeM3).toFixed(3))
}

/**
 * 파렛트를 CBM(Cubic Meter)으로 변환
 * @param pallets 파렛트 수
 * @returns CBM (소수점 1자리)
 */
export function palletsToCBM(pallets: number): number {
  if (pallets <= 0) return 0
  return parseFloat((pallets * PALLET_SPEC.volumeM3).toFixed(1))
}

/**
 * CBM을 기준 창고(10평) 개수로 환산
 * @param cbm CBM (Cubic Meter)
 * @returns 창고 개수 (소수점 1자리)
 */
export function cbmToWarehouseCount(cbm: number): number {
  if (cbm <= 0) return 0
  return parseFloat((cbm / REFERENCE_WAREHOUSE.volumeCBM).toFixed(1))
}

/**
 * CBM을 기준 트럭(1톤) 개수로 환산
 * @param cbm CBM (Cubic Meter)
 * @returns 트럭 개수 (소수점 1자리)
 */
export function cbmToTruckCount(cbm: number): number {
  if (cbm <= 0) return 0
  return parseFloat((cbm / REFERENCE_TRUCK.capacityCBM).toFixed(1))
}
