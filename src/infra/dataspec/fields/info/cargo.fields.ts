/**
 * INFO_CARGO 최소 필드 스키마
 * (스텁 - PR7+ 에서 구체화)
 */

export interface CargoFields {
  dimsMm: { w: number; d: number; h: number }
  sumCm: number
  weightKg: number
  notes?: string
}
