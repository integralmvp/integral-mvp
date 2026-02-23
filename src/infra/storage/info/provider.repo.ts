/**
 * Provider Repository — localStorage 기반 구현
 *
 * 설계:
 * - 최초 로드 시 localStorage 없으면 PROVIDER_RECORDS → builders → seed 저장
 * - 이후 모든 조회는 in-memory 캐시 기반
 * - Provider 는 MVP에서 변경 없음 (조회 전용)
 */

import type { ProviderInfo } from '../../../types/models'
import { STORAGE_KEYS } from '../keys'
import { buildSeedProviders } from '../../../data/mock/builders'

// ── in-memory 캐시 ───────────────────────────────────────────────────
let _cache: ProviderInfo[] | null = null

// ── 초기화 ──────────────────────────────────────────────────────────

function initIfNeeded(): void {
  if (_cache !== null) return

  const stored = localStorage.getItem(STORAGE_KEYS.PROVIDERS)
  if (stored) {
    try {
      _cache = JSON.parse(stored) as ProviderInfo[]
      return
    } catch {
      console.warn('[provider.repo] localStorage parse error, re-seeding...')
    }
  }

  // 최초 seed
  _cache = buildSeedProviders()
  try {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(_cache))
  } catch (e) {
    console.error('[provider.repo] Failed to persist providers:', e)
  }
}

// ── 조회 ────────────────────────────────────────────────────────────

export function getAllProviders(): ProviderInfo[] {
  initIfNeeded()
  return _cache!
}

export function getProviderById(id: string): ProviderInfo | undefined {
  initIfNeeded()
  return _cache!.find(p => p.id === id)
}

export function getProvidersByServiceType(serviceType: ProviderInfo['serviceType']): ProviderInfo[] {
  initIfNeeded()
  return _cache!.filter(p => p.serviceType === serviceType)
}
