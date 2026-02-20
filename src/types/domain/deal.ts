/**
 * Domain Types - Deal
 * 거래 도메인 타입 정의
 */

// ============ 사용자 정보 ============
export interface UserInfo {
  id: string
  name: string
  email: string
  phone: string
}

// ============ 거래 상태 ============
export type DealStatus = 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'CANCELLED'

// ============ 거래 옵션 ============
export interface DealOption {
  id: string
  name: string
  description: string
  price: number
  selected: boolean
}

// ============ Deal ============
export interface Deal {
  id: string
  demandId: string
  userId: string

  selectedStorageId?: string
  selectedRouteId?: string

  pickupRequested: boolean
  pickupLocation?: string
  dropoffLocation?: string

  options: DealOption[]

  baseCost: number
  cubeCost: number
  weightCost: number
  optionsCost: number
  totalCost: number
  // PR7 정산 breakdown
  volumeCubes?: number
  weightCubes?: number
  billableCubes?: number
  unitPricePerCube?: number
  weightSurchargeApplied?: boolean

  userMemo?: string

  contractAgreed: boolean
  contractAgreedAt?: string

  status: DealStatus

  createdAt: string
  updatedAt: string
}
