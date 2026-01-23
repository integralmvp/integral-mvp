// ============================================
// 포장 모듈 자동 분류 유틸리티 (PR3-2 재설계: 물류 표준화 방식)
// ============================================

import type { BoxInput, ClassifiedBox, ModuleAggregate, BoxSize } from '../types/models'

// ============ 모듈 기준 footprint (reference) ============
const MODULE_SPECS = {
  소형: { width: 550, depth: 275, label: '소형(8분할)' },
  중형: { width: 550, depth: 366, label: '중형(6분할)' },
  대형: { width: 650, depth: 450, label: '대형(4분할)' },
} as const

// 형상 허용 버퍼 (절대값)
const BUFFER = 10 // mm

// 팔레트 상수 (calcPallets와 동일)
const PALLET_W = 1100 // mm
const PALLET_D = 1100 // mm
const PALLET_H_MAX = 1800 // mm
const PALLET_VOLUME_CAP = PALLET_W * PALLET_D * PALLET_H_MAX // mm³

/**
 * 박스가 특정 모듈에 맞는지 검사 (물류 표준화 방식)
 * - 형상(가로·세로): 절대 기준(mm) + 10mm 버퍼 → 하드 리미트
 * - 면적: 보조 기준 (버퍼 없음, 절대 기준)
 * - 90도 회전 허용
 */
function fitsModule(
  boxWidth: number,
  boxDepth: number,
  moduleWidth: number,
  moduleDepth: number
): boolean {
  const boxArea = boxWidth * boxDepth
  const moduleArea = moduleWidth * moduleDepth

  // 1) 면적 체크 (절대 기준, 버퍼 없음)
  if (boxArea > moduleArea) {
    return false
  }

  // 2) 형상 체크 (원래 방향 또는 90도 회전, 10mm 버퍼 허용)
  const fitsOriginal =
    boxWidth <= moduleWidth + BUFFER &&
    boxDepth <= moduleDepth + BUFFER

  const fitsRotated =
    boxDepth <= moduleWidth + BUFFER &&
    boxWidth <= moduleDepth + BUFFER

  return fitsOriginal || fitsRotated
}

/**
 * 박스 자동 분류 (최소 적합 모듈 방식)
 * - fits 되는 모든 모듈 중 가장 작은 모듈 선택
 */
export function classifyBox(box: BoxInput): ClassifiedBox {
  const { width, depth } = box

  // fits 되는 모든 모듈 찾기
  const candidates: Array<{ name: BoxSize; area: number }> = []

  if (fitsModule(width, depth, MODULE_SPECS.소형.width, MODULE_SPECS.소형.depth)) {
    candidates.push({
      name: '소형',
      area: MODULE_SPECS.소형.width * MODULE_SPECS.소형.depth
    })
  }

  if (fitsModule(width, depth, MODULE_SPECS.중형.width, MODULE_SPECS.중형.depth)) {
    candidates.push({
      name: '중형',
      area: MODULE_SPECS.중형.width * MODULE_SPECS.중형.depth
    })
  }

  if (fitsModule(width, depth, MODULE_SPECS.대형.width, MODULE_SPECS.대형.depth)) {
    candidates.push({
      name: '대형',
      area: MODULE_SPECS.대형.width * MODULE_SPECS.대형.depth
    })
  }

  // 분류 불가
  if (candidates.length === 0) {
    return { ...box, classification: 'UNCLASSIFIED' }
  }

  // 면적이 가장 작은 모듈 선택
  candidates.sort((a, b) => a.area - b.area)
  const selectedModule = candidates[0].name

  return { ...box, classification: selectedModule }
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

// ============ 내부 검증 로직 (개발/디버그용) ============

export interface ValidationResult {
  passed: boolean
  errors: string[]
}

/**
 * 테스트 케이스 실행
 */
export function runClassificationTests(): ValidationResult {
  const errors: string[] = []

  // TEST 1: 300×200 박스 → 소형
  const test1 = classifyBox({ id: 't1', width: 300, depth: 200, height: 100, count: 1 })
  if (test1.classification !== '소형') {
    errors.push(`TEST 1 실패: 300×200 → ${test1.classification} (예상: 소형)`)
  }

  // TEST 2: 540×360 박스 → 중형
  const test2 = classifyBox({ id: 't2', width: 540, depth: 360, height: 100, count: 1 })
  if (test2.classification !== '중형') {
    errors.push(`TEST 2 실패: 540×360 → ${test2.classification} (예상: 중형)`)
  }

  // TEST 3: 640×440 박스 → 대형
  const test3 = classifyBox({ id: 't3', width: 640, depth: 440, height: 100, count: 1 })
  if (test3.classification !== '대형') {
    errors.push(`TEST 3 실패: 640×440 → ${test3.classification} (예상: 대형)`)
  }

  // TEST 4: 모든 모듈 초과 → UNCLASSIFIED
  const test4 = classifyBox({ id: 't4', width: 800, depth: 600, height: 100, count: 1 })
  if (test4.classification !== 'UNCLASSIFIED') {
    errors.push(`TEST 4 실패: 800×600 → ${test4.classification} (예상: UNCLASSIFIED)`)
  }

  return {
    passed: errors.length === 0,
    errors
  }
}

/**
 * 분류 결과 검증
 */
export function validateClassification(classifiedBoxes: ClassifiedBox[]): ValidationResult {
  const errors: string[] = []

  classifiedBoxes.forEach(box => {
    if (box.classification === 'UNCLASSIFIED') return

    const moduleSpec = MODULE_SPECS[box.classification]
    const boxArea = box.width * box.depth
    const moduleArea = moduleSpec.width * moduleSpec.depth

    // 분류된 모듈 면적 >= 실제 박스 면적
    if (moduleArea < boxArea) {
      errors.push(
        `검증 실패: ${box.classification} 모듈(${moduleArea}mm²) < 박스(${boxArea}mm²)`
      )
    }
  })

  return {
    passed: errors.length === 0,
    errors
  }
}

/**
 * 팔레트 환산 결과 검증
 */
export function validatePalletCalculation(
  moduleAggregates: ModuleAggregate[],
  finalPallets: number
): ValidationResult {
  const errors: string[] = []

  if (moduleAggregates.length === 0) {
    return { passed: true, errors: [] }
  }

  // 최종 pallets >= 각 모듈 단독 파레트 최대값
  const maxStandalone = Math.max(...moduleAggregates.map(agg => agg.palletsStandalone))
  if (finalPallets < maxStandalone) {
    errors.push(
      `검증 실패: 최종 파레트(${finalPallets}) < 단독 최대(${maxStandalone})`
    )
  }

  return {
    passed: errors.length === 0,
    errors
  }
}
