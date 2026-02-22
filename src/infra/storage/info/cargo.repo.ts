/**
 * Cargo Store
 *
 * CargoInfo 저장/조회/삭제
 * 화물 정보 데이터 관리
 */

import type { CargoInfo, ModuleClassification } from '../../../types/models'
import { getWeightBand, getSizeBand, calculateSumCm } from '../../dataspec/codedata/bands/bands'
import { STORAGE_KEYS } from '../keys'
import { makeCargoId } from '../../dataspec/id/makeId'
import {
  logCargoCreated,
  logCargoRemoved,
  logCargoSignatureUpdated,
} from '../event/eventLog'

// MVP 기본 소유자 ID
const DEFAULT_OWNER_ID = 'demo-user'

/**
 * 모든 화물 로드
 */
function loadAllCargos(): CargoInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARGOS)
    if (!raw) return []
    return JSON.parse(raw) as CargoInfo[]
  } catch {
    console.error('[CargoStore] Failed to load cargos')
    return []
  }
}

/**
 * 화물 저장
 */
function saveAllCargos(cargos: CargoInfo[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CARGOS, JSON.stringify(cargos))
  } catch (error) {
    console.error('[CargoStore] Failed to save cargos:', error)
  }
}

/**
 * 화물 생성 파라미터
 */
export interface CreateCargoParams {
  // 규격 (mm)
  widthMm: number
  depthMm: number
  heightMm: number
  // 분류 결과
  moduleClass: ModuleClassification
  // 품목 코드
  itemCode: string
  // 중량 (kg)
  weightKg: number
  // 비고 (선택)
  notes?: string
  // 소유자 (선택, 기본값: demo-user)
  ownerId?: string
}

/**
 * 화물 생성 및 저장
 */
export function addCargo(params: CreateCargoParams): CargoInfo {
  const {
    widthMm,
    depthMm,
    heightMm,
    moduleClass,
    itemCode,
    weightKg,
    notes,
    ownerId = DEFAULT_OWNER_ID,
  } = params

  // 3변합 계산
  const sumCm = calculateSumCm(widthMm, depthMm, heightMm)

  // 택소노미 계산 (분류 객체)
  const taxonomy = {
    moduleClass,
    itemCode,
    weightBand: getWeightBand(weightKg),
    sizeBand: getSizeBand(sumCm),
  }

  // CargoInfo 생성
  const cargo: CargoInfo = {
    id: makeCargoId(),
    signature: 'INFO_CARGO',
    ownerId,
    taxonomy,
    fields: {
      dimsMm: { w: widthMm, d: depthMm, h: heightMm },
      sumCm,
      weightKg,
      notes,
    },
    createdAt: new Date().toISOString(),
  }

  // 저장
  const cargos = loadAllCargos()
  cargos.push(cargo)
  saveAllCargos(cargos)

  // 이벤트 로깅
  logCargoCreated(cargo.id, {
    moduleClass: taxonomy.moduleClass,
    itemCode: taxonomy.itemCode,
    weightBand: taxonomy.weightBand,
    sizeBand: taxonomy.sizeBand,
  })

  // 택소노미 설정 이벤트 (초기 설정도 추적)
  logCargoSignatureUpdated(cargo.id, {
    moduleClass: taxonomy.moduleClass,
    itemCode: taxonomy.itemCode,
    weightBand: taxonomy.weightBand,
    sizeBand: taxonomy.sizeBand,
  })

  return cargo
}

/**
 * 화물 조회 (ID)
 */
export function getCargoById(cargoId: string): CargoInfo | undefined {
  const cargos = loadAllCargos()
  return cargos.find(c => c.id === cargoId)
}

/**
 * 화물 목록 조회 (소유자별)
 */
export function listCargosByOwner(ownerId: string = DEFAULT_OWNER_ID): CargoInfo[] {
  const cargos = loadAllCargos()
  return cargos.filter(c => c.ownerId === ownerId)
}

/**
 * 화물 목록 조회 (ID 목록)
 */
export function listCargosByIds(cargoIds: string[]): CargoInfo[] {
  const cargos = loadAllCargos()
  return cargos.filter(c => cargoIds.includes(c.id))
}

/**
 * 화물 삭제
 */
export function removeCargo(cargoId: string): boolean {
  const cargos = loadAllCargos()
  const index = cargos.findIndex(c => c.id === cargoId)

  if (index === -1) return false

  cargos.splice(index, 1)
  saveAllCargos(cargos)

  // 이벤트 로깅
  logCargoRemoved(cargoId)

  return true
}

/**
 * 화물 업데이트
 */
export function updateCargo(cargoId: string, updates: Partial<Pick<CargoInfo, 'fields'>>): CargoInfo | undefined {
  const cargos = loadAllCargos()
  const index = cargos.findIndex(c => c.id === cargoId)

  if (index === -1) return undefined

  const cargo = cargos[index]

  // 필드 업데이트
  if (updates.fields) {
    cargo.fields = { ...cargo.fields, ...updates.fields }

    // 규격이 변경되었으면 시그니처 재계산
    if (updates.fields.dimsMm || updates.fields.weightKg !== undefined) {
      const dimsMm = updates.fields.dimsMm || cargo.fields.dimsMm
      const weightKg = updates.fields.weightKg ?? cargo.fields.weightKg

      const sumCm = calculateSumCm(dimsMm.w, dimsMm.d, dimsMm.h)
      cargo.fields.sumCm = sumCm
      cargo.taxonomy.sizeBand = getSizeBand(sumCm)
      cargo.taxonomy.weightBand = getWeightBand(weightKg)

      // 택소노미 변경 이벤트
      logCargoSignatureUpdated(cargoId, {
        moduleClass: cargo.taxonomy.moduleClass,
        itemCode: cargo.taxonomy.itemCode,
        weightBand: cargo.taxonomy.weightBand,
        sizeBand: cargo.taxonomy.sizeBand,
      })
    }
  }

  cargos[index] = cargo
  saveAllCargos(cargos)

  return cargo
}

/**
 * 화물 택소노미 업데이트
 */
export function updateCargoSignature(
  cargoId: string,
  taxonomyUpdates: Partial<CargoInfo['taxonomy']>
): CargoInfo | undefined {
  const cargos = loadAllCargos()
  const index = cargos.findIndex(c => c.id === cargoId)

  if (index === -1) return undefined

  const cargo = cargos[index]
  cargo.taxonomy = { ...cargo.taxonomy, ...taxonomyUpdates }

  cargos[index] = cargo
  saveAllCargos(cargos)

  // 이벤트 로깅
  logCargoSignatureUpdated(cargoId, {
    moduleClass: cargo.taxonomy.moduleClass,
    itemCode: cargo.taxonomy.itemCode,
    weightBand: cargo.taxonomy.weightBand,
    sizeBand: cargo.taxonomy.sizeBand,
  })

  return cargo
}

/**
 * 모든 화물 삭제 (개발용)
 */
export function clearAllCargos(): void {
  localStorage.removeItem(STORAGE_KEYS.CARGOS)
}

/**
 * 화물 수 조회
 */
export function getCargoCount(ownerId: string = DEFAULT_OWNER_ID): number {
  return listCargosByOwner(ownerId).length
}
