// ============================================
// 팔레트 환산 유틸리티 (PR3-2 재설계 - 체적 기반)
// ============================================

import { PACKAGE_BOX_MODULES, PALLET_SIZE } from '../data/mockData'
import type { BoxSize, ModuleInputs } from '../types/models'

// ============ 상수 ============
const PALLET_W = 1100 // mm
const PALLET_D = 1100 // mm
const PALLET_H_MAX = 1800 // mm
const PALLET_BASE_AREA = PALLET_W * PALLET_D // mm²
const PALLET_VOLUME_CAP = PALLET_BASE_AREA * PALLET_H_MAX // mm³

// 혼합 적재 보정계수
const MIX_FACTOR_SINGLE = 1.00
const MIX_FACTOR_MIXED = 1.10

// ============ 타입 ============
export interface PalletCalculationResult {
  palletsRaw: number       // 보정 전 팔레트 수
  mixFactor: number        // 혼합 적재 보정계수
  pallets: number          // 최종 팔레트 수
  totalVolume: number      // 총 체적 (mm³)
  warnings: string[]       // 경고 메시지
}

// ============ 핵심 계산 함수 ============

/**
 * 체적 기반 팔레트 환산 (물류 표준화 방식)
 * @param selectedModules 선택된 모듈 타입들
 * @param inputs 각 모듈별 박스 개수 및 높이(mm)
 * @returns 팔레트 계산 결과
 */
export function calcPallets(
  selectedModules: Set<BoxSize>,
  inputs: ModuleInputs
): PalletCalculationResult {
  const warnings: string[] = []
  let totalVolume = 0

  // 선택된 모듈 개수
  const selectedCount = selectedModules.size

  if (selectedCount === 0) {
    return {
      palletsRaw: 0,
      mixFactor: 1.0,
      pallets: 0,
      totalVolume: 0,
      warnings: []
    }
  }

  // 각 모듈별 체적 계산
  selectedModules.forEach(moduleName => {
    const module = PACKAGE_BOX_MODULES.find(m => m.name === moduleName)
    if (!module) return

    const input = inputs[moduleName]
    const count = input?.count || 0
    const boxHeight = input?.height || 0

    // 유효성 검사
    if (count < 0) {
      warnings.push(`${moduleName}: 박스 개수는 0 이상이어야 합니다.`)
      return
    }
    if (boxHeight <= 0) {
      if (count > 0) {
        warnings.push(`${moduleName}: 박스 높이를 입력하세요.`)
      }
      return
    }
    if (boxHeight < 50) {
      warnings.push(`${moduleName}: 박스 높이가 너무 작습니다 (최소 50mm 권장).`)
    }

    // 적재 가능 높이 계산 (1800mm 캡)
    let stackableHeight = boxHeight
    if (boxHeight > PALLET_H_MAX) {
      stackableHeight = PALLET_H_MAX
      warnings.push(`${moduleName}: 박스 높이가 1800mm를 초과하여 1800mm 기준으로 계산됩니다.`)
    }

    // 박스 체적 계산 (width × depth는 mm 단위)
    const boxVolume = module.width * module.depth * stackableHeight
    totalVolume += count * boxVolume
  })

  // 이론 최소 팔레트 수 (체적 기반)
  const palletsRaw = totalVolume > 0 ? Math.ceil(totalVolume / PALLET_VOLUME_CAP) : 0

  // 혼합 적재 보정계수 적용
  const mixFactor = selectedCount === 1 ? MIX_FACTOR_SINGLE : MIX_FACTOR_MIXED
  const pallets = Math.ceil(palletsRaw * mixFactor)

  return {
    palletsRaw,
    mixFactor,
    pallets,
    totalVolume,
    warnings
  }
}

/**
 * 면적(㎡)을 팔레트 개수로 환산
 * @param areaInSquareMeters 면적 (㎡)
 * @returns 필요한 팔레트 개수 (소수점 올림)
 */
export function calculatePalletsFromArea(areaInSquareMeters: number): number {
  if (areaInSquareMeters <= 0) return 0

  // 팔레트 1개 면적: 1.1m × 1.1m = 1.21㎡
  const palletArea = (PALLET_SIZE.width / 100) * (PALLET_SIZE.depth / 100)

  // 필요한 팔레트 개수 (올림)
  return Math.ceil(areaInSquareMeters / palletArea)
}
