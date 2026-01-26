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
}: GridCellProps) {
  const colors = colorStyles[colorScheme]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-3 rounded-xl border-2 text-left transition-all
        ${tall ? 'min-h-[140px]' : 'min-h-[80px]'}
        ${colors.border} ${colors.bg}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
        ${className}
      `}
    >
      {/* 라벨 + 이모지 (좌상단) */}
      <div className="flex items-center gap-1.5 mb-2">
        {emoji && <span className="text-lg">{emoji}</span>}
        <span className={`text-sm font-bold ${colors.label}`}>{label}</span>
      </div>

      {/* 콘텐츠 (중앙 정렬) */}
      <div className="flex items-center justify-center text-base font-medium text-slate-800 min-h-[40px]">
        {children}
      </div>
    </button>
  )
}
