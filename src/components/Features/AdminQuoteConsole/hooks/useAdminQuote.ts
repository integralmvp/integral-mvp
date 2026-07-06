/**
 * 관리자 견적 상태 훅 — 명시적 "조회" 트리거 방식
 *
 * 입력 상태(form)와 조회 결과 상태(result)를 분리한다.
 * 계산은 runQuote() 액션에서만 engine/cubeCoordinate 순수함수를 호출해 수행하며,
 * 결과에는 조회 시점의 입력 스냅샷을 함께 담아 이후 입력 변경과 어긋나지 않게 한다.
 * 저장/목록은 adminQuote.repo(localStorage, admin:quote:*) 경유 — 계산 재구현 없음.
 */

import { useState, useCallback } from 'react'
import {
  cargoCubes,
  matchVehicle,
  rejectedVehicles,
  quote,
  VEHICLE_DB,
  RATE_TABLE,
} from '../../../../engine/cubeCoordinate'
import type {
  CargoCubes,
  MatchResult,
  RejectedVehicle,
  QuoteResult,
  Region,
} from '../../../../engine/cubeCoordinate'
import {
  getAllAdminQuotes,
  saveAdminQuote,
  deleteAdminQuote,
} from '../../../../infra/storage/info/adminQuote.repo'
import type { AdminQuoteRecord } from '../../../../infra/storage/info/adminQuote.repo'

export interface AdminQuoteForm {
  lengthMm: string
  widthMm: string
  heightMm: string
  weightKg: string
  region: Region
  vehicleCount: string
  client: string // 거래처 (옵션)
  item: string // 품목 (검증된 드롭다운 값)
}

const INITIAL_FORM: AdminQuoteForm = {
  lengthMm: '',
  widthMm: '',
  heightMm: '',
  weightKg: '',
  region: '시내',
  vehicleCount: '1',
  client: '',
  item: '',
}

/** 조회 시점의 계산 입력 스냅샷 (이후 입력 변경과 결과의 정합 유지) */
export interface AdminQuoteInput {
  lengthMm: number
  widthMm: number
  heightMm: number
  weightKg: number
  region: Region
  item: string
}

export interface AdminQuoteDerived {
  input: AdminQuoteInput
  cargo: CargoCubes
  match: MatchResult
  rejected: RejectedVehicle[]
  quoteResult: QuoteResult | null
  count: number
}

function parsePositive(value: string): number | null {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function useAdminQuote() {
  const [form, setForm] = useState<AdminQuoteForm>(INITIAL_FORM)
  const [result, setResult] = useState<AdminQuoteDerived | null>(null)
  const [quotes, setQuotes] = useState<AdminQuoteRecord[]>(() => getAllAdminQuotes())

  const setField = useCallback(<K extends keyof AdminQuoteForm>(key: K, value: AdminQuoteForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  // 필수 4제원이 모두 유효해야 조회 가능
  const canRun =
    parsePositive(form.lengthMm) !== null &&
    parsePositive(form.widthMm) !== null &&
    parsePositive(form.heightMm) !== null &&
    parsePositive(form.weightKg) !== null

  /** 견적 조회 — 이 액션에서만 엔진 호출 (입력 도중 자동 계산 없음) */
  const runQuote = useCallback(() => {
    const L = parsePositive(form.lengthMm)
    const W = parsePositive(form.widthMm)
    const H = parsePositive(form.heightMm)
    const kg = parsePositive(form.weightKg)
    if (L === null || W === null || H === null || kg === null) return

    const count = parsePositive(form.vehicleCount) ?? 1
    const cargo = cargoCubes(L, W, H, kg)
    const match = matchVehicle(cargo, VEHICLE_DB)
    const rejected = rejectedVehicles(cargo, VEHICLE_DB)
    // 품목은 검증된 드롭다운 값(정확일치) — 빈 값이면 세부/표준행 fallback
    const quoteResult = match.vehicle
      ? quote(RATE_TABLE, form.region, match.vehicle, count, form.item || undefined)
      : null

    setResult({
      input: { lengthMm: L, widthMm: W, heightMm: H, weightKg: kg, region: form.region, item: form.item },
      cargo,
      match,
      rejected,
      quoteResult,
      count,
    })
  }, [form])

  const canSave =
    result !== null &&
    result.match.matched &&
    result.quoteResult !== null &&
    !result.quoteResult.단가미등록

  /** 견적 저장 — 성공 시 true (호출측에서 리셋 연결) */
  const handleSave = useCallback((): boolean => {
    if (!result || !result.match.vehicle || !result.quoteResult) return false
    const { 견적가, 큐브당 } = result.quoteResult
    if (견적가 === null || 큐브당 === null) return false // 단가 미등록 견적은 저장 불가

    saveAdminQuote({
      cargo: {
        length_mm: result.input.lengthMm,
        width_mm: result.input.widthMm,
        height_mm: result.input.heightMm,
        weight_kg: result.input.weightKg,
        ...result.cargo,
        거래처: form.client || undefined,
        품목: result.input.item || undefined,
      },
      matched_vehicle_id: result.match.vehicle.id,
      matched_vehicle_name: result.match.vehicle.name,
      reject_summary: result.rejected.map(r => ({
        vehicle_name: r.vehicle.name,
        reasons: r.reasons,
      })),
      권역: result.input.region,
      대수: result.count,
      청구큐브: result.quoteResult.청구큐브,
      큐브당,
      견적가,
    })
    setQuotes([...getAllAdminQuotes()])
    return true
  }, [result, form.client])

  const handleDelete = useCallback((id: string) => {
    deleteAdminQuote(id)
    setQuotes([...getAllAdminQuotes()])
  }, [])

  return {
    form,
    setField,
    canRun,
    runQuote,
    result,
    canSave,
    handleSave,
    quotes,
    handleDelete,
  }
}
