/**
 * 큐브 좌표계 엔진 (관리자 견적 MVP — CUBE_MVP_SPEC.md §1 그대로 포팅)
 *
 * 【충돌 예방 주석 — 병합 금지】
 * 이 모듈은 확정 스펙의 200mm 큐브 좌표계 세계다.
 * 기존 src/engine/cube/ 는 화주용 250mm/128파레트 세계로, 의도적으로 분리된
 * 서로 다른 계약이며 중복이 아니다. 두 정의의 통합은 데모 이후 별도 아키텍처 결정.
 *
 * 순수 함수 계층: React import / localStorage / UI 로직 금지.
 *
 * MVP 반올림 규약 (스펙 §1 고정):
 * - 화물 큐브 = 축별 올림(ceil) — 부분 큐브도 점유로 카운트
 * - 차량 큐브(선/면) = 내림(floor) — 보수적 수용량 (vehicleDb.ts 상수에 반영)
 */

/** 1큐브 = 200mm (관리자 견적 확정 스펙. 화주 엔진의 250mm와 별개 계약) */
export const CUBE_MM = 200

/** 화물의 큐브 좌표 (선/면/공간/중량) */
export interface CargoCubes {
  line_cube: number
  area_cube: number
  volume_cube: number
  weight_cube: number
}

/** 차량 큐브 좌표 + 정렬 순서 (스펙 §2 차량 DB 레코드) */
export interface Vehicle {
  id: string
  name: string
  line_cube: number
  area_cube: number
  volume_cube: number
  weight_cube: number
  sort_order: number
}

/** 초과 사유 코드 — UI에 그대로 노출 (길이서사의 증거) */
export type ExceedReason = 'LINE' | 'AREA' | 'VOLUME' | 'WEIGHT' | 'NO_AVAILABLE_VEHICLE'

export interface MatchResult {
  matched: boolean
  vehicle: Vehicle | null
  /** 추천 차종보다 작은 차종들이 탈락한 사유 (차종별) */
  reasons: ExceedReason[]
}

/** 탈락 차종별 사유 목록 (UI "1t~3.5t 선초과" 서사용) */
export interface RejectedVehicle {
  vehicle: Vehicle
  reasons: ExceedReason[]
}

/** 견적 권역 (MVP: 사용자가 직접 입력) */
export type Region = '시내' | '시외'

/** 단가 룩업 적용행 계층 (우선순위: 조건 > 세부 > 표준) */
export type RateTier = '조건' | '세부' | '표준'

/** 조건행: 권역+차종+품목(품목군 정확일치 포함) */
export interface ConditionRateRow {
  권역: Region
  차종: string
  단가: number
  품목군: string[]
}

/** 세부행: 권역+차종 */
export interface DetailRateRow {
  권역: Region
  차종: string
  단가: number
}

/** 표준행: 차종 */
export interface StandardRateRow {
  차종: string
  단가: number
}

/** 냉동 단가테이블 3계층 형태 (rateTable.ts 참조 — adminRateTable.json 그대로) */
export interface RateTable {
  차량형: {
    도내비: {
      조건: ConditionRateRow[]
      세부: DetailRateRow[]
      표준: StandardRateRow[]
    }
  }
}

export interface RateLookupResult {
  단가: number
  적용행: RateTier
}

export interface QuoteResult {
  청구큐브: number
  /** 단가 미등록 시 null — 0원 표시 금지 */
  큐브당: number | null
  차량당: number | null
  견적가: number | null
  적용행: RateTier | null
  단가미등록: boolean
}

/**
 * 화물 큐브 좌표 환산 (큐브좌표계 §9)
 * 축별 ceil 후 내림차순 정렬(A ≥ B ≥ C)
 */
export function cargoCubes(
  L_mm: number,
  W_mm: number,
  H_mm: number,
  weight_kg: number
): CargoCubes {
  const ax = [
    Math.ceil(L_mm / CUBE_MM),
    Math.ceil(W_mm / CUBE_MM),
    Math.ceil(H_mm / CUBE_MM),
  ].sort((a, b) => b - a) // A ≥ B ≥ C
  const [A, B, C] = ax
  return {
    line_cube: A, // 선큐브 = 최장축
    area_cube: A * B, // 면큐브 = 최장 2축
    volume_cube: A * B * C, // 공간큐브
    weight_cube: Math.round((weight_kg / 1000) * 200), // 중량큐브 = ton×200
  }
}

/**
 * 차량 매칭 (큐브좌표계 §11) — 네 좌표 모두 만족하는 최소 차종
 * vehicles는 sort_order 오름차순 정렬 전제
 */
export function matchVehicle(cargo: CargoCubes, vehicles: Vehicle[]): MatchResult {
  for (const v of vehicles) {
    const reasons: ExceedReason[] = []
    if (cargo.line_cube > v.line_cube) reasons.push('LINE')
    if (cargo.area_cube > v.area_cube) reasons.push('AREA')
    if (cargo.volume_cube > v.volume_cube) reasons.push('VOLUME')
    if (cargo.weight_cube > v.weight_cube) reasons.push('WEIGHT')
    if (reasons.length === 0) {
      return { matched: true, vehicle: v, reasons: [] }
    }
  }
  return { matched: false, vehicle: null, reasons: ['NO_AVAILABLE_VEHICLE'] }
}

/**
 * 추천 차종 이전에 탈락한 차종들과 각 초과 사유
 * (스펙 §4 "1t~3.5t 선초과" 뱃지 노출용 — 매칭 결과에서 파생, 별도 truth 아님)
 */
export function rejectedVehicles(cargo: CargoCubes, vehicles: Vehicle[]): RejectedVehicle[] {
  const rejected: RejectedVehicle[] = []
  for (const v of vehicles) {
    const reasons: ExceedReason[] = []
    if (cargo.line_cube > v.line_cube) reasons.push('LINE')
    if (cargo.area_cube > v.area_cube) reasons.push('AREA')
    if (cargo.volume_cube > v.volume_cube) reasons.push('VOLUME')
    if (cargo.weight_cube > v.weight_cube) reasons.push('WEIGHT')
    if (reasons.length === 0) break // 첫 적합 차종에서 종료
    rejected.push({ vehicle: v, reasons })
  }
  return rejected
}

/**
 * 청구큐브 (차량형 = 실질큐브: 청구차종 부피큐브 × 대수) — 큐브좌표계 §7.2
 */
export function billingCube(matchedVehicle: Vehicle, count = 1): number {
  return matchedVehicle.volume_cube * count
}

/**
 * 3계층 단가 룩업 — 확정 도출 결과 테이블에서 정적 룩업만 (재계산 금지)
 * ① 조건: 권역+차종 일치 AND 품목 ∈ 품목군 (문자열 정확일치)
 * ② 세부: 권역+차종 일치
 * ③ 표준: 차종 일치
 * ④ 없음: null (단가 미등록 — 호출측에서 안내 처리, 크래시 금지)
 */
export function lookupRate(
  rateTable: RateTable,
  권역: Region,
  차종: string,
  품목?: string
): RateLookupResult | null {
  const { 조건, 세부, 표준 } = rateTable.차량형.도내비

  if (품목) {
    const cond = 조건.find(
      r => r.권역 === 권역 && r.차종 === 차종 && r.품목군.includes(품목)
    )
    if (cond) return { 단가: cond.단가, 적용행: '조건' }
  }

  const detail = 세부.find(r => r.권역 === 권역 && r.차종 === 차종)
  if (detail) return { 단가: detail.단가, 적용행: '세부' }

  const standard = 표준.find(r => r.차종 === 차종)
  if (standard) return { 단가: standard.단가, 적용행: '표준' }

  return null
}

/**
 * 견적가 = 냉동 단가테이블 3계층 룩업 (lookupRate). SPL 재계산 없음.
 * 큐브당 단가는 병행 표시(그룹핑 축)일 뿐 SoT 아님.
 * 단가 미등록(룩업 실패) 시 견적가/큐브당/차량당 null + 단가미등록 true — 0원·크래시 금지.
 */
export function quote(
  rateTable: RateTable,
  권역: Region,
  matchedVehicle: Vehicle,
  count = 1,
  품목?: string
): QuoteResult {
  const 청구큐브 = billingCube(matchedVehicle, count)
  const rate = lookupRate(rateTable, 권역, matchedVehicle.id, 품목)

  if (rate === null) {
    return { 청구큐브, 큐브당: null, 차량당: null, 견적가: null, 적용행: null, 단가미등록: true }
  }

  const 차량당 = rate.단가
  const 큐브당 = Math.round(차량당 / matchedVehicle.volume_cube) // 병행 표시(그룹핑 축)
  return { 청구큐브, 큐브당, 차량당, 견적가: 차량당 * count, 적용행: rate.적용행, 단가미등록: false }
}
