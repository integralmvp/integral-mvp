// ============================================
// 포장 모듈 자동 분류 유틸리티 (PR3-2 재재설계)
// ============================================

import type { BoxInput, ClassifiedBox, ModuleAggregate, BoxSize } from '../types/models'

// ============ 모듈 기준 footprint (reference) ============
const MODULE_SPECS = {
  소형: { width: 550, depth: 275, label: '소형(8분할)' },
  중형: { width: 550, depth: 366, label: '중형(6분할)' },
  대형: { width: 650, depth: 450, label: '대형(4분할)' },
} as const

// 허용 오차
const TOLERANCE = 1.10

// 팔레트 상수 (calcPallets와 동일)
const PALLET_W = 1100 // mm
const PALLET_D = 1100 // mm
const PALLET_H_MAX = 1800 // mm
const PALLET_VOLUME_CAP = PALLET_W * PALLET_D * PALLET_H_MAX // mm³

/**
 * 박스가 특정 모듈에 맞는지 검사
 * - 90도 회전 허용
 * - 면적 + 형상 동시 판정
 * - 허용 오차 10%
 */
function fitsModule(
  boxWidth: number,
  boxDepth: number,
  moduleWidth: number,
  moduleDepth: number
): boolean {
  const boxArea = boxWidth * boxDepth
  const moduleArea = moduleWidth * moduleDepth

  // 1) 면적 체크
  if (boxArea > moduleArea * TOLERANCE) {
    return false
  }

  // 2) 형상 체크 (원래 방향 또는 90도 회전)
  const fitsOriginal =
    boxWidth <= moduleWidth * TOLERANCE &&
    boxDepth <= moduleDepth * TOLERANCE

  const fitsRotated =
    boxDepth <= moduleWidth * TOLERANCE &&
    boxWidth <= moduleDepth * TOLERANCE

  return fitsOriginal || fitsRotated
}

/**
 * 박스 자동 분류 (상위 귀속 원칙)
 */
export function classifyBox(box: BoxInput): ClassifiedBox {
  const { width, depth } = box

  // 상위부터 검사: 대형 → 중형 → 소형
  if (fitsModule(width, depth, MODULE_SPECS.대형.width, MODULE_SPECS.대형.depth)) {
    return { ...box, classification: '대형' }
  }

  if (fitsModule(width, depth, MODULE_SPECS.중형.width, MODULE_SPECS.중형.depth)) {
    return { ...box, classification: '중형' }
  }

  if (fitsModule(width, depth, MODULE_SPECS.소형.width, MODULE_SPECS.소형.depth)) {
    return { ...box, classification: '소형' }
  }

  // 분류 불가
  return { ...box, classification: 'UNCLASSIFIED' }
}

/**
 * 박스 리스트 전체 분류
 */
export function classifyBoxes(boxes: BoxInput[]): ClassifiedBox[] {
  return boxes.map(classifyBox)
}

/**
 * 모듈별 집계 (분류된 박스들을 모듈별로 그룹핑)
 */
export function aggregateByModule(classifiedBoxes: ClassifiedBox[]): ModuleAggregate[] {
  const moduleGroups: Record<BoxSize, ClassifiedBox[]> = {
    소형: [],
    중형: [],
    대형: [],
  }

  // 분류된 박스들을 모듈별로 그룹핑 (UNCLASSIFIED 제외)
  classifiedBoxes.forEach(box => {
    if (box.classification !== 'UNCLASSIFIED') {
      moduleGroups[box.classification].push(box)
    }
  })

  const aggregates: ModuleAggregate[] = []

  // 각 모듈별 집계
  Object.entries(moduleGroups).forEach(([moduleName, boxes]) => {
    if (boxes.length === 0) return

    const moduleSpec = MODULE_SPECS[moduleName as BoxSize]

    let countTotal = 0
    let heightMax = 0
    let volumeTotal = 0

    boxes.forEach(box => {
      countTotal += box.count
      heightMax = Math.max(heightMax, box.height)

      // 체적 계산 (모듈 기준 footprint 사용)
      const stackableHeight = Math.min(box.height, PALLET_H_MAX)
      const boxVolume = moduleSpec.width * moduleSpec.depth * stackableHeight
      volumeTotal += box.count * boxVolume
    })

    // 단독 적재 가정 파레트 수
    const palletsStandalone = Math.ceil(volumeTotal / PALLET_VOLUME_CAP)

    aggregates.push({
      moduleName: moduleName as BoxSize,
      countTotal,
      heightMax,
      volumeTotal,
      palletsStandalone,
    })
  })

  return aggregates
}

/**
 * UNCLASSIFIED 박스가 있는지 확인
 */
export function hasUnclassifiedBoxes(classifiedBoxes: ClassifiedBox[]): boolean {
  return classifiedBoxes.some(box => box.classification === 'UNCLASSIFIED')
}
