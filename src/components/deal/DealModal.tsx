// 거래 모달 메인 컴포넌트
import { useState } from 'react'
import type {
  RouteProduct,
  StorageProduct,
  UnitLoadModule,
  HandlingOption,
} from '../../types/models'
import Modal from '../common/Modal'
import ProductSummary from './ProductSummary'
import CargoConditionForm from './CargoConditionForm'
import RegulationMatchResult from './RegulationMatchResult'
import CostEstimate from './CostEstimate'

interface DealModalProps {
  isOpen: boolean
  onClose: () => void
  product: RouteProduct | StorageProduct | null
  productType: 'route' | 'storage'
  onBookingSuccess: () => void
}

export default function DealModal({
  isOpen,
  onClose,
  product,
  productType,
  onBookingSuccess,
}: DealModalProps) {
  const [unitLoadModule, setUnitLoadModule] = useState<UnitLoadModule>('대형')
  const [handlingOptions, setHandlingOptions] = useState<HandlingOption[]>([])
  const [quantity, setQuantity] = useState(4)

  if (!product) return null

  const handleHandlingOptionToggle = (option: HandlingOption) => {
    setHandlingOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    )
  }

  const handleBooking = () => {
    onBookingSuccess()
    onClose()
    // 상태 초기화
    setUnitLoadModule('대형')
    setHandlingOptions([])
    setQuantity(4)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="거래하기">
      <div className="space-y-6">
        {/* 선택 상품 요약 */}
        <ProductSummary product={product} productType={productType} />

        {/* 화물 조건 입력 */}
        <CargoConditionForm
          unitLoadModule={unitLoadModule}
          handlingOptions={handlingOptions}
          quantity={quantity}
          onUnitLoadChange={setUnitLoadModule}
          onHandlingOptionToggle={handleHandlingOptionToggle}
          onQuantityChange={setQuantity}
        />

        {/* 규정 매칭 결과 (PR2: 더미) */}
        <RegulationMatchResult />

        {/* 예상 비용 (PR2: 기본가만) */}
        <CostEstimate basePrice={product.price} />

        {/* 예약 요청 버튼 */}
        <div className="pt-4">
          <button
            onClick={handleBooking}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
          >
            📝 예약 요청 (데모)
          </button>
        </div>
      </div>
    </Modal>
  )
}
