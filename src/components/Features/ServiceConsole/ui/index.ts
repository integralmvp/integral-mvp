// ServiceConsole UI 컴포넌트 통합 export
// 3행 그리드 레이아웃 재설계 컴포넌트
export { default as GridCell } from './GridCell'
export { default as CargoSummaryCard, CargoCarousel, CargoAddButton } from './CargoSummaryCard'
export { default as SlotCounter } from './SlotCounter'
export { default as ResetButton } from './ResetButton'

// 화물 등록/물량/조건 입력 컴포넌트
export { default as CargoRegistrationCard } from './CargoRegistrationCard'
export { default as QuantityInputCard } from './QuantityInputCard'
export { default as LocationDropdown } from './LocationDropdown'
export { default as DatePicker } from './DatePicker'
export { default as ConversionResult } from './ConversionResult'

// PR4: 검색 결과 리스트 (모달 아님)
export { default as SearchResultList } from './SearchResultList'

// PR7: 거래 페이지 (모달 아님)
export { default as DealPage } from './DealPage'

// 모달 컴포넌트는 ../modals 에서 import 하세요
// InputModal, SearchResultModal, ProductDetailModal → ServiceConsole/modals/
