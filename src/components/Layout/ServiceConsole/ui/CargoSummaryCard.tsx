// 화물 요약 카드 - 세로 배치 (캐러셀용)
// Code Data System 연동: 품목 코드, 밴드 표시
import { useState } from 'react'
import type { RegisteredCargo } from '../../../../types/models'
import { getItemByCode } from '../../../../data/itemCodes'
// 기존 호환용 (deprecated)
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
  // Code Data System: 품목 코드 사용
  const item = cargo.itemCode ? getItemByCode(cargo.itemCode) : undefined

  // 기존 호환용 fallback
  const category = !item ? PRODUCT_CATEGORIES.find(c => c.code === cargo.productCategory) : undefined
  const weightRange = WEIGHT_RANGES.find(w => w.value === cargo.weightRange)

  // 표시 문자열
  const moduleLabel = cargo.moduleType === 'UNCLASSIFIED' ? '비표준' : cargo.moduleType
  const itemLabel = item ? item.label : (category?.name || '미지정')
  const weightLabel = cargo.weightKg !== undefined
    ? `${cargo.weightKg}kg`
    : (weightRange?.label || '-')

  if (compact) {
    // 캐러셀용 컴팩트 카드 - 타이틀 아래 배치, 크기 확대
    return (
      <div className="flex-shrink-0 w-[68px] mt-6 p-1.5 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-300/80 shadow-sm">
        {/* 순번 + 삭제 */}
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold text-slate-700">{index + 1}</span>
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(cargo.id)
              }}
              className="text-[9px] text-slate-400 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        {/* 세로 정보 - 모듈/품목/중량 모두 표시 */}
        <div className="space-y-0.5 text-center">
          <div className="text-[10px] font-semibold text-slate-800 truncate leading-tight">
            {moduleLabel}
          </div>
          {/* 품목 코드 표시 */}
          {cargo.itemCode && (
            <div className="text-[8px] text-slate-400 font-mono">{cargo.itemCode}</div>
          )}
          <div className="text-[9px] text-slate-600 truncate leading-tight">
            {item ? item.label.split('/')[0].split('(')[0] : (category?.name || '')}
          </div>
          {/* 밴드 표시 */}
          <div className="flex justify-center gap-0.5">
            {cargo.weightBand && (
              <span className="text-[8px] px-0.5 bg-slate-100 rounded text-slate-500">
                {cargo.weightBand}
              </span>
            )}
            {cargo.sizeBand && (
              <span className="text-[8px] px-0.5 bg-slate-100 rounded text-slate-500">
                {cargo.sizeBand}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-shrink-0 w-[90px] h-full py-2 px-2 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/80 shadow-sm">
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

        {/* 품목 코드 (작게) */}
        {cargo.itemCode && (
          <div className="text-[9px] text-slate-400 font-mono">{cargo.itemCode}</div>
        )}

        {/* 품목명 */}
        <div className="text-[10px] text-slate-600 truncate">
          {itemLabel}
        </div>

        {/* 중량 */}
        <div className="text-[10px] text-slate-500">
          {weightLabel}
        </div>

        {/* 밴드 표시 */}
        <div className="flex justify-center gap-1 mt-1">
          {cargo.weightBand && (
            <span className="text-[8px] px-1 py-0.5 bg-slate-100 rounded text-slate-500">
              {cargo.weightBand}
            </span>
          )}
          {cargo.sizeBand && (
            <span className="text-[8px] px-1 py-0.5 bg-slate-100 rounded text-slate-500">
              {cargo.sizeBand}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// 캐러셀 컨테이너 컴포넌트 - 콘텐츠만 (추가 버튼은 GridCell headerAction으로 이동)
interface CargoCarouselProps {
  cargos: RegisteredCargo[]
  onRemove: (cargoId: string) => void
}

export function CargoCarousel({
  cargos,
  onRemove,
}: CargoCarouselProps) {
  const [page, setPage] = useState(0)
  const itemsPerPage = 3
  const totalPages = Math.max(1, Math.ceil(cargos.length / itemsPerPage))

  const visibleCargos = cargos.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
  const hasMore = totalPages > 1

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPage((prev) => (prev + 1) % totalPages)
  }

  const handlePrevPage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  if (cargos.length === 0) {
    return (
      <span className="text-slate-400 text-xs">화물을 추가해주세요</span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {/* 이전 페이지 버튼 */}
      {page > 0 && (
        <button
          onClick={handlePrevPage}
          className="flex-shrink-0 mt-6 w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* 카드들 - 좌측 정렬 (justify-start) */}
      <div className="flex items-center justify-start gap-1 flex-1">
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

      {/* 다음 페이지 버튼 */}
      {hasMore && page < totalPages - 1 && (
        <button
          onClick={handleNextPage}
          className="flex-shrink-0 mt-6 w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 transition-colors"
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
}

export function CargoAddButton({ onClick }: CargoAddButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="text-[10px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors"
    >
      +추가
    </button>
  )
}
