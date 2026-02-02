/**
 * PR5: DemandSession 타입 정의
 *
 * 검색 시점의 스냅샷을 저장하는 세션 관련 타입
 * 메인 DemandSession 타입은 types/models.ts에 정의
 */

import type { RegisteredCargo } from '../../types/models'

/**
 * 검색 조건 스냅샷
 */
export interface SearchConditionSnapshot {
  storageLocation?: string
  startDate?: string
  endDate?: string
  origin?: string
  destination?: string
  transportDate?: string
}

/**
 * 규정 체크 요약 결과
 */
export interface RegulationSummary {
  checked: boolean
  passedOfferIds: string[]
  failedOfferIdsCount: number
}

/**
 * 자원 체크 요약 결과
 */
export interface ResourceSummary {
  checked: boolean
  passedOfferIds: string[]
  failedOfferIdsCount: number
}

/**
 * 검색 세션 스냅샷 (검색 실행 시점의 상태)
 */
export interface SearchSessionSnapshot {
  sessionId: string
  mode: 'STORAGE' | 'ROUTE'
  createdAt: string

  // 화물 스냅샷
  cargos: RegisteredCargo[]
  totalCubes: number
  totalPallets?: number  // STORAGE only

  // 조건 스냅샷
  conditions: SearchConditionSnapshot

  // 규정 체크 결과
  regulationSummary: RegulationSummary

  // 자원 체크 결과
  resourceSummary: ResourceSummary

  // 최종 상태
  status: 'DRAFT' | 'RULES_PASSED' | 'RESOURCE_READY'
}

/**
 * 세션 생성 파라미터
 */
export interface CreateSearchSessionParams {
  mode: 'STORAGE' | 'ROUTE'
  cargos: RegisteredCargo[]
  totalCubes: number
  totalPallets?: number
  conditions: SearchConditionSnapshot
}
