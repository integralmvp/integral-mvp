/**
 * z-index 레이어 계층 상수 (단일 진실 소스)
 *
 * 레이어 정책 (Tailwind 클래스 기준):
 * - OVERLAY (40):      배경 오버레이 (어두운 배경) → z-40
 * - MODAL (50):        일반 모달 (InputModal, ProductDetailModal, SearchResultModal) → z-50
 * - MODAL_TOP (60):    최상위 모달 1단계 (계약서 동의 모달) → z-[60]
 * - MODAL_SUPER (70):  최상위 모달 2단계 (거래 확정 확인 카드) → z-[70]
 * - DROPDOWN (50):     드롭다운 (InputModal 내부이므로 z-50 동일)
 *
 * 지도 팝업: z-index 60 (MapboxContainer style 태그에 직접 설정 — Mapbox 내부 이슈)
 */
export const Z_INDEX = {
  OVERLAY: 40,
  MODAL: 50,
  MODAL_TOP: 60,
  MODAL_SUPER: 70,
  DROPDOWN: 50,
} as const

export type ZIndexKey = keyof typeof Z_INDEX
