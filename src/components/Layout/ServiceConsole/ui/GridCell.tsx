// 그리드 셀 컴포넌트 - 클릭 시 모달/시트 호출용
import type { ReactNode } from 'react'

interface GridCellProps {
  label: string
  onClick?: () => void
  children?: ReactNode
  className?: string
  disabled?: boolean
  colorScheme?: 'blue' | 'emerald' | 'purple' | 'slate'
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
  onClick,
  children,
  className = '',
  disabled = false,
  colorScheme = 'slate',
}: GridCellProps) {
  const colors = colorStyles[colorScheme]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full min-h-[80px] p-3 rounded-xl border-2 text-left transition-all
        ${colors.border} ${colors.bg}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
        ${className}
      `}
    >
      <div className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${colors.label}`}>
        {label}
      </div>
      <div className="text-sm text-slate-800">
        {children}
      </div>
    </button>
  )
}
