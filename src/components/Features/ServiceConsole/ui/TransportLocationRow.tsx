import type { TransportCondition } from '../../../../types/models'
import { GridCell, ResetButton } from '../ui'
import { getLocationName } from '../utils/tabSectionUtils'

interface TransportLocationRowProps {
  transportCondition: TransportCondition
  onOpenOrigin: () => void
  onOpenDestination: () => void
  onSwap: () => void
  onResetTransportCondition?: () => void
}

export function TransportLocationRow({
  transportCondition,
  onOpenOrigin,
  onOpenDestination,
  onSwap,
  onResetTransportCondition,
}: TransportLocationRowProps) {
  return (
    <div className="flex items-stretch gap-1 min-h-0">
      {/* 출발지 */}
      <div className="flex-1">
        <GridCell
          label="출발지"
          icon="origin"
          onClick={onOpenOrigin}
          headerAction={
            <ResetButton
              onClick={() => onResetTransportCondition?.()}
              disabled={!transportCondition.originCode && !transportCondition.destinationCode && !transportCondition.transportDate}
            />
          }
        >
          {transportCondition.originCode ? (
            <span className="text-sm font-medium">{getLocationName(transportCondition.originCode)}</span>
          ) : (
            <span className="text-slate-400 text-xs">선택</span>
          )}
        </GridCell>
      </div>

      {/* 양방향 화살표 버튼 */}
      <button
        onClick={onSwap}
        className="flex-shrink-0 w-7 flex items-center justify-center text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
        title="출발지/도착지 교환"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>

      {/* 도착지 */}
      <div className="flex-1">
        <GridCell
          label="도착지"
          icon="destination"
          onClick={onOpenDestination}
        >
          {transportCondition.destinationCode ? (
            <span className="text-sm font-medium">{getLocationName(transportCondition.destinationCode)}</span>
          ) : (
            <span className="text-slate-400 text-xs">선택</span>
          )}
        </GridCell>
      </div>
    </div>
  )
}
