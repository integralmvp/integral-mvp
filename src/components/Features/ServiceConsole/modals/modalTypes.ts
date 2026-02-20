/**
 * Modal Types - 모달 키 및 페이로드 타입 정의
 * (라우트 모달 인터페이스 준비 - 실제 라우팅은 PR7+ 이후)
 */

export type ModalKey =
  | 'INPUT'           // 화물 입력 모달
  | 'SEARCH_RESULT'   // 검색 결과 모달
  | 'PRODUCT_DETAIL'  // 상품 상세 모달

// 각 모달별 페이로드 타입 (확장 포인트)
export interface ModalPayload {
  INPUT: { field?: string }
  SEARCH_RESULT: Record<string, never>
  PRODUCT_DETAIL: { productId: string; mode: 'STORAGE' | 'ROUTE' }
}
