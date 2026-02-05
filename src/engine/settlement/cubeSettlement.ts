// ============================================
// INTEGRAL MVP - 정산 엔진 (큐브 단가 기반)
// ============================================
// PR7: 큐브 거래 엔진 고도화
// 순수 함수만 사용 (React import 금지)

/**
 * calcWeightCubes
 *
 * 중량을 큐브로 환산
 * @param totalWeightKg - 총 중량 (kg)
 * @param maxKgPerCube - 1 Cube당 최대 허용 중량 (kg)
 * @returns 중량 기준 큐브 수 (정수, 올림)
 */
export function calcWeightCubes(totalWeightKg: number, maxKgPerCube: number): number {
  if (totalWeightKg <= 0 || maxKgPerCube <= 0) {
    return 0
  }
  return Math.ceil(totalWeightKg / maxKgPerCube)
}

/**
 * BillableCubesResult
 *
 * 정산 큐브 계산 결과
 */
export interface BillableCubesResult {
  volumeCubes: number       // 부피 기반 큐브 (실질 큐브)
  weightCubes: number       // 중량 환산 큐브
  billableCubes: number     // 최종 과금 큐브 = max(volumeCubes, weightCubes)
  weightSurchargeApplied: boolean  // 중량 보정 적용 여부
}

/**
 * calcBillableCubes
 *
 * 최종 과금 큐브 계산 (중량 보정 포함)
 * @param volumeCubes - 부피 기반 큐브 수
 * @param totalWeightKg - 총 중량 (kg)
 * @param maxKgPerCube - 1 Cube당 최대 허용 중량 (kg)
 * @returns BillableCubesResult
 */
export function calcBillableCubes(
  volumeCubes: number,
  totalWeightKg: number,
  maxKgPerCube: number
): BillableCubesResult {
  const weightCubes = calcWeightCubes(totalWeightKg, maxKgPerCube)
  const billableCubes = Math.max(volumeCubes, weightCubes)
  const weightSurchargeApplied = weightCubes > volumeCubes

  return {
    volumeCubes,
    weightCubes,
    billableCubes,
    weightSurchargeApplied,
  }
}

/**
 * calcBaseAmount
 *
 * 기본 금액 계산 (큐브 단가 × 과금 큐브)
 * @param billableCubes - 최종 과금 큐브 수
 * @param unitPricePerCube - 큐브 당 단가 (₩/Cube)
 * @returns 기본 금액 (₩)
 */
export function calcBaseAmount(billableCubes: number, unitPricePerCube: number): number {
  return billableCubes * unitPricePerCube
}

/**
 * OptionSurcharge
 *
 * 부가 옵션 정보
 */
export interface OptionSurcharge {
  id: string
  name: string
  amount: number
}

/**
 * calcOptionSurcharges
 *
 * 부가 옵션 비용 계산
 * MVP: 더미 구현 (확장 포인트만 마련)
 * @param options - 선택된 옵션 목록
 * @returns 옵션 총액 (₩)
 */
export function calcOptionSurcharges(options: OptionSurcharge[]): number {
  // MVP: 단순 합산
  return options.reduce((sum, opt) => sum + opt.amount, 0)
}

/**
 * EstimatedTotalResult
 *
 * 정산 총액 결과
 */
export interface EstimatedTotalResult {
  base: number              // 기본 금액 (큐브 단가 × 과금 큐브)
  options: number           // 부가 옵션 총액
  total: number             // 최종 총액
  breakdown: {
    label: string
    amount: number
  }[]                       // 상세 내역
}

/**
 * calcEstimatedTotal
 *
 * 정산 총액 계산 (breakdown 포함)
 * @param billableCubes - 최종 과금 큐브 수
 * @param unitPricePerCube - 큐브 당 단가 (₩/Cube)
 * @param options - 선택된 옵션 목록
 * @param volumeCubes - 부피 기반 큐브 (breakdown용)
 * @param weightCubes - 중량 환산 큐브 (breakdown용)
 * @returns EstimatedTotalResult
 */
export function calcEstimatedTotal(
  billableCubes: number,
  unitPricePerCube: number,
  options: OptionSurcharge[] = [],
  volumeCubes?: number,
  weightCubes?: number
): EstimatedTotalResult {
  const base = calcBaseAmount(billableCubes, unitPricePerCube)
  const optionsTotal = calcOptionSurcharges(options)
  const total = base + optionsTotal

  // breakdown 구성
  const breakdown: { label: string; amount: number }[] = []

  // 기본 금액 상세
  if (volumeCubes !== undefined && weightCubes !== undefined) {
    breakdown.push({
      label: `부피 큐브 ${volumeCubes}개`,
      amount: 0, // 정보성
    })
    breakdown.push({
      label: `중량 큐브 ${weightCubes}개`,
      amount: 0, // 정보성
    })
  }

  breakdown.push({
    label: `과금 큐브 ${billableCubes}개 × ₩${unitPricePerCube.toLocaleString()}`,
    amount: base,
  })

  // 옵션 상세
  options.forEach((opt) => {
    breakdown.push({
      label: opt.name,
      amount: opt.amount,
    })
  })

  return {
    base,
    options: optionsTotal,
    total,
    breakdown,
  }
}

/**
 * calcStorageEstimate
 *
 * Storage 상품 정산 (일수 × 큐브 단가)
 * @param billableCubes - 최종 과금 큐브 수
 * @param unitPricePerCube - 큐브 당 일일 단가 (₩/Cube/일)
 * @param days - 보관 일수
 * @param options - 선택된 옵션 목록
 * @returns EstimatedTotalResult
 */
export function calcStorageEstimate(
  billableCubes: number,
  unitPricePerCube: number,
  days: number,
  options: OptionSurcharge[] = []
): EstimatedTotalResult {
  const dailyBase = calcBaseAmount(billableCubes, unitPricePerCube)
  const base = dailyBase * days
  const optionsTotal = calcOptionSurcharges(options)
  const total = base + optionsTotal

  const breakdown: { label: string; amount: number }[] = [
    {
      label: `과금 큐브 ${billableCubes}개 × ₩${unitPricePerCube.toLocaleString()} × ${days}일`,
      amount: base,
    },
  ]

  options.forEach((opt) => {
    breakdown.push({
      label: opt.name,
      amount: opt.amount,
    })
  })

  return {
    base,
    options: optionsTotal,
    total,
    breakdown,
  }
}
