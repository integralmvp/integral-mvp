// ============================================
// INTEGRAL MVP - 형상 분류기
// ============================================
// 포장 모듈의 역할: "형상 검증 + 표준 분류"
// 계산 중심이 아닌, 제약 필터링/설명용
// Phase 1: 엔진 빌드

import { MODULE_SPECS, SHAPE_BUFFER_MM, type ModuleName } from './cubeConfig'

/**
 * 박스 입력 (실측 치수)
 */
export interface BoxInput {
  widthMm: number
  depthMm: number
  heightMm: number
  count: number
  // 확장 필드 (Phase 4 매칭 시 사용)
  weightKg?: number
  stackable?: boolean
}

/**
 * 형상 검증 결과
 */
export interface ShapeCheck {
  module: ModuleName | 'UNCLASSIFIED'
  fitsOriginal: boolean      // 원래 방향으로 맞는지
  fitsRotated: boolean        // 90도 회전 시 맞는지
  areaRatio: number           // 박스 면적 / 모듈 면적 (활용도)
}

/**
 * 박스가 특정 모듈에 맞는지 검사
 * - 형상(가로·세로): 절대 기준(mm) + 버퍼 → 하드 리미트
 * - 면적: 보조 기준 (버퍼 없음, 절대 기준)
 * - 90도 회전 허용
 */
function fitsModule(
  boxWidth: number,
  boxDepth: number,
  moduleWidth: number,
  moduleDepth: number
): { fits: boolean; original: boolean; rotated: boolean } {
  const boxArea = boxWidth * boxDepth
  const moduleArea = moduleWidth * moduleDepth

  // 1) 면적 체크 (절대 기준, 버퍼 없음)
  if (boxArea > moduleArea) {
    return { fits: false, original: false, rotated: false }
  }

  // 2) 형상 체크 (원래 방향 또는 90도 회전, 버퍼 허용)
  const fitsOriginal =
    boxWidth <= moduleWidth + SHAPE_BUFFER_MM &&
    boxDepth <= moduleDepth + SHAPE_BUFFER_MM

  const fitsRotated =
    boxDepth <= moduleWidth + SHAPE_BUFFER_MM &&
    boxWidth <= moduleDepth + SHAPE_BUFFER_MM

  return {
    fits: fitsOriginal || fitsRotated,
    original: fitsOriginal,
    rotated: fitsRotated,
  }
}

/**
 * 박스를 표준 모듈로 분류
 * - fits 되는 모든 모듈 중 가장 작은 모듈 선택 (최소 면적 모듈)
 * - 없으면 UNCLASSIFIED
 */
export function classifyModule(box: BoxInput): ShapeCheck {
  const { widthMm, depthMm } = box

  // 각 모듈별 검사
  const candidates: Array<{
    module: ModuleName
    area: number
    fitsOriginal: boolean
    fitsRotated: boolean
  }> = []

  // 소형 검사
  const smallCheck = fitsModule(
    widthMm,
    depthMm,
    MODULE_SPECS.소형.widthMm,
    MODULE_SPECS.소형.depthMm
  )
  if (smallCheck.fits) {
    candidates.push({
      module: '소형',
      area: MODULE_SPECS.소형.widthMm * MODULE_SPECS.소형.depthMm,
      fitsOriginal: smallCheck.original,
      fitsRotated: smallCheck.rotated,
    })
  }

  // 중형 검사
  const mediumCheck = fitsModule(
    widthMm,
    depthMm,
    MODULE_SPECS.중형.widthMm,
    MODULE_SPECS.중형.depthMm
  )
  if (mediumCheck.fits) {
    candidates.push({
      module: '중형',
      area: MODULE_SPECS.중형.widthMm * MODULE_SPECS.중형.depthMm,
      fitsOriginal: mediumCheck.original,
      fitsRotated: mediumCheck.rotated,
    })
  }

  // 대형 검사
  const largeCheck = fitsModule(
    widthMm,
    depthMm,
    MODULE_SPECS.대형.widthMm,
    MODULE_SPECS.대형.depthMm
  )
  if (largeCheck.fits) {
    candidates.push({
      module: '대형',
      area: MODULE_SPECS.대형.widthMm * MODULE_SPECS.대형.depthMm,
      fitsOriginal: largeCheck.original,
      fitsRotated: largeCheck.rotated,
    })
  }

  // 분류 불가
  if (candidates.length === 0) {
    return {
      module: 'UNCLASSIFIED',
      fitsOriginal: false,
      fitsRotated: false,
      areaRatio: 0,
    }
  }

  // 면적이 가장 작은 모듈 선택 (최소 면적 모듈)
  candidates.sort((a, b) => a.area - b.area)
  const selected = candidates[0]

  const boxArea = widthMm * depthMm
  const areaRatio = boxArea / selected.area

  return {
    module: selected.module,
    fitsOriginal: selected.fitsOriginal,
    fitsRotated: selected.fitsRotated,
    areaRatio,
  }
}

/**
 * 박스 리스트 전체 분류
 */
export function classifyBoxes(boxes: BoxInput[]): ShapeCheck[] {
  return boxes.map(classifyModule)
}

/**
 * UNCLASSIFIED 박스가 있는지 확인
 */
export function hasUnclassified(classifications: ShapeCheck[]): boolean {
  return classifications.some((c) => c.module === 'UNCLASSIFIED')
}
