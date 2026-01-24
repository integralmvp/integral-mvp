// ============================================
// INTEGRAL MVP - 큐브 계산 엔진
// ============================================
// Cube 기반 수요 계산 (단일 내부 단위)
// Phase 1: 엔진 빌드

import { CUBE_SPEC, PACKING_FACTOR, type ModuleName } from './cubeConfig'
import { classifyModule, hasUnclassified, type BoxInput } from './shapeClassifier'

/**
 * 계산 모드
 * - STORAGE: 보관 (packing factor 1.15)
 * - ROUTE: 운송 (packing factor 1.10)
 */
export type DemandMode = 'STORAGE' | 'ROUTE'

/**
 * 모듈별 집계 (설명용)
 */
export interface ModuleSummary {
  module: ModuleName | 'UNCLASSIFIED'
  boxCount: number              // 해당 모듈로 분류된 박스 수
  totalVolumeM3: number         // 해당 모듈의 총 체적 (m³)
  estimatedCubes: number        // 해당 모듈의 추정 큐브 수 (설명용, 대략)
  heightMax: number             // 해당 모듈의 최대 높이 (mm)
}

/**
 * 큐브 수요 계산 결과
 */
export interface CubeDemand {
  totalCubes: number            // 최종 필요 큐브 수 (정수, ceil)
  totalVolumeM3: number         // 실제 박스 체적 합 (m³)
  effectiveVolumeM3: number     // 포장 효율 적용 후 유효 체적 (m³)
  packingFactorUsed: number     // 사용된 포장 효율 계수
  byModule: ModuleSummary[]     // 모듈별 집계 (설명용)
  hasUnclassified: boolean      // UNCLASSIFIED 박스 존재 여부
}

/**
 * 큐브 수요 계산 (핵심 함수)
 * @param boxes 박스 입력 리스트
 * @param mode 계산 모드 (STORAGE | ROUTE)
 * @returns 큐브 수요 계산 결과
 */
export function calcCubeDemand(
  boxes: BoxInput[],
  mode: DemandMode
): CubeDemand {
  // Step 1: 박스별 실제 체적 합산 (m³)
  let totalVolumeM3 = 0
  const boxVolumes: number[] = []

  for (const box of boxes) {
    // mm³ → m³ 변환
    const volumeMm3 = box.widthMm * box.depthMm * box.heightMm
    const volumeM3 = volumeMm3 / 1_000_000_000
    const boxTotalVolume = volumeM3 * box.count

    totalVolumeM3 += boxTotalVolume
    boxVolumes.push(boxTotalVolume)
  }

  // Step 2: mode별 packingFactor 적용 → effectiveVolume
  const packingFactorUsed = PACKING_FACTOR[mode]
  const effectiveVolumeM3 = totalVolumeM3 * packingFactorUsed

  // Step 3: totalCubes = ceil(effectiveVolume / cubeVol)
  const totalCubes = Math.ceil(effectiveVolumeM3 / CUBE_SPEC.volumeM3)

  // Step 4: byModule 집계 (설명용)
  const moduleGroups: Map<ModuleName | 'UNCLASSIFIED', {
    boxCount: number
    totalVolumeM3: number
    heightMax: number
  }> = new Map()

  boxes.forEach((box, index) => {
    const classification = classifyModule(box)
    const module = classification.module

    if (!moduleGroups.has(module)) {
      moduleGroups.set(module, { boxCount: 0, totalVolumeM3: 0, heightMax: 0 })
    }

    const group = moduleGroups.get(module)!
    group.boxCount += box.count
    group.totalVolumeM3 += boxVolumes[index]
    group.heightMax = Math.max(group.heightMax, box.heightMm)
  })

  const byModule: ModuleSummary[] = []
  moduleGroups.forEach((data, module) => {
    // 해당 모듈의 추정 큐브 수 (대략 분배)
    const ratio = data.totalVolumeM3 / totalVolumeM3
    const estimatedCubes = Math.ceil(totalCubes * ratio)

    byModule.push({
      module,
      boxCount: data.boxCount,
      totalVolumeM3: data.totalVolumeM3,
      estimatedCubes,
      heightMax: data.heightMax,
    })
  })

  // Step 5: hasUnclassified 표시
  const classifications = boxes.map(classifyModule)
  const hasUnclassifiedBoxes = hasUnclassified(classifications)

  return {
    totalCubes,
    totalVolumeM3,
    effectiveVolumeM3,
    packingFactorUsed,
    byModule,
    hasUnclassified: hasUnclassifiedBoxes,
  }
}
