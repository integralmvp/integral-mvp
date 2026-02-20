/**
 * PLATFORM_WEIGHT_BANDS v0.1 & SIZE_BANDS v0.1
 * 플랫폼 표준 중량/사이즈 밴드
 *
 * - Cargo signature에 저장 (단일)
 * - 매칭/필터/집계용 분류 키
 */

// 중량 밴드 타입
export type WeightBand = 'WBX' | 'WBY' | 'WBZ' | 'WBH'

// 사이즈 밴드 타입
export type SizeBand = 'SB1' | 'SB2' | 'SB3' | 'SB4' | 'SBX'

/**
 * 중량 밴드 정의
 */
export const WEIGHT_BAND_DEFINITIONS: Record<WeightBand, { label: string; min: number; max: number | null }> = {
  WBX: { label: '초경량 (≤5kg)', min: 0, max: 5 },
  WBY: { label: '경량 (≤20kg)', min: 5, max: 20 },
  WBZ: { label: '중량 (≤30kg)', min: 20, max: 30 },
  WBH: { label: '중량물 (>30kg)', min: 30, max: null },
}

/**
 * 사이즈 밴드 정의 (3변합 기준)
 */
export const SIZE_BAND_DEFINITIONS: Record<SizeBand, { label: string; min: number; max: number | null }> = {
  SB1: { label: '소형 (≤80cm)', min: 0, max: 80 },
  SB2: { label: '표준 (≤120cm)', min: 80, max: 120 },
  SB3: { label: '중형 (≤160cm)', min: 120, max: 160 },
  SB4: { label: '대형 (≤170cm)', min: 160, max: 170 },
  SBX: { label: '특대형 (>170cm)', min: 170, max: null },
}

/**
 * 중량(kg)으로 중량 밴드 계산
 */
export function getWeightBand(weightKg: number): WeightBand {
  if (weightKg <= 0 || Number.isNaN(weightKg)) return 'WBX'
  if (weightKg <= 5) return 'WBX'
  if (weightKg <= 20) return 'WBY'
  if (weightKg <= 30) return 'WBZ'
  return 'WBH'
}

/**
 * 3변합(cm)으로 사이즈 밴드 계산
 */
export function getSizeBand(sumCm: number): SizeBand {
  if (sumCm <= 0 || Number.isNaN(sumCm)) return 'SB1'
  if (sumCm <= 80) return 'SB1'
  if (sumCm <= 120) return 'SB2'
  if (sumCm <= 160) return 'SB3'
  if (sumCm <= 170) return 'SB4'
  return 'SBX'
}

/**
 * 중량 밴드 라벨 조회
 */
export function getWeightBandLabel(band: WeightBand): string {
  return WEIGHT_BAND_DEFINITIONS[band].label
}

/**
 * 사이즈 밴드 라벨 조회
 */
export function getSizeBandLabel(band: SizeBand): string {
  return SIZE_BAND_DEFINITIONS[band].label
}

/**
 * mm 단위 규격에서 3변합(cm) 계산
 */
export function calculateSumCm(widthMm: number, depthMm: number, heightMm: number): number {
  return (widthMm + depthMm + heightMm) / 10
}

/**
 * 규격(mm)에서 사이즈 밴드 직접 계산
 */
export function getSizeBandFromDims(widthMm: number, depthMm: number, heightMm: number): SizeBand {
  const sumCm = calculateSumCm(widthMm, depthMm, heightMm)
  return getSizeBand(sumCm)
}
