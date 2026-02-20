/**
 * INFO_DEMAND_SESSION 최소 필드 스키마
 * (스텁 - PR7+ 에서 구체화)
 */

export interface DemandSessionFields {
  serviceType: 'STORAGE' | 'ROUTE' | 'BOTH'
  totalCubes?: number
  totalPallets?: number
}
