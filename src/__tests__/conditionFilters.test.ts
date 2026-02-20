/**
 * PR7-pre: 조건 필터 테스트
 *
 * 지역 범위 필터링 + 누적 필터 규칙 검증
 */

import { describe, it, expect } from 'vitest'
import {
  filterStorageByConditions,
  filterRouteByConditions,
} from '../layers/matching/condition/conditionFilters'
import { STORAGE_PRODUCTS, ROUTE_PRODUCTS } from '../data/mock/mockData'
import type { SearchConditions } from '../layers/types/matchingTypes'

describe('지역 범위 필터링 (PR7-pre)', () => {
  describe('Storage 지역 필터', () => {
    it('제주시(5011000000) 선택 시 제주시 및 하위(애월, 한림, 조천) 포함', () => {
      const conditions: SearchConditions = {
        storageLocationCode: '5011000000', // 제주시
      }

      const result = filterStorageByConditions(STORAGE_PRODUCTS, conditions)
      const regions = result.map(p => p.location.region)

      // 제주시 관련 상품: S1(제주시), S2(제주시), S6(애월), S7(한림), S8(조천)
      expect(regions).toContain('제주시')
      expect(regions).toContain('애월')
      expect(regions).toContain('한림')
      expect(regions).toContain('조천')

      // 서귀포시 관련 상품 제외
      expect(regions).not.toContain('서귀포')
      expect(regions).not.toContain('성산')
    })

    it('서귀포시(5013000000) 선택 시 서귀포시 및 하위(성산) 포함', () => {
      const conditions: SearchConditions = {
        storageLocationCode: '5013000000', // 서귀포시
      }

      const result = filterStorageByConditions(STORAGE_PRODUCTS, conditions)
      const regions = result.map(p => p.location.region)

      // 서귀포시 관련 상품: S3(서귀포), S4(서귀포), S5(성산)
      expect(regions).toContain('서귀포')
      expect(regions).toContain('성산')

      // 제주시 관련 상품 제외
      expect(regions).not.toContain('제주시')
      expect(regions).not.toContain('애월')
    })

    it('성산읍(5013025900) 선택 시 성산만 포함', () => {
      const conditions: SearchConditions = {
        storageLocationCode: '5013025900', // 서귀포시 성산읍
      }

      const result = filterStorageByConditions(STORAGE_PRODUCTS, conditions)
      const regions = result.map(p => p.location.region)

      // 성산 상품만 포함
      expect(regions).toEqual(['성산'])
      expect(result.length).toBe(1)
    })

    it('한림읍(5011025000) 선택 시 한림만 포함', () => {
      const conditions: SearchConditions = {
        storageLocationCode: '5011025000', // 제주시 한림읍
      }

      const result = filterStorageByConditions(STORAGE_PRODUCTS, conditions)
      const regions = result.map(p => p.location.region)

      expect(regions).toEqual(['한림'])
      expect(result.length).toBe(1)
    })

    it('조건 없으면 전체 반환', () => {
      const conditions: SearchConditions = {}

      const result = filterStorageByConditions(STORAGE_PRODUCTS, conditions)

      expect(result.length).toBe(STORAGE_PRODUCTS.length)
    })
  })

  describe('Route 지역 필터', () => {
    it('출발지 제주시(5011000000) 선택 시 제주시 및 하위 출발 경로 포함', () => {
      const conditions: SearchConditions = {
        originCode: '5011000000', // 제주시
      }

      const result = filterRouteByConditions(ROUTE_PRODUCTS, conditions)

      // 제주시 출발: R1, R2 (제주시), R7 (제주항=제주시)
      // 애월, 한림 출발: R3 (애월), R4 (한림)
      const origins = result.map(p => p.origin.name)

      expect(origins).toContain('제주시')
      expect(origins).toContain('제주항')
      expect(origins).toContain('애월')
      expect(origins).toContain('한림')
    })

    it('도착지 서귀포시(5013000000) 선택 시 서귀포시 및 하위 도착 경로 포함', () => {
      const conditions: SearchConditions = {
        destinationCode: '5013000000', // 서귀포시
      }

      const result = filterRouteByConditions(ROUTE_PRODUCTS, conditions)
      const destinations = result.map(p => p.destination.name)

      // 서귀포 도착: R1, R3
      // 성산 도착: R2 (성산은 서귀포시 하위)
      expect(destinations).toContain('서귀포')
      expect(destinations).toContain('성산')
    })

    it('빈 문자열 코드(육지)는 매칭 실패', () => {
      const conditions: SearchConditions = {
        originCode: '5011000000', // 제주시
      }

      const result = filterRouteByConditions(ROUTE_PRODUCTS, conditions)

      // 육지 출발(R5, R6)은 originCode가 빈 문자열이므로 제외
      const ids = result.map(p => p.id)
      expect(ids).not.toContain('R5')
      expect(ids).not.toContain('R6')
    })

    it('조건 없으면 전체 반환', () => {
      const conditions: SearchConditions = {}

      const result = filterRouteByConditions(ROUTE_PRODUCTS, conditions)

      expect(result.length).toBe(ROUTE_PRODUCTS.length)
    })
  })
})

describe('누적 필터 규칙 (조건 추가 시 결과 ≤ 이전)', () => {
  it('Storage: 조건 없음 → 지역 추가 시 결과 감소 또는 동일', () => {
    const noCondition: SearchConditions = {}
    const withRegion: SearchConditions = {
      storageLocationCode: '5011000000', // 제주시
    }

    const resultNoCondition = filterStorageByConditions(STORAGE_PRODUCTS, noCondition)
    const resultWithRegion = filterStorageByConditions(STORAGE_PRODUCTS, withRegion)

    expect(resultNoCondition.length).toBeGreaterThanOrEqual(resultWithRegion.length)
  })

  it('Storage: 상위 지역 → 하위 지역으로 좁히면 결과 감소 또는 동일', () => {
    const jeju: SearchConditions = {
      storageLocationCode: '5011000000', // 제주시 전체
    }
    const hallim: SearchConditions = {
      storageLocationCode: '5011025000', // 제주시 한림읍만
    }

    const resultJeju = filterStorageByConditions(STORAGE_PRODUCTS, jeju)
    const resultHallim = filterStorageByConditions(STORAGE_PRODUCTS, hallim)

    expect(resultJeju.length).toBeGreaterThanOrEqual(resultHallim.length)
  })

  it('Route: 출발지 조건 추가 시 결과 감소 또는 동일', () => {
    const noCondition: SearchConditions = {}
    const withOrigin: SearchConditions = {
      originCode: '5013000000', // 서귀포시
    }

    const resultNoCondition = filterRouteByConditions(ROUTE_PRODUCTS, noCondition)
    const resultWithOrigin = filterRouteByConditions(ROUTE_PRODUCTS, withOrigin)

    expect(resultNoCondition.length).toBeGreaterThanOrEqual(resultWithOrigin.length)
  })

  it('Route: 출발지 + 도착지 조건 추가 시 결과 감소 또는 동일', () => {
    const withOrigin: SearchConditions = {
      originCode: '5011000000', // 제주시
    }
    const withBoth: SearchConditions = {
      originCode: '5011000000', // 제주시
      destinationCode: '5013000000', // 서귀포시
    }

    const resultOriginOnly = filterRouteByConditions(ROUTE_PRODUCTS, withOrigin)
    const resultBoth = filterRouteByConditions(ROUTE_PRODUCTS, withBoth)

    expect(resultOriginOnly.length).toBeGreaterThanOrEqual(resultBoth.length)
  })
})

describe('기존 이름 기반 필터 호환성', () => {
  it('Storage: 코드 없이 이름만 있으면 이름 기반 필터링', () => {
    const conditions: SearchConditions = {
      storageLocation: '제주', // 이름 기반
    }

    const result = filterStorageByConditions(STORAGE_PRODUCTS, conditions)

    // "제주"가 포함된 상품 모두 매칭
    const names = result.map(p => p.location.name)
    names.forEach(name => {
      expect(name.toLowerCase()).toContain('제주')
    })
  })

  it('Route: 코드 없이 이름만 있으면 이름 기반 필터링', () => {
    const conditions: SearchConditions = {
      origin: '서귀포', // 이름 기반
    }

    const result = filterRouteByConditions(ROUTE_PRODUCTS, conditions)
    const origins = result.map(p => p.origin.name)

    // 서귀포 출발 경로만
    expect(origins.every(name => name.includes('서귀포'))).toBe(true)
  })
})
