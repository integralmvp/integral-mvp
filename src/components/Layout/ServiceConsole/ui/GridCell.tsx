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
        relative w-full h-full min-h-0 p-2 text-left transition-all overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
        ${className}
      `}
      style={{
        background: 'rgba(22, 22, 32, 0.8)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        boxShadow: disabled ? 'none' : 'inset 0 0 10px rgba(0, 240, 255, 0.05)',
      }}
    >
      {/* 콘텐츠 영역 - 전체 칸 기준 수직/수평 중앙 정렬 */}
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-cyber-text px-2">
        {children}
      </div>

      {/* 헤더: 아이콘 + 라벨 (좌상단 오버레이) + 액션 버튼 (우상단) */}
      <div className="absolute top-1.5 left-2 right-2 flex items-center justify-between z-10">
        <div
          className="flex items-center gap-1 px-1.5 py-0.5"
          style={{
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
          }}
        >
          {iconSrc && (
            <img
              src={iconSrc}
              alt={label}
              className="w-4 h-4 object-contain"
              style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(150deg)' }}
            />
          )}
          <span className="text-[11px] font-semibold text-cyber-cyan">{label}</span>
        </div>
        {headerAction && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
            }}
          >
            {headerAction}
          </div>
        )}
      </div>
    </button>
  )
}
