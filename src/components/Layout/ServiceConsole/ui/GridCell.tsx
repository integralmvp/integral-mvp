// 그리드 셀 컴포넌트 - 클릭 시 모달/시트 호출용
import type { ReactNode } from 'react'

interface GridCellProps {
  label: string
  emoji?: string
  onClick?: () => void
  children?: ReactNode
  className?: string
  disabled?: boolean
  colorScheme?: 'blue' | 'emerald' | 'purple' | 'slate'
  // 1행 화물/물량 칸용 확장 높이
  tall?: boolean
  // 타이틀 우측 상단 액션 버튼
  headerAction?: ReactNode
}

const colorStyles = {
  blue: {
    border: 'border-blue-200 hover:border-blue-400',
    label: 'text-blue-600',
    bg: 'bg-blue-50/50',
  },
  emerald: {
    border: 'border-emerald-200 hover:border-emerald-400',
    label: 'text-emerald-600',
    bg: 'bg-emerald-50/50',
  },
  purple: {
    border: 'border-purple-200 hover:border-purple-400',
    label: 'text-purple-600',
    bg: 'bg-purple-50/50',
  },
  slate: {
    border: 'border-slate-200 hover:border-slate-400',
    label: 'text-slate-600',
    bg: 'bg-slate-50/50',
  },
}

export default function GridCell({
  label,
  emoji,
  onClick,
  children,
  className = '',
  disabled = false,
  colorScheme = 'slate',
  tall = false,
  headerAction,
}: GridCellProps) {
  const colors = colorStyles[colorScheme]

  // 높이: tall=80px (1행 화물/물량), 기본=52px (2,3행)
  const heightClass = tall ? 'h-[80px]' : 'h-[52px]'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full ${heightClass} p-2 rounded-xl border-2 text-left transition-all overflow-hidden
        ${colors.border} ${colors.bg}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
        ${className}
      `}
    >
      {/* 콘텐츠 영역 - 전체 칸 기준 수직/수평 중앙 정렬 */}
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-800 px-2">
        {children}
      </div>

      {/* 헤더: 라벨 + 이모지 (좌상단 오버레이) + 액션 버튼 (우상단) */}
      <div className="absolute top-1 left-1.5 right-1.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-0.5 bg-white/80 rounded px-1">
          {emoji && <span className="text-[10px]">{emoji}</span>}
          <span className={`text-[9px] font-bold ${colors.label}`}>{label}</span>
        </div>
        {headerAction && (
          <div onClick={(e) => e.stopPropagation()} className="bg-white/80 rounded">
            {headerAction}
          </div>
        )}
      </div>
    </button>
  )
}
