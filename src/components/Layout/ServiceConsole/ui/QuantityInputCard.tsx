// 물량 입력 카드 컴포넌트 - 등록된 화물별 수량 입력 및 큐브 환산
import { useState } from 'react'
import type { RegisteredCargo } from '../../../../types/models'
import { computeDemand, type BoxInput } from '../../../../engine'
import { PRODUCT_CATEGORIES, WEIGHT_RANGES } from '../../../../data/mockData'

interface QuantityInputCardProps {
  cargo: RegisteredCargo
  onQuantityChange: (cargoId: string, quantity: number, estimatedCubes: number) => void
}

export default function QuantityInputCard({
  cargo,
  onQuantityChange,
}: QuantityInputCardProps) {
  const [quantity, setQuantity] = useState<number>(cargo.quantity || 0)
  const [confirmed, setConfirmed] = useState(cargo.quantity !== undefined && cargo.quantity > 0)

  const category = PRODUCT_CATEGORIES.find(c => c.code === cargo.productCategory)
  const subCategory = category?.subCategories?.find(s => s.code === cargo.productSubCategory)
  const weightLabel = WEIGHT_RANGES.find(w => w.value === cargo.weightRange)?.label

  // 큐브 환산 계산
  const calculateCubes = (qty: number): number => {
    if (qty <= 0) return 0

    const boxInput: BoxInput = {
      widthMm: cargo.width,
      depthMm: cargo.depth,
      heightMm: cargo.height,
      count: qty,
    }

    const result = computeDemand([boxInput], 'ROUTE')
    return result.demandCubes
  }

  const estimatedCubes = calculateCubes(quantity)

  const handleConfirm = () => {
    if (quantity > 0) {
      setConfirmed(true)
      onQuantityChange(cargo.id, quantity, estimatedCubes)
    }
  }

  const handleEdit = () => {
    setConfirmed(false)
  }

  return (
    <div className={`rounded-lg p-4 ${confirmed ? 'bg-green-50 border-2 border-green-300' : 'bg-slate-50 border border-slate-200'}`}>
      {/* 화물 정보 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">
            {cargo.cargoNumber}
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-800">
              {cargo.moduleType !== 'UNCLASSIFIED' ? `${cargo.moduleType} 모듈` : '비표준 규격'}
            </div>
            <div className="text-xs text-slate-500">
              {cargo.width}×{cargo.depth}×{cargo.height}mm
            </div>
          </div>
        </div>
        {confirmed && (
          <button
            onClick={handleEdit}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            수정
          </button>
        )}
      </div>

      {/* 상세 정보 태그 */}
      <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded">
          {category?.name}{subCategory ? ` > ${subCategory.name}` : ''}
        </span>
        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded">
          {weightLabel}
        </span>
      </div>

      {/* 수량 입력 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">수량</label>
          <input
            type="number"
            min="0"
            value={quantity || ''}
            onChange={(e) => {
              setQuantity(Number(e.target.value))
              setConfirmed(false)
            }}
            onWheel={(e) => e.currentTarget.blur()}
            disabled={confirmed}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100"
            placeholder="수량 입력"
          />
          <span className="text-sm text-slate-600">개</span>
        </div>

        {/* 확인 버튼 */}
        {!confirmed && quantity > 0 && (
          <button
            onClick={handleConfirm}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors"
          >
            수량 확정
          </button>
        )}

        {confirmed && (
          <div className="text-center text-xs text-green-600 font-semibold">
            ✓ 수량 입력 완료
          </div>
        )}
      </div>
    </div>
  )
}
