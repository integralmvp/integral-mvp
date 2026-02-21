/**
 * UI Types - ProductCard
 * 상품 카드 UI 전용 타입
 */

export interface ProductCardProps {
  id: string
  title: string
  subtitle?: string
  price: number
  priceUnit: string
  badges?: string[]
  onClick?: () => void
}
