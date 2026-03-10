import type { StorageCondition, TransportCondition, RegisteredCargo, ServiceOrder } from '../../../../types/models'
import type { ServiceType } from '../hooks/useServiceConsoleState'

// storageCondition.location / transportCondition.origin·destination은 이미 표시용 이름(display name)을 저장
// RegionCode 기반 필터링은 매칭 파이프라인에서 수행됨
const getLocationName = (displayName?: string): string => {
  return displayName || '전체'
}

interface SearchConditionSummaryProps {
  activeTab: ServiceType
  registeredCargos: RegisteredCargo[]
  totalCubes: number
  totalPallets: number
  storageCondition: StorageCondition
  transportCondition: TransportCondition
  serviceOrder?: ServiceOrder
}

export function SearchConditionSummary({
  activeTab,
  registeredCargos,
  totalCubes,
  totalPallets,
  storageCondition,
  transportCondition,
  serviceOrder,
}: SearchConditionSummaryProps) {
  // 자동 연계 날짜 계산 (보관+운송 탭에서 사용)
  const effectiveOrder = serviceOrder || 'storage-first'

  // 보관 시작일: transport-first인 경우 운송일과 연동
  const effectiveStorageStartDate = activeTab === 'both' && effectiveOrder === 'transport-first' && transportCondition.transportDate
    ? transportCondition.transportDate
    : storageCondition.startDate

  // 운송일: storage-first인 경우 보관 종료일과 연동
  const effectiveTransportDate = activeTab === 'both' && effectiveOrder === 'storage-first' && storageCondition.endDate
    ? storageCondition.endDate
    : transportCondition.transportDate

  return (
    <div className="bg-slate-50 rounded-xl p-4 mb-4">
      <div className="text-xs font-semibold text-slate-500 mb-2">입력 조건 요약</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* 화물 정보 */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-400 mb-1">화물</div>
          <div className="font-medium text-slate-900">
            {registeredCargos.length > 0
              ? `${registeredCargos.length}건 등록`
              : '미등록'}
          </div>
        </div>

        {/* 물량 */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-400 mb-1">물량</div>
          <div className="font-medium text-slate-900">
            {totalCubes > 0
              ? activeTab === 'storage'
                ? `${totalPallets} 파레트`
                : activeTab === 'transport'
                  ? `${totalCubes} 큐브`
                  : `${totalPallets} 파레트 / ${totalCubes} 큐브`
              : '-'}
          </div>
        </div>

        {/* 보관 조건 */}
        {(activeTab === 'storage' || activeTab === 'both') && (
          <>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-400 mb-1">보관 장소</div>
              <div className="font-medium text-slate-900">
                {getLocationName(storageCondition.location)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-400 mb-1">보관 기간</div>
              <div className="font-medium text-slate-900">
                {effectiveStorageStartDate && storageCondition.endDate
                  ? `${effectiveStorageStartDate} ~ ${storageCondition.endDate}`
                  : effectiveStorageStartDate || storageCondition.endDate || '-'}
              </div>
            </div>
          </>
        )}

        {/* 운송 조건 */}
        {(activeTab === 'transport' || activeTab === 'both') && (
          <>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-400 mb-1">출발지 → 도착지</div>
              <div className="font-medium text-slate-900">
                {transportCondition.origin && transportCondition.destination
                  ? `${getLocationName(transportCondition.origin)} → ${getLocationName(transportCondition.destination)}`
                  : getLocationName(transportCondition.origin) || getLocationName(transportCondition.destination) || '전체'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-400 mb-1">운송일</div>
              <div className="font-medium text-slate-900">
                {effectiveTransportDate || '-'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
