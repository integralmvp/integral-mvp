/**
 * Domain Types - Condition
 * 검색 조건 도메인 타입 정의
 *
 * StorageCondition, TransportCondition: UI 입력 상태 (DemandSession에 저장)
 * RegionCode = string (10자리 법정동 코드) - 필터링 SoT
 */

import type { RegionCode } from './codes'

// ============ 보관 조건 ============
export interface StorageCondition {
  location?: string           // 보관 장소 표시용 (name)
  locationCode?: RegionCode   // 보관 장소 법정동 코드 (필터링 SoT)
  startDate?: string
  endDate?: string
}

// ============ 운송 조건 ============
export interface TransportCondition {
  origin?: string
  originCode?: RegionCode
  destination?: string
  destinationCode?: RegionCode
  transportDate?: string
}
