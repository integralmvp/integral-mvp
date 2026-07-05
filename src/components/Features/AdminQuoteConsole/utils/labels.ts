// 초과사유 코드 → 표시 라벨 (엔진 ExceedReason 코드를 UI 서사로 변환)
import type { ExceedReason } from '../../../../engine/cubeCoordinate'

export const REASON_LABELS: Record<ExceedReason, string> = {
  LINE: '선초과',
  AREA: '면초과',
  VOLUME: '공간초과',
  WEIGHT: '중량초과',
  NO_AVAILABLE_VEHICLE: '적합 차량 없음',
}

export function formatWon(value: number): string {
  return value.toLocaleString('ko-KR')
}

/** 탈락 차종 요약 문자열 (예: "1t~3.5t 선초과") — 연속 구간·동일 사유일 때 압축 */
export function summarizeRejected(
  rejected: { vehicle_name: string; reasons: ExceedReason[] }[]
): string | null {
  if (rejected.length === 0) return null
  const first = rejected[0]
  const last = rejected[rejected.length - 1]
  const allSameReasons = rejected.every(
    r => r.reasons.join(',') === first.reasons.join(','),
  )
  const range =
    rejected.length === 1 ? first.vehicle_name : `${first.vehicle_name}~${last.vehicle_name}`
  if (allSameReasons) {
    return `${range} ${first.reasons.map(r => REASON_LABELS[r]).join('·')}`
  }
  return rejected
    .map(r => `${r.vehicle_name} ${r.reasons.map(x => REASON_LABELS[x]).join('·')}`)
    .join(', ')
}
