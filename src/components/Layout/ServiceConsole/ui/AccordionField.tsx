// 아코디언 필드 컴포넌트
import type { ReactNode } from 'react'

export interface AccordionFieldProps {
  id: string
  label: string
  placeholder: string
  expanded: boolean
  onToggle: () => void
  summary?: string
  children?: ReactNode
}

export default function AccordionField({
  label,
  placeholder,
  expanded,
  onToggle,
  summary,
  children,
}: AccordionFieldProps) {
  return (
    <div
      className={`border rounded-xl transition-all cursor-pointer ${
        expanded
          ? 'border-slate-400 bg-white shadow-md'
          : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-slate-400'
      }`}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="text-slate-400">
            {expanded ? '▲' : '▼'}
          </span>
        </div>

        {expanded && (
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            {children || (
              <input
                type="text"
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            )}
          </div>
        )}

        {!expanded && (
          <div className="mt-1 text-xs text-slate-400">
            {summary || placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
