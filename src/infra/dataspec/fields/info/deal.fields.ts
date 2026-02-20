/**
 * INFO_DEAL 최소 필드 스키마
 * (스텁 - PR7+ 에서 구체화)
 */

export interface DealFields {
  demandId: string
  billableCubes?: number
  unitPricePerCube?: number
  totalCost: number
}
