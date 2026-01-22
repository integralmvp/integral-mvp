// ============================================
// 파렛트 환산 유틸리티 (PR3-2)
// ============================================

import { PACKAGE_BOX_MODULES, PALLET_SIZE } from '../data/mockData'
import type { BoxSize } from '../types/models'

/**
 * 포장박스 모듈을 파렛트 개수로 환산
 * @param boxSize 박스 크기 (소형/중형/대형)
 * @param boxCount 박스 개수
 * @returns 필요한 파렛트 개수 (소수점 올림)
 */
export function calculatePalletsFromBoxes(boxSize: BoxSize, boxCount: number): number {
  const boxModule = PACKAGE_BOX_MODULES.find(m => m.name === boxSize)
  if (!boxModule || boxCount <= 0) return 0

  // 파렛트 위에 배치 가능한 박스 수 계산 (가로 × 세로)
  const boxesPerLayer = Math.floor(PALLET_SIZE.width / boxModule.width) *
                        Math.floor(PALLET_SIZE.depth / boxModule.depth)

  // 적재 가능한 층 수 계산 (높이 180cm 기준)
  const layers = Math.floor(PALLET_SIZE.stackHeight / boxModule.height)

  // 파렛트당 박스 수
  const boxesPerPallet = boxesPerLayer * layers

  if (boxesPerPallet === 0) return Math.ceil(boxCount) // 박스가 너무 크면 1개당 1파렛트

  // 필요한 파렛트 개수 (올림)
  return Math.ceil(boxCount / boxesPerPallet)
}

/**
 * 면적(㎡)을 파렛트 개수로 환산
 * @param areaInSquareMeters 면적 (㎡)
 * @returns 필요한 파렛트 개수 (소수점 올림)
 */
export function calculatePalletsFromArea(areaInSquareMeters: number): number {
  if (areaInSquareMeters <= 0) return 0

  // 파렛트 1개 면적: 1.1m × 1.1m = 1.21㎡
  const palletArea = (PALLET_SIZE.width / 100) * (PALLET_SIZE.depth / 100)

  // 필요한 파렛트 개수 (올림)
  return Math.ceil(areaInSquareMeters / palletArea)
}

/**
 * 파렛트당 박스 수 계산 (디버깅/정보 표시용)
 */
export function getBoxesPerPallet(boxSize: BoxSize): number {
  const boxModule = PACKAGE_BOX_MODULES.find(m => m.name === boxSize)
  if (!boxModule) return 0

  const boxesPerLayer = Math.floor(PALLET_SIZE.width / boxModule.width) *
                        Math.floor(PALLET_SIZE.depth / boxModule.depth)
  const layers = Math.floor(PALLET_SIZE.stackHeight / boxModule.height)

  return boxesPerLayer * layers
}
