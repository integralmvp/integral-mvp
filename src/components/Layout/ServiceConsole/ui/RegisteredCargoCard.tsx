// 등록된 화물 카드 컴포넌트 - 화물 등록 완료 후 표시
import type { RegisteredCargo } from '../../../../types/models'
import { PRODUCT_CATEGORIES, WEIGHT_RANGES } from '../../../../data/mockData'

interface RegisteredCargoCardProps {
  cargo: RegisteredCargo
  showQuantity?: boolean
}

export default function RegisteredCargoCard({
  cargo,
  showQuantity = false,
}: RegisteredCargoCardProps) {
  const category = PRODUCT_CATEGORIES.find(c => c.code === cargo.productCategory)
  const subCategory = category?.subCategories?.find(s => s.code === cargo.productSubCategory)
  const weightLabel = WEIGHT_RANGES.find(w => w.value === cargo.weightRange)?.label

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-start justify-between">
        {/* 화물 번호 뱃지 */}
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

        {/* 물량 표시 (있을 경우) */}
        {showQuantity && cargo.quantity !== undefined && (
          <div className="text-right">
            <div className="text-sm font-bold text-blue-600">{cargo.quantity}개</div>
            {cargo.estimatedCubes && (
              <div className="text-xs text-slate-500">{cargo.estimatedCubes} 큐브</div>
            )}
          </div>
        )}
      </div>

      {/* 상세 정보 */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
          {category?.name}{subCategory ? ` > ${subCategory.name}` : ''}
        </span>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
          {weightLabel}
        </span>
      </div>
    </div>
  )
}
