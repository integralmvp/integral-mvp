/**
 * 관리자 견적 상태/파생 훅
 *
 * 계산은 전부 engine/cubeCoordinate 순수함수 호출로 파생 (JSX 내 계산 금지 원칙).
 * 저장/목록은 adminQuote.repo(localStorage, admin:quote:*) 경유 — direct 계산 재구현 없음.
 */

import { useMemo, useState, useCallback } from 'react'
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
  item: string // 품목 (옵션)
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

export interface AdminQuoteDerived {
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
  const [quotes, setQuotes] = useState<AdminQuoteRecord[]>(() => getAllAdminQuotes())

  const setField = useCallback(<K extends keyof AdminQuoteForm>(key: K, value: AdminQuoteForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  // 실시간 파생: 입력 4제원이 모두 유효할 때만 엔진 호출
  const derived: AdminQuoteDerived | null = useMemo(() => {
    const L = parsePositive(form.lengthMm)
    const W = parsePositive(form.widthMm)
    const H = parsePositive(form.heightMm)
    const kg = parsePositive(form.weightKg)
    if (L === null || W === null || H === null || kg === null) return null

    const count = parsePositive(form.vehicleCount) ?? 1
    const cargo = cargoCubes(L, W, H, kg)
    const match = matchVehicle(cargo, VEHICLE_DB)
    const rejected = rejectedVehicles(cargo, VEHICLE_DB)
    // 품목은 검증된 드롭다운 값(정확일치) — 빈 값이면 세부/표준행 fallback
    const quoteResult = match.vehicle
      ? quote(RATE_TABLE, form.region, match.vehicle, count, form.item || undefined)
      : null

    return { cargo, match, rejected, quoteResult, count }
  }, [form])

  const canSave =
    derived !== null &&
    derived.match.matched &&
    derived.quoteResult !== null &&
    !derived.quoteResult.단가미등록

  const handleSave = useCallback(() => {
    if (!derived || !derived.match.vehicle || !derived.quoteResult) return
    const { 견적가, 큐브당 } = derived.quoteResult
    if (견적가 === null || 큐브당 === null) return // 단가 미등록 견적은 저장 불가
    saveAdminQuote({
      cargo: {
        length_mm: Number(form.lengthMm),
        width_mm: Number(form.widthMm),
        height_mm: Number(form.heightMm),
        weight_kg: Number(form.weightKg),
        ...derived.cargo,
        거래처: form.client || undefined,
        품목: form.item || undefined,
      },
      matched_vehicle_id: derived.match.vehicle.id,
      matched_vehicle_name: derived.match.vehicle.name,
      reject_summary: derived.rejected.map(r => ({
        vehicle_name: r.vehicle.name,
        reasons: r.reasons,
      })),
      권역: form.region,
      대수: derived.count,
      청구큐브: derived.quoteResult.청구큐브,
      큐브당,
      견적가,
    })
    setQuotes([...getAllAdminQuotes()])
  }, [derived, form])

  const handleDelete = useCallback((id: string) => {
    deleteAdminQuote(id)
    setQuotes([...getAllAdminQuotes()])
  }, [])

  return { form, setField, derived, canSave, handleSave, quotes, handleDelete }
}
