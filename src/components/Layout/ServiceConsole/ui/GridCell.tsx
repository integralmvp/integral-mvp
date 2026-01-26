// 그리드 셀 컴포넌트 - 클릭 시 모달/시트 호출용
// 아이콘 이미지 사용, 블랙/그레이 통일 스타일
import type { ReactNode } from 'react'

// 아이콘 이미지 import
import cargoIcon from '../../../../assets/icons/console/cargo.svg'
import volumeIcon from '../../../../assets/icons/console/volume.svg'
import locationIcon from '../../../../assets/icons/console/location.svg'
import calendarIcon from '../../../../assets/icons/console/calendar.svg'
import originIcon from '../../../../assets/icons/console/origin.svg'
import destinationIcon from '../../../../assets/icons/console/destination.svg'

// 아이콘 타입 매핑
const iconMap: Record<string, string> = {
  cargo: cargoIcon,
  volume: volumeIcon,
  location: locationIcon,
  calendar: calendarIcon,
  origin: originIcon,
  destination: destinationIcon,
}

interface GridCellProps {
  label: string
  icon?: 'cargo' | 'volume' | 'location' | 'calendar' | 'origin' | 'destination'
  onClick?: () => void
  children?: ReactNode
  className?: string
  disabled?: boolean
  // 타이틀 우측 상단 액션 버튼
  headerAction?: ReactNode
}

export default function GridCell({
  label,
  icon,
  onClick,
  children,
  className = '',
  disabled = false,
  headerAction,
}: GridCellProps) {
  const iconSrc = icon ? iconMap[icon] : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full h-full min-h-0 p-2 rounded-2xl border border-slate-200/80 text-left transition-all overflow-hidden
        bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
        ${className}
      `}
    >
      {/* 콘텐츠 영역 - 전체 칸 기준 수직/수평 중앙 정렬 */}
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-800 px-2">
        {children}
      </div>

      {/* 헤더: 아이콘 + 라벨 (좌상단 오버레이) + 액션 버튼 (우상단) */}
      <div className="absolute top-1.5 left-2 right-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 shadow-sm">
          {iconSrc && (
            <img
              src={iconSrc}
              alt={label}
              className="w-4 h-4 object-contain"
            />
          )}
          <span className="text-[11px] font-semibold text-slate-700">{label}</span>
        </div>
        {headerAction && (
          <div onClick={(e) => e.stopPropagation()} className="bg-white/90 backdrop-blur-sm rounded-md shadow-sm">
            {headerAction}
          </div>
        )}
      </div>
    </button>
  )
}
