import type { RegisteredCargo, StorageCondition, TransportCondition } from '../../../../../types/models'
import type { ServiceType } from '../../hooks/useServiceConsoleState'

interface DealCargoSummaryProps {
  activeTab: ServiceType
  registeredCargos: RegisteredCargo[]
  totalCubes: number
  totalPallets: number
  storageCondition: StorageCondition
  transportCondition: TransportCondition
}

export function DealCargoSummary({
  activeTab,
  registeredCargos,
  totalCubes,
  totalPallets,
  storageCondition,
  transportCondition,
}: DealCargoSummaryProps) {
  return (
    <section>
      <h3 className="text-lg font-bold text-slate-900 mb-3">화물 정보 및 조건</h3>
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-700 font-medium">등록 화물</span>
          <span className="text-teal-700 font-bold">{registeredCargos.length}건</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-700 font-medium">총 물량</span>
          <span className="text-teal-700 font-bold">
            {totalCubes} 큐브 ({totalPallets} 팔레트)
          </span>
        </div>
        {(activeTab === 'storage' || activeTab === 'both') && storageCondition.location && (
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-medium">보관 장소</span>
            <span className="text-slate-900">{storageCondition.location}</span>
          </div>
        )}
        {(activeTab === 'transport' || activeTab === 'both') && transportCondition.origin && (
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-medium">운송 경로</span>
            <span className="text-slate-900">
              {transportCondition.origin} → {transportCondition.destination}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
