import type { ServiceOrder } from '../../../../../types/models'

export type BothModalTab = 'integrated' | 'storage' | 'transport'

interface BothTabHeaderProps {
  bothTab: BothModalTab
  onTabChange: (tab: BothModalTab) => void
  effectiveOrder: ServiceOrder
}

export function BothTabHeader({ bothTab, onTabChange, effectiveOrder }: BothTabHeaderProps) {
  return (
    <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
      <button
        onClick={() => onTabChange('integrated')}
        className={`flex-1 py-3 text-sm font-medium transition-colors ${
          bothTab === 'integrated'
            ? 'text-teal-700 border-b-2 border-teal-700'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        연계
      </button>
      {effectiveOrder === 'storage-first' ? (
        <>
          <button
            onClick={() => onTabChange('storage')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              bothTab === 'storage'
                ? 'text-teal-700 border-b-2 border-teal-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            보관
          </button>
          <button
            onClick={() => onTabChange('transport')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              bothTab === 'transport'
                ? 'text-teal-700 border-b-2 border-teal-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            운송
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => onTabChange('transport')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              bothTab === 'transport'
                ? 'text-teal-700 border-b-2 border-teal-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            운송
          </button>
          <button
            onClick={() => onTabChange('storage')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              bothTab === 'storage'
                ? 'text-teal-700 border-b-2 border-teal-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            보관
          </button>
        </>
      )}
    </div>
  )
}
