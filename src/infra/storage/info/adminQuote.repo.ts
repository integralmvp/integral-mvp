/**
 * Admin Quote Repository — localStorage 기반 (관리자 견적 MVP 전용)
 *
 * 네임스페이스: admin:quote:* — 기존 integral_mvp_v1_* 키와 완전 분리.
 * 기존 repo(offer/cargo/deal 등)는 미변경, 이 파일은 신규 추가만.
 *
 * 저장 모델: CUBE_MVP_SPEC.md §5 Quote 타입 기준.
 * append-only 누적 (견적 이력) + 삭제만 허용, 수정 없음.
 */

import type { CargoCubes, Region, ExceedReason } from '../../../engine/cubeCoordinate'

const ADMIN_QUOTE_KEY = 'admin:quote:v1:list'

export interface AdminQuoteCargo extends CargoCubes {
  length_mm: number
  width_mm: number
  height_mm: number
  weight_kg: number
  거래처?: string
  품목?: string
}

export interface AdminQuoteRecord {
  id: string
  cargo: AdminQuoteCargo
  matched_vehicle_id: string
  matched_vehicle_name: string
  /** 추천 차종 이전 탈락 차종 요약 (예: "1t~3.5t 선초과") — 표시용 스냅샷 */
  reject_summary: { vehicle_name: string; reasons: ExceedReason[] }[]
  권역: Region
  대수: number
  청구큐브: number
  큐브당: number
  견적가: number
  created_at: string
}

// ── in-memory 캐시 ──────────────────────────────────────────────────
let _cache: AdminQuoteRecord[] | null = null

function initIfNeeded(): void {
  if (_cache !== null) return
  const stored = localStorage.getItem(ADMIN_QUOTE_KEY)
  if (stored) {
    try {
      _cache = JSON.parse(stored) as AdminQuoteRecord[]
      return
    } catch {
      console.warn('[adminQuote.repo] localStorage parse error, resetting...')
    }
  }
  _cache = []
}

function _persist(): void {
  try {
    localStorage.setItem(ADMIN_QUOTE_KEY, JSON.stringify(_cache))
  } catch (e) {
    console.error('[adminQuote.repo] Failed to persist quotes:', e)
  }
}

// ── 조회 / 저장 / 삭제 ──────────────────────────────────────────────

export function getAllAdminQuotes(): AdminQuoteRecord[] {
  initIfNeeded()
  return _cache!
}

export function saveAdminQuote(record: Omit<AdminQuoteRecord, 'id' | 'created_at'>): AdminQuoteRecord {
  initIfNeeded()
  const saved: AdminQuoteRecord = {
    ...record,
    id: `AQ-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
  }
  _cache = [saved, ..._cache!]
  _persist()
  return saved
}

export function deleteAdminQuote(id: string): void {
  initIfNeeded()
  _cache = _cache!.filter(q => q.id !== id)
  _persist()
}
