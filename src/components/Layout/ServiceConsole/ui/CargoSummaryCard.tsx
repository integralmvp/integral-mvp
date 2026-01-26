// 화물 요약 카드 - 그리드 셀 내부 표시용
import type { RegisteredCargo } from '../../../../types/models'
import { PRODUCT_CATEGORIES, WEIGHT_RANGES } from '../../../../data/mockData'

interface CargoSummaryCardProps {
  cargo: RegisteredCargo
  index: number
  onRemove?: (cargoId: string) => void
  compact?: boolean
}

export default function CargoSummaryCard({
  cargo,
  index,
  onRemove,
  compact = false,
}: CargoSummaryCardProps) {
  const category = PRODUCT_CATEGORIES.find(c => c.code === cargo.productCategory)
  const subCategory = category?.subCategories?.find(s => s.code === cargo.productSubCategory)
  const weight = WEIGHT_RANGES.find(w => w.value === cargo.weightRange)

  if (compact) {
    return (
      <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500">{index + 1}</span>
          <span className="text-xs text-slate-700">{cargo.moduleType}</span>
          <span className="text-[10px] text-slate-500">{category?.name}</span>
        </div>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(cargo.id)
            }}
            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative py-2 px-3 bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* 순번 및 삭제 */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-700">{index + 1}</span>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(cargo.id)
            }}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 모듈 타입 */}
      <div className="text-sm font-semibold text-slate-800">
        {cargo.moduleType === 'UNCLASSIFIED' ? '비표준' : cargo.moduleType}모듈
      </div>

      {/* 품목 */}
      <div className="text-xs text-slate-600 mt-0.5">
        {category?.name}{subCategory ? ` > ${subCategory.name}` : ''}
      </div>

      {/* 중량 */}
      <div className="text-[10px] text-slate-500 mt-0.5">
        {weight?.label}
      </div>
    </div>
  )
}
