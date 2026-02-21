/**
 * Mock Builders
 * INFO_OFFER → UI DTO 변환 함수
 *
 * 현재는 목업 데이터가 이미 UI DTO 형식이므로 pass-through.
 * PR8+ (DB 연동) 이후 실제 변환 로직 구체화 예정.
 *
 * 변환 원칙:
 * - price 필드는 unitPricePerCube × capacityCubes에서 파생 (표시용 only)
 * - 모든 거래/필터 로직은 unitPricePerCube, capacityCubes, remainingCubes 사용
 */

export type { StorageProduct, RouteProduct } from '../../../types/models'

/**
 * StorageProduct UI DTO 검증 헬퍼
 * unitPricePerCube가 SoT인지 확인 (개발용)
 */
export function assertOfferSoT(offer: { unitPricePerCube: number; capacityCubes: number }): void {
  if (!offer.unitPricePerCube || !offer.capacityCubes) {
    throw new Error('[CDS] Offer must have unitPricePerCube and capacityCubes (SoT fields)')
  }
}
