import type { ServiceType } from '../hooks/useServiceConsoleState'
import type { RegulationSummary } from '../../../../layers/matching/regulation'

const TAB_HEADERS: Record<ServiceType, { title: string; subtitle: string }> = {
  storage: {
    title: '공간상품',
    subtitle: '원하는 조건의 공간상품을 한 눈에 비교하고 선택하세요.',
  },
  transport: {
    title: '경로상품',
    subtitle: '원하는 조건의 경로상품을 한 눈에 비교하고 선택하세요.',
  },
  both: {
    title: '공간+경로 연계 상품',
    subtitle: '원하는 조건에 맞춰, 보관과 운송을 한 번에',
  },
}

interface SearchResultModalHeaderProps {
  activeTab: ServiceType
  totalCount: number
  summary: RegulationSummary | null
  onClose: () => void
}

export function SearchResultModalHeader({
  activeTab,
  totalCount,
  summary,
  onClose,
}: SearchResultModalHeaderProps) {
  const header = TAB_HEADERS[activeTab]
  return (
    <div className="bg-teal-700 text-white p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{header.title}</h2>
          <p className="text-teal-200 text-sm mt-1">{header.subtitle}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-2xl leading-none p-1"
        >
          ×
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
          {totalCount}건의 상품
        </span>
        {summary && summary.failedCount > 0 && (
          <span className="text-teal-200 text-xs">
            (조건 불일치 {summary.failedCount}건 제외)
          </span>
        )}
      </div>
    </div>
  )
}
