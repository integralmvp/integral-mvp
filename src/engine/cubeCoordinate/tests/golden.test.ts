/**
 * 골든 데모 화물 테스트 (CUBE_MVP_SPEC.md §4 — 엔진이 이 표를 정확히 재현해야 함)
 *
 * 입력: 길이 6000 · 폭 600 · 높이 600 (mm) · 중량 300 (kg) · 권역 "시외" · 대수 1
 * (장척 파이프 시나리오)
 */

import { describe, it, expect } from 'vitest'
import {
  cargoCubes,
  matchVehicle,
  rejectedVehicles,
  billingCube,
  quote,
  VEHICLE_DB,
  RATE_TABLE,
} from '../index'

const GOLDEN = { L: 6000, W: 600, H: 600, kg: 300, 권역: '시외' as const, 대수: 1 }

describe('골든 데모 화물 (스펙 §4)', () => {
  const cargo = cargoCubes(GOLDEN.L, GOLDEN.W, GOLDEN.H, GOLDEN.kg)

  it('큐브 좌표: 선 30 · 면 90 · 공간 270 · 중량 60', () => {
    expect(cargo.line_cube).toBe(30)
    expect(cargo.area_cube).toBe(90)
    expect(cargo.volume_cube).toBe(270)
    expect(cargo.weight_cube).toBe(60)
  })

  it('1t~3.5t는 선초과로 탈락 (선 30 > 14/15/21/23), 공간·중량은 여유', () => {
    const rejected = rejectedVehicles(cargo, VEHICLE_DB)
    expect(rejected.map(r => r.vehicle.id)).toEqual(['1t', '1.4t', '2.5t', '3.5t'])
    for (const r of rejected) {
      expect(r.reasons).toEqual(['LINE']) // 선초과만 — 공간·중량 사유 없음
    }
  })

  it('추천 차종: 5t (선 31 ≥ 30, 첫 적합)', () => {
    const match = matchVehicle(cargo, VEHICLE_DB)
    expect(match.matched).toBe(true)
    expect(match.vehicle?.id).toBe('5t')
    expect(match.reasons).toEqual([])
  })

  it('청구큐브 2,500 (5t 부피큐브 × 1대)', () => {
    const match = matchVehicle(cargo, VEHICLE_DB)
    expect(billingCube(match.vehicle!, GOLDEN.대수)).toBe(2500)
  })

  it('큐브당 72원 (시외) · 견적가 180,000원', () => {
    const match = matchVehicle(cargo, VEHICLE_DB)
    const result = quote(RATE_TABLE, GOLDEN.권역, match.vehicle!, GOLDEN.대수)
    expect(result.청구큐브).toBe(2500)
    expect(result.큐브당).toBe(72)
    expect(result.차량당).toBe(180000)
    expect(result.견적가).toBe(180000)
  })
})
