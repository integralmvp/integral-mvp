/**
 * localStorage Key 상수
 *
 * 모든 localStorage 키를 중앙 관리
 * 키 충돌 방지 및 일관성 유지
 */

// 앱 prefix
const APP_PREFIX = 'integral_mvp'

// 버전 (스키마 변경 시 증가)
const VERSION = 'v1'

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  // 화물 데이터
  CARGOS: `${APP_PREFIX}_${VERSION}_cargos`,

  // 수요 세션 데이터
  DEMANDS: `${APP_PREFIX}_${VERSION}_demands`,

  // 현재 활성 수요 세션 (탭별)
  ACTIVE_DEMAND_STORAGE: `${APP_PREFIX}_${VERSION}_active_demand_storage`,
  ACTIVE_DEMAND_ROUTE: `${APP_PREFIX}_${VERSION}_active_demand_route`,
  ACTIVE_DEMAND_BOTH: `${APP_PREFIX}_${VERSION}_active_demand_both`,

  // 이벤트 로그
  EVENTS: `${APP_PREFIX}_${VERSION}_events`,

  // 설정
  SETTINGS: `${APP_PREFIX}_${VERSION}_settings`,
} as const

/**
 * 탭별 활성 수요 세션 키 조회
 */
export function getActiveDemandKey(serviceType: 'STORAGE' | 'ROUTE' | 'BOTH'): string {
  switch (serviceType) {
    case 'STORAGE':
      return STORAGE_KEYS.ACTIVE_DEMAND_STORAGE
    case 'ROUTE':
      return STORAGE_KEYS.ACTIVE_DEMAND_ROUTE
    case 'BOTH':
      return STORAGE_KEYS.ACTIVE_DEMAND_BOTH
  }
}

/**
 * 모든 데이터 초기화 (개발용)
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}

/**
 * 데이터 내보내기 (디버깅용)
 */
export function exportAllData(): Record<string, unknown> {
  const data: Record<string, unknown> = {}

  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        data[name] = JSON.parse(raw)
      } catch {
        data[name] = raw
      }
    }
  })

  return data
}
