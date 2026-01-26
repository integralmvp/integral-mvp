// 화물 요약 카드 - 세로 배치 (캐러셀용)
import { useState } from 'react'
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

  const moduleLabel = cargo.moduleType === 'UNCLASSIFIED' ? '비표준' : cargo.moduleType

  if (compact) {
    // 캐러셀용 컴팩트 카드
    return (
      <div className="flex-shrink-0 w-[52px] h-[52px] p-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold text-slate-700">{index + 1}</span>
        <span className="text-[9px] text-slate-600 truncate w-full text-center">{moduleLabel}</span>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(cargo.id)
            }}
            className="text-[8px] text-slate-400 hover:text-red-500"
          >
            삭제
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative flex-shrink-0 w-[90px] h-full py-2 px-2 bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* 순번 및 삭제 */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-slate-700">{index + 1}</span>
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

      {/* 세로 정보 배치 */}
      <div className="space-y-0.5 text-center">
        {/* 모듈 타입 */}
        <div className="text-xs font-semibold text-slate-800">
          {moduleLabel}모듈
        </div>

        {/* 품목 */}
        <div className="text-[10px] text-slate-600 truncate">
          {category?.name}{subCategory ? `>${subCategory.name}` : ''}
        </div>

        {/* 중량 */}
        <div className="text-[10px] text-slate-500">
          {weight?.label}
        </div>
      </div>
    </div>
  )
}

// 캐러셀 컨테이너 컴포넌트 - 콘텐츠만 (추가 버튼은 GridCell headerAction으로 이동)
interface CargoCarouselProps {
  cargos: RegisteredCargo[]
  onRemove: (cargoId: string) => void
  colorScheme?: 'blue' | 'emerald' | 'purple'
}

export function CargoCarousel({
  cargos,
  onRemove,
  colorScheme = 'blue',
}: CargoCarouselProps) {
  const [page, setPage] = useState(0)
  const itemsPerPage = 3
  const totalPages = Math.max(1, Math.ceil(cargos.length / itemsPerPage))

  const visibleCargos = cargos.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
  const hasMore = totalPages > 1

  const colorMap = {
    blue: 'text-blue-600 hover:bg-blue-100',
    emerald: 'text-emerald-600 hover:bg-emerald-100',
    purple: 'text-purple-600 hover:bg-purple-100',
  }

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPage((prev) => (prev + 1) % totalPages)
  }

  if (cargos.length === 0) {
    return (
      <span className="text-slate-400 text-xs">화물을 추가해주세요</span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {/* 카드들 - 좌측 정렬 */}
      <div className="flex items-center gap-1">
        {visibleCargos.map((cargo, idx) => (
          <CargoSummaryCard
            key={cargo.id}
            cargo={cargo}
            index={page * itemsPerPage + idx}
            onRemove={onRemove}
            compact
          />
        ))}
      </div>

      {/* 페이지 네비게이션 */}
      {hasMore && (
        <button
          onClick={handleNextPage}
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded ${colorMap[colorScheme]} transition-colors`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

// 추가 버튼 컴포넌트 (GridCell headerAction 용)
interface CargoAddButtonProps {
  onClick: () => void
  colorScheme?: 'blue' | 'emerald' | 'purple'
}

export function CargoAddButton({ onClick, colorScheme = 'blue' }: CargoAddButtonProps) {
  const colorMap = {
    blue: 'text-blue-600 hover:bg-blue-100',
    emerald: 'text-emerald-600 hover:bg-emerald-100',
    purple: 'text-purple-600 hover:bg-purple-100',
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`text-[10px] font-semibold ${colorMap[colorScheme]} px-1.5 py-0.5 rounded transition-colors`}
    >
      +추가
    </button>
  )
}
